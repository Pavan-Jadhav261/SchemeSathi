import type { PageElement, PageState } from "../shared/types"

const selector = "button,a,input,select,textarea,label,[role='button'],[role='link'],[role='tab'],[role='menuitem']"
const sensitivePattern = /password|passcode|otp|aadhaar|aadhar|bank|card|cvv|account/i
let count = 0
const registry = new Map<string, HTMLElement>()

function visible(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0 && style.pointerEvents !== "none"
}

function describe(element: HTMLElement): PageElement {
  let id = element.dataset.aiAgentId
  if (!id) {
    id = `guide-element-${++count}`
    element.dataset.aiAgentId = id
  }
  registry.set(id, element)
  const input = element as HTMLInputElement
  const text = (element.innerText || element.getAttribute("aria-label") || element.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim().slice(0, 180)
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
    root.querySelectorAll<HTMLElement>("*").forEach((element) => { if (element.shadowRoot) roots.push(element.shadowRoot) })
  }
  return {
    url: location.href,
    title: document.title,
    headings: Array.from(document.querySelectorAll("h1,h2,h3")).map((heading) => heading.textContent?.trim() || "").filter(Boolean).slice(0, 15),
    elements: candidates.map(describe).filter((element) => element.visible).slice(0, 120),
  }
}

export function getElement(id: string) {
  return registry.get(id) || document.querySelector<HTMLElement>(`[data-ai-agent-id="${CSS.escape(id)}"]`)
}
