import type { PageElement, PageState } from "../shared/types"

const selector = "button,a,input,select,textarea,label,summary,[role='button'],[role='link'],[role='tab'],[role='menuitem'],[role='option'],[onclick],[tabindex]:not([tabindex='-1'])"
const sensitivePattern = /password|passcode|otp|aadhaar|aadhar|bank|card|cvv|account/i
let count = 0
const registry = new Map<string, HTMLElement>()

function visible(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0 && style.pointerEvents !== "none"
}

function accessibleText(element: HTMLElement) {
  const input = element as HTMLInputElement
  const labelledBy = (element.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ")
  const labels = input.labels ? Array.from(input.labels).map((label) => label.textContent || "").join(" ") : ""
  return (element.getAttribute("aria-label") || labelledBy || labels || element.innerText || element.getAttribute("title") || element.getAttribute("placeholder") || input.value || "").replace(/\s+/g, " ").trim().slice(0, 180)
}

// Many public-service portals use clickable divs instead of native buttons.
// Detect only elements which have both a visible label and a button-like style/class.
function portalControl(element: HTMLElement) {
  if (!visible(element)) return false
  const text = accessibleText(element)
  if (!text || text.length > 180) return false
  const className = typeof element.className === "string" ? element.className : ""
  const hint = `${className} ${element.id} ${element.getAttribute("data-testid") || ""} ${element.getAttribute("data-action") || ""}`
  const cursor = getComputedStyle(element).cursor
  return cursor === "pointer" || /\b(btn|button|link|cta|action|apply|register|login|sign[ -]?in|continue|start|card|tile)\b/i.test(hint)
}

function describe(element: HTMLElement): PageElement {
  let id = element.dataset.aiAgentId
  if (!id) {
    id = `guide-element-${++count}`
    element.dataset.aiAgentId = id
  }
  registry.set(id, element)
  const input = element as HTMLInputElement
  const text = accessibleText(element)
  const name = `${text} ${input.name || ""} ${input.id || ""} ${input.type || ""}`
  return {
    id,
    tagName: element.tagName,
    text: sensitivePattern.test(name) ? `${element.tagName.toLowerCase()} field (sensitive)` : text,
    ariaLabel: element.getAttribute("aria-label") || undefined,
    placeholder: element.getAttribute("placeholder") || undefined,
    role: element.getAttribute("role") || undefined,
    href: element instanceof HTMLAnchorElement ? element.href : undefined,
    type: input.type || undefined,
    visible: visible(element),
    enabled: !(input.disabled || element.getAttribute("aria-disabled") === "true"),
    sensitive: sensitivePattern.test(name),
  }
}

export function extractPageElements(): PageState {
  registry.clear()
  const roots: ParentNode[] = [document]
  const candidates: HTMLElement[] = []
  while (roots.length) {
    const root = roots.pop()!
    root.querySelectorAll(selector).forEach((element) => candidates.push(element as HTMLElement))
    root.querySelectorAll<HTMLElement>("div,span,li,article,section").forEach((element) => {
      if (portalControl(element)) candidates.push(element)
    })
    root.querySelectorAll<HTMLElement>("*").forEach((element) => { if (element.shadowRoot) roots.push(element.shadowRoot) })
  }
  const uniqueCandidates = Array.from(new Set(candidates))
  return {
    url: location.href,
    title: document.title,
    headings: Array.from(document.querySelectorAll("h1,h2,h3")).map((heading) => heading.textContent?.trim() || "").filter(Boolean).slice(0, 20),
    elements: uniqueCandidates.map(describe).filter((element) => element.visible).slice(0, 200),
  }
}

export function getElement(id: string) {
  return registry.get(id) || document.querySelector<HTMLElement>(`[data-ai-agent-id="${CSS.escape(id)}"]`)
}
