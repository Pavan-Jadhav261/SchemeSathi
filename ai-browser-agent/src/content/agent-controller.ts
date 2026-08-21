import { extractPageElements, getElement } from "./dom-analyzer"
import { AgentOverlay } from "./overlay"
import type { AgentPlan, AgentSession, AgentStatus, ExtensionMessage } from "../shared/types"

type SpeechRecognitionConstructor = new () => SpeechRecognition
type SpeechRecognition = EventTarget & { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: SpeechRecognitionEvent) => void) | null; onend: (() => void) | null }
type SpeechRecognitionEvent = Event & { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } } }
const incompleteEndings = /\b(to|for|with|about|and|or|the|a|an|my|i|please|can you|how do i|where do i|help me)\s*$/i
const sensitivePattern = /password|passcode|otp|aadhaar|aadhar|bank|card|cvv|account/i

export class AgentController {
  private overlay = new AgentOverlay()
  private status: AgentStatus = "IDLE"
  private session: AgentSession = { active: false, goal: "", language: "en-IN", listening: false, history: [] }
  private lastUrl = location.href
  private recognition?: SpeechRecognition
  private pauseTimer?: number
  private navigationSilenceTimer?: number
  private transcript = ""
  private finalTranscript = ""
  private cursor = { x: innerWidth / 2, y: innerHeight / 2 }
  private finishingTranscript = false
  private sendingRequest = false
  private pendingField?: HTMLInputElement | HTMLTextAreaElement
  private dropCleanup?: () => void
  private replacingRecognition = false
  private awaitingDrop = false

  constructor() {
    document.addEventListener("mousemove", (event) => { this.cursor = { x: event.clientX, y: event.clientY }; this.overlay.followCursor(event.clientX, event.clientY) }, { passive: true })
    document.addEventListener("click", () => { if (this.status === "GUIDING") this.overlay.returnToCursor(this.cursor.x, this.cursor.y) }, true)
    window.addEventListener("popstate", () => this.pageChanged())
    new MutationObserver(() => { if (location.href !== this.lastUrl) this.pageChanged() }).observe(document.documentElement, { childList: true, subtree: true })
    void this.restoreSession()
  }

  private async restoreSession() {
    this.session = await chrome.runtime.sendMessage({ type: "GET_AGENT_SESSION" } satisfies ExtensionMessage) as AgentSession
    if (!this.session.active) return
    this.overlay.mount(); this.overlay.setActive(true); this.overlay.followCursor(this.cursor.x, this.cursor.y)
    if (this.session.awaitingNavigation) { window.setTimeout(() => this.startListening(true), 650); return }
    if (this.session.listening) { window.setTimeout(() => this.startListening(), 450); return }
    this.update("THINKING", "Continuing guidance on this page…")
    if (this.session.goal) window.setTimeout(() => void this.ask(this.session.goal, true), 500)
  }

  receive(message: ExtensionMessage) {
    if (message.type === "ACTIVATE_AGENT") { this.activate(message.text); return }
    if (message.type === "USER_REQUEST") { void this.ask(message.text); return }
    if (message.type === "START_LISTENING") { this.startListening(); return }
    if (message.type === "SET_LANGUAGE") { this.session.language = message.language; this.persist(); return }
    if (message.type === "STOP_AGENT") this.stop()
  }

  private persist() { chrome.runtime.sendMessage({ type: "SAVE_AGENT_SESSION", session: this.session } satisfies ExtensionMessage) }
  private update(status: AgentStatus, detail: string) { this.status = status; this.overlay.setThinking(status === "THINKING"); chrome.runtime.sendMessage({ type: "STATUS", status, detail }) }
  private activate(initialGoal?: string) { this.session.active = true; this.session.listening = false; this.session.awaitingNavigation = false; this.persist(); this.overlay.mount(); this.overlay.setActive(true); this.overlay.followCursor(this.cursor.x, this.cursor.y); if (initialGoal?.trim()) void this.ask(initialGoal); else this.startListening() }

