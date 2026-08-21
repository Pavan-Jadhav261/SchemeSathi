import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"
import { readBearer } from "@/lib/auth"
import { getFaqAnswer } from "@/lib/faq-engine"
import { getSchemeById } from "@/lib/schemes-data"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!readBearer(request)) return NextResponse.json({ error: "Please log in again." }, { status: 401 })
  const { schemeId, question } = await request.json()
  const scheme = getSchemeById(String(schemeId))
  if (!scheme || !String(question ?? "").trim()) return NextResponse.json({ error: "A scheme and question are required." }, { status: 400 })
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ ...getFaqAnswer(scheme, String(question)), source: "local" })
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const interaction = await ai.interactions.create({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      store: false,
      system_instruction: `You are SchemeSathi, a careful assistant for Indian government schemes. Answer only from the verified scheme record below. Explain plainly, do not promise eligibility or approval, never ask for Aadhaar/bank/password details, and direct users to the official portal for confirmation. Keep the answer under 180 words.\n\nVerified scheme record:\n${JSON.stringify(scheme)}`,
      input: String(question).trim(),
    })
    return NextResponse.json({ answer: interaction.output_text || "I couldn't find an answer in the verified scheme record.", followUps: ["What documents do I need?", "How do I apply?", "Am I eligible?"], source: "ai" })
  } catch (error) {
    console.error("Scheme chat failed", error)
    return NextResponse.json({ ...getFaqAnswer(scheme, String(question)), source: "local" })
  }
}
