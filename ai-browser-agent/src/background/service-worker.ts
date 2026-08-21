import type { AgentPlan, AgentSession, ExtensionMessage } from "../shared/types"

const API_URL = import.meta.env.VITE_AGENT_BACKEND_URL || "http://localhost:3000/api/browser-agent/plan"

const sessionKey = (tabId: number) => `guide-dot-session:${tabId}`

chrome.tabs.onRemoved.addListener((tabId) => { void chrome.storage.session.remove(sessionKey(tabId)) })

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  const tabId = sender.tab?.id
  if (message.type === "GET_AGENT_SESSION") {
    if (!tabId) { sendResponse({ active: false, goal: "", language: "en-IN", listening: false } satisfies AgentSession); return }
    void chrome.storage.session.get(sessionKey(tabId)).then((data) => sendResponse((data[sessionKey(tabId)] as AgentSession | undefined) || { active: false, goal: "", language: "en-IN", listening: false }))
    return true
  }
  if (message.type === "SAVE_AGENT_SESSION") {
    if (tabId) void chrome.storage.session.set({ [sessionKey(tabId)]: message.session })
    return
  }
  if (message.type !== "PLAN_REQUEST") return
  void fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userRequest: message.request, page: message.page, session: { goal: message.goal || message.request, language: message.language, history: message.history || [] } }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("The navigation service is unavailable.")
      return (await response.json()).plan as AgentPlan
    })
    .then((plan) => sendResponse({ ok: true, plan }))
    .catch((error: unknown) => sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unable to plan the next step." }))
  return true
})