  private startListening(afterNavigation = false) {
    if (!this.session.active) { this.activate(); return }
    const browserWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    const SpeechRecognitionApi = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
    if (!SpeechRecognitionApi) { this.update("ERROR", "Voice input is unavailable here. Type your request in the popup."); return }
    this.finishingTranscript = false; window.clearTimeout(this.navigationSilenceTimer); if (this.recognition) { this.replacingRecognition = true; this.recognition.stop() }; this.transcript = ""; this.finalTranscript = ""; this.session.listening = true; this.session.awaitingNavigation = afterNavigation; this.persist()
    this.recognition = new SpeechRecognitionApi(); this.recognition.continuous = true; this.recognition.interimResults = true; this.recognition.lang = this.session.language === "mixed" ? "hi-IN" : this.session.language
    const listeningText = this.awaitingDrop ? "I’m still listening. Drag the answer card into the highlighted field when you are ready." : this.pendingField ? `Please say your ${this.fieldLabel(this.pendingField)}.` : afterNavigation ? "Say what you need next, or stay quiet and I’ll continue your task." : "Start speaking — your words will appear here."
    this.overlay.setListening(true); this.overlay.showTranscript(listeningText, "Listening live"); this.update("LISTENING", listeningText)
    if (afterNavigation) this.navigationSilenceTimer = window.setTimeout(() => this.continueAfterSilence(), 2000)
    this.recognition.onresult = (event) => {
      window.clearTimeout(this.navigationSilenceTimer); this.session.awaitingNavigation = false; this.persist(); let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) { const spoken = event.results[i][0].transcript; if (event.results[i].isFinal) this.finalTranscript += spoken; else interim += spoken }
      this.transcript = `${this.finalTranscript} ${interim}`.replace(/\s+/g, " ").trim(); this.overlay.showTranscript(this.transcript || listeningText, "Listening live"); if (this.awaitingDrop) return; window.clearTimeout(this.pauseTimer); this.pauseTimer = window.setTimeout(() => this.finishTranscript(), 1200)
    }
    this.recognition.onend = () => { this.overlay.setListening(false); if (this.replacingRecognition) { this.replacingRecognition = false; return }; if (!this.session.active || this.finishingTranscript) return; if (this.transcript) { this.finishTranscript(); return }; window.setTimeout(() => { if (this.session.active && !this.finishingTranscript) this.startListening(afterNavigation) }, 300) }
    this.recognition.start()
  }

  private continueAfterSilence() { if (!this.session.active || !this.session.awaitingNavigation || this.transcript) return; this.session.awaitingNavigation = false; this.persist(); this.overlay.showTranscript("No new request heard. Continuing your task on this page.", "Continuing"); if (this.session.goal) void this.ask(this.session.goal, true) }

  private finishTranscript() {
    if (this.finishingTranscript || this.sendingRequest) return
    window.clearTimeout(this.pauseTimer)
    const request = this.transcript.trim()
    if (!request || (!this.pendingField && (request.split(/\s+/).length < 2 || incompleteEndings.test(request)))) { const message = "I didn’t catch a complete answer. Please say it again."; this.overlay.showTranscript(message, "Try again"); this.update("LISTENING", message); this.speak(message, true); return }
    this.finishingTranscript = true; this.recognition?.stop(); this.session.listening = false; this.persist(); this.overlay.clearTranscript(); this.transcript = ""; this.finalTranscript = ""
    if (this.pendingField) { this.captureFieldAnswer(this.extractFieldValue(request, this.pendingField)); return }
    this.sendingRequest = true; void this.ask(request).finally(() => { this.sendingRequest = false })
  }

  private async ask(text: string, continuing = false) {
    if (!text.trim() || !this.session.active) return
    if (!continuing) { this.session.goal = text.trim(); this.session.history = [...(this.session.history || []), this.session.goal].slice(-8) }
    this.session.awaitingNavigation = false; this.persist(); this.overlay.mount(); this.overlay.setActive(true); this.update("THINKING", "Understanding this page…")
    let page = extractPageElements(); if (!page.elements.length) { await new Promise((resolve) => window.setTimeout(resolve, 900)); page = extractPageElements() }
    const response = await chrome.runtime.sendMessage({ type: "PLAN_REQUEST", request: this.session.goal, page, goal: this.session.goal, language: this.session.language, history: this.session.history } satisfies ExtensionMessage) as { ok: boolean; plan?: AgentPlan; error?: string }
    if (!response.ok || !response.plan) { this.overlay.showTranscript(response.error || "I couldn’t create a safe navigation plan.", "Unable to guide"); this.update("ERROR", response.error || "I couldn’t create a safe navigation plan."); return }
    this.guide(response.plan)
  }

  private guide(plan: AgentPlan) {
    const action = plan.nextAction
    if (action.action === "input" && action.elementId) { const target = getElement(action.elementId); if (this.isSafeTextField(target)) { void this.beginField(target); return } }
    if (!action.elementId || action.action === "none") { this.overlay.showTranscript(plan.response, "Guide"); this.update("GUIDING", plan.response); this.speak(plan.response, true); return }
    const target = getElement(action.elementId)
    if (!target) { this.overlay.showTranscript("The page changed before I could locate that control.", "Page updated"); this.update("ERROR", "The page changed before I could locate that control."); return }
    void this.overlay.pointTo(target, action.instruction); this.overlay.showTranscript(action.spokenInstruction, "Next step"); this.update("GUIDING", action.spokenInstruction); this.speak(action.spokenInstruction)
  }

  private isSafeTextField(element: HTMLElement | null | undefined): element is HTMLInputElement | HTMLTextAreaElement { if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) || element.disabled || element.readOnly) return false; const type = element instanceof HTMLInputElement ? element.type.toLowerCase() : "textarea"; return !["hidden", "password", "file", "checkbox", "radio", "submit", "button", "reset", "image"].includes(type) && !sensitivePattern.test(`${this.fieldLabel(element)} ${element.name} ${element.id}`) }
  private fieldLabel(field: HTMLInputElement | HTMLTextAreaElement) { const labelledBy = (field.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" "); const labels = field.labels ? Array.from(field.labels).map((label) => label.textContent || "").join(" ") : ""; return (field.getAttribute("aria-label") || labelledBy || labels || field.placeholder || field.name || "details").replace(/\s+/g, " ").trim() }
  private extractFieldValue(spoken: string, field: HTMLInputElement | HTMLTextAreaElement) { const label = this.fieldLabel(field).toLowerCase(); const aliases = new Set([label, label.replace(/^full\s+/, ""), label.includes("name") ? "name" : "", label.includes("district") ? "district" : "", label.includes("email") ? "email" : "", label.includes("phone") || label.includes("mobile") ? "phone number" : ""]); const pattern = Array.from(aliases).filter(Boolean).map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")).join("|"); const answer = pattern ? spoken.replace(new RegExp(`^\\s*(?:(?:my|the)\\s+)?(?:${pattern})\\s*(?:is|equals|=|:)\\s*`, "i"), "") : spoken; return answer.replace(/^\s*[,:-]\s*|\s*[.!?]+\s*$/g, "").trim() || spoken.trim() }

  private async beginField(field: HTMLInputElement | HTMLTextAreaElement) {
    this.dropCleanup?.(); this.pendingField = field; this.overlay.mount(); await this.overlay.pointTo(field, "Say the requested detail. I will place it in your answer panel.")
    const question = `What is your ${this.fieldLabel(field)}?`; this.overlay.showTranscript(question, "Form assistant"); this.update("GUIDING", question); this.speak(question, true)
  }

  private captureFieldAnswer(value: string) {
    const field = this.pendingField
    if (!field) return
    const label = this.fieldLabel(field); this.awaitingDrop = true; this.overlay.showCapturedValue(label, value); this.attachDropTarget(field, value)
    const message = `Your ${label} is ready on the right. Drag it to the highlighted field. I will keep listening until you stop the agent.`; this.overlay.showTranscript(message, "Ready to drop"); this.update("GUIDING", message); this.speak(message, true)
  }

  private attachDropTarget(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
    this.dropCleanup?.()
    const allowDrop = (event: Event) => { event.preventDefault(); const dragEvent = event as DragEvent; if (dragEvent.dataTransfer) dragEvent.dataTransfer.dropEffect = "copy" }
    const drop = (event: Event) => { event.preventDefault(); const dropped = (event as DragEvent).dataTransfer?.getData("text/plain") || value; this.setFieldValue(field, dropped); this.dropCleanup?.(); this.dropCleanup = undefined; this.pendingField = undefined; this.awaitingDrop = false; this.overlay.clear(); const next = this.nextEmptyField(); if (next) void this.beginField(next); else { const done = "All safe text fields are ready. Review the form before submitting it."; this.overlay.showTranscript(done, "Form assistant"); this.update("GUIDING", done); this.speak(done, true) } }
    field.addEventListener("dragover", allowDrop); field.addEventListener("drop", drop)
    this.dropCleanup = () => { field.removeEventListener("dragover", allowDrop); field.removeEventListener("drop", drop) }
  }

  private setFieldValue(field: HTMLInputElement | HTMLTextAreaElement, value: string) { const descriptor = Object.getOwnPropertyDescriptor(field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value"); descriptor?.set?.call(field, value); field.dispatchEvent(new Event("input", { bubbles: true })); field.dispatchEvent(new Event("change", { bubbles: true })); field.focus() }
  private nextEmptyField() { return Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input,textarea")).find((candidate) => this.isSafeTextField(candidate) && !candidate.value.trim()) }

  private pageChanged() { this.lastUrl = location.href; if (this.session.active && this.session.goal) { this.overlay.clear(); this.session.awaitingNavigation = true; this.persist(); if (this.session.listening) { window.clearTimeout(this.navigationSilenceTimer); this.overlay.showTranscript("Say what you need next, or stay quiet and I’ll continue your task.", "Listening live"); this.update("LISTENING", "Page changed — listening for your next instruction."); this.navigationSilenceTimer = window.setTimeout(() => this.continueAfterSilence(), 2000); return }; window.setTimeout(() => this.startListening(true), 650) } }
  private speak(text: string, resumeListening = false) { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); const speechLanguage = this.session.language === "mixed" ? "hi-IN" : this.session.language; utterance.lang = speechLanguage; const voice = speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(speechLanguage.slice(0, 2).toLowerCase())); if (voice) utterance.voice = voice; if (resumeListening) utterance.onend = () => { if (this.session.active) window.setTimeout(() => this.startListening(), 350) }; speechSynthesis.speak(utterance) }
  private stop() { this.finishingTranscript = true; this.awaitingDrop = false; window.clearTimeout(this.navigationSilenceTimer); this.recognition?.stop(); this.dropCleanup?.(); speechSynthesis.cancel(); this.session = { ...this.session, active: false, goal: "", listening: false, awaitingNavigation: false }; this.persist(); this.overlay.returnToCursor(this.cursor.x, this.cursor.y); this.overlay.clearValues(); this.overlay.setActive(false); this.overlay.hideTranscript(); this.update("STOPPED", "Agent stopped for this website tab.") }
}
