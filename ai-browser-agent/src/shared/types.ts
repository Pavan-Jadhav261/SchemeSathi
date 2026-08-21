export type AgentStatus = "IDLE" | "LISTENING" | "THINKING" | "GUIDING" | "STOPPED" | "ERROR"
export type AgentLanguage = "en-IN" | "hi-IN" | "mixed"
export type AgentSession = { active: boolean; goal: string; language: AgentLanguage; listening?: boolean; awaitingNavigation?: boolean; history?: string[] }
export type AgentAction = "click" | "input" | "select" | "scroll" | "hover" | "highlight" | "wait" | "none"

export type PageElement = {
  id: string
  tagName: string
  text: string
  ariaLabel?: string
  placeholder?: string
  role?: string
  href?: string
  type?: string
  visible: boolean
  enabled: boolean
  sensitive?: boolean
}

export type PageState = { url: string; title: string; headings: string[]; elements: PageElement[] }
export type AgentPlan = {
  understood: boolean
  goal: string
  response: string
  nextAction: { elementId: string | null; action: AgentAction; instruction: string; spokenInstruction: string; confidence: number }
  requiresUserConfirmation: boolean
}

export type ExtensionMessage =
  | { type: "ACTIVATE_AGENT"; text?: string }
  | { type: "USER_REQUEST"; text: string }
  | { type: "START_LISTENING" }
  | { type: "STOP_AGENT" }
  | { type: "SET_LANGUAGE"; language: AgentLanguage }
  | { type: "GET_STATUS" }
  | { type: "GET_AGENT_SESSION" }
  | { type: "SAVE_AGENT_SESSION"; session: AgentSession }
  | { type: "PLAN_REQUEST"; request: string; page: PageState; goal?: string; language: AgentLanguage; history?: string[] }
  | { type: "STATUS"; status: AgentStatus; detail: string }
