import OpenAI from "openai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const cors = (request: Request): Record<string, string> => {
  const origin = request.headers.get("origin")
  return origin?.startsWith("chrome-extension://") ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}
}

type Element = { id: string; text: string; tagName: string; ariaLabel?: string; placeholder?: string; role?: string; href?: string; type?: string; visible: boolean; enabled: boolean; sensitive?: boolean }
type Plan = { understood: boolean; goal: string; response: string; nextAction: { elementId: string | null; action: "click" | "input" | "select" | "scroll" | "hover" | "highlight" | "wait" | "none"; instruction: string; spokenInstruction: string; confidence: number }; requiresUserConfirmation: boolean }

const languageNames: Record<string, string> = {
  "en-IN": "English", "hi-IN": "Hindi (Devanagari script)", "ta-IN": "Tamil script", "te-IN": "Telugu script", "kn-IN": "Kannada script", "bn-IN": "Bengali script", "mr-IN": "Marathi (Devanagari script)",
}

function fallback(request: string, elements: Element[], language = "en-IN"): Plan {
  const words = request.toLowerCase().split(/\W+/).filter((word) => word.length > 2)
  const preferred = elements.filter((element) => !element.sensitive && element.enabled)
  const target = preferred.map((element) => ({ element, score: words.reduce((score, word) => score + (`${element.text} ${element.ariaLabel ?? ""} ${element.href ?? ""}`.toLowerCase().includes(word) ? 1 : 0), 0) + (/apply|register|sign up|continue|start/i.test(element.text) ? 2 : 0) })).sort((a, b) => b.score - a.score)[0]
  const kn = language === "kn-IN"
  return target?.score ? { understood: true, goal: request, response: kn ? `${target.element.text || "ಮುಂದಿನ ನಿಯಂತ್ರಣ"} ಕಂಡುಬಂದಿದೆ.` : `I found ${target.element.text || "a likely next control"}.`, nextAction: { elementId: target.element.id, action: "click", instruction: kn ? `${target.element.text || "ಈ ನಿಯಂತ್ರಣ"} ಕ್ಲಿಕ್ ಮಾಡಿ.` : `Click ${target.element.text || "this control"}.`, spokenInstruction: kn ? `${target.element.text || "ಮುಂದಿನ ನಿಯಂತ್ರಣ"} ಕಂಡುಬಂದಿದೆ. ನಾನು ಅದನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.` : `I found ${target.element.text || "the next control"}. I’m pointing to it.`, confidence: Math.min(0.9, 0.55 + target.score / 10) }, requiresUserConfirmation: true } : { understood: false, goal: request, response: kn ? "ಈ ಪುಟದಲ್ಲಿ ಸರಿಯಾದ ನಿಯಂತ್ರಣವನ್ನು ಖಚಿತವಾಗಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ." : "I couldn't confidently identify the correct control on this page.", nextAction: { elementId: null, action: "none", instruction: kn ? "ಬಳಕೆದಾರರನ್ನು ಸ್ಪಷ್ಟಪಡಿಸಲು ಕೇಳಿ." : "Ask the user to clarify.", spokenInstruction: kn ? "ಸರಿಯಾದ ನಿಯಂತ್ರಣವನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮಗೆ ಬೇಕಾದ ಬಟನ್‌ನ ಹೆಸರನ್ನು ಹೇಳಿ." : "I couldn't confidently identify the right control. Please tell me the label you want.", confidence: 0 }, requiresUserConfirmation: true }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: { ...cors(request), "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userRequest?: string; page?: { url?: string; title?: string; headings?: string[]; elements?: Element[] }; session?: { goal?: string; language?: string; history?: string[] } }
    const userRequest = body.userRequest?.trim()
    const elements = body.page?.elements?.filter((element) => element.visible && element.enabled).slice(0, 120) ?? []
    if (!userRequest) return NextResponse.json({ error: "A navigation request is required." }, { status: 400, headers: cors(request) })
    const fallbackPlan = fallback(userRequest, elements, body.session?.language)
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ success: true, plan: fallbackPlan }, { headers: cors(request) })

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.responses.create({
      model: process.env.BROWSER_AGENT_MODEL || "gpt-5.6-luna",
      store: false,
      input: `You are a visual browser navigation agent. Select the safest, semantically appropriate NEXT visible element only from PAGE ELEMENTS. Never invent an element ID or coordinates. Never enter, expose, or request sensitive values. Do not navigate through CAPTCHA, authentication, payment, final submissions, OTPs, or passwords; you may only point them out and must require user confirmation. If uncertain, select null with action none. Write EVERY user-facing string (response, instruction, spokenInstruction) in ${languageNames[body.session?.language || "en-IN"] || "English"}. If Kannada is selected, use Kannada script only; do not answer in English.\n\nUSER REQUEST: ${userRequest}\nGOAL: ${body.session?.goal || userRequest}\nRECENT USER REQUESTS: ${JSON.stringify((body.session?.history || []).slice(-8))}\nPAGE: ${JSON.stringify({ url: body.page?.url, title: body.page?.title, headings: body.page?.headings, elements })}`,
      text: { format: { type: "json_schema", name: "browser_navigation_plan", strict: true, schema: { type: "object", additionalProperties: false, required: ["understood", "goal", "response", "nextAction", "requiresUserConfirmation"], properties: { understood: { type: "boolean" }, goal: { type: "string" }, response: { type: "string" }, requiresUserConfirmation: { type: "boolean" }, nextAction: { type: "object", additionalProperties: false, required: ["elementId", "action", "instruction", "spokenInstruction", "confidence"], properties: { elementId: { type: ["string", "null"] }, action: { type: "string", enum: ["click", "input", "select", "scroll", "hover", "highlight", "wait", "none"] }, instruction: { type: "string" }, spokenInstruction: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 } } } } } } },
    })
    const plan = JSON.parse(response.output_text) as Plan
    const targetAllowed = !plan.nextAction.elementId || elements.some((element) => element.id === plan.nextAction.elementId && !element.sensitive)
    if (!targetAllowed || plan.nextAction.confidence < 0.75) return NextResponse.json({ success: true, plan: fallbackPlan }, { headers: cors(request) })
    return NextResponse.json({ success: true, plan: { ...plan, requiresUserConfirmation: true } }, { headers: cors(request) })
  } catch (error) {
    console.error("Browser agent planning failed", error)
    return NextResponse.json({ success: true, plan: { understood: false, goal: "", response: "I couldn't create a safe plan right now.", nextAction: { elementId: null, action: "none", instruction: "Try again.", spokenInstruction: "I couldn’t create a safe plan right now. Please try again.", confidence: 0 }, requiresUserConfirmation: true } satisfies Plan }, { headers: cors(request) })
  }
}
