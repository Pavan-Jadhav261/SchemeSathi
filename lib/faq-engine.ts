import type { Scheme } from "./types"

export const defaultSuggestedQuestions = [
  "Am I eligible?",
  "What documents do I need?",
  "How much benefit will I receive?",
  "How do I apply?",
  "Can I apply online?",
  "What if I don't have an income certificate?",
]

/**
 * Scripted / rule-based FAQ matching against the scheme dataset.
 * Designed so it can be swapped for a real LLM-backed endpoint later
 * without changing how callers invoke it.
 */
export function getFaqAnswer(scheme: Scheme, question: string): { answer: string; followUps: string[] } {
  const q = question.toLowerCase()

  if (q.includes("eligib") || q.includes("qualify") || q.includes("can i apply")) {
    return {
      answer: `Based on the published criteria for ${scheme.shortName}, you'll generally need to meet: ${scheme.eligibilitySummary.join(
        ", ",
      )}. This is informational guidance — the official portal will confirm your exact eligibility during application.`,
      followUps: ["What documents do I need?", "How do I apply?", "What if I don't have all the documents?"],
    }
  }

  if (q.includes("document") || q.includes("papers") || q.includes("proof")) {
    const required = scheme.documents.filter((d) => d.required).map((d) => d.name)
    return {
      answer: `The commonly required documents for ${scheme.shortName} are: ${required.join(
        ", ",
      )}. Optional supporting documents can strengthen your application but aren't always mandatory.`,
      followUps: ["What if I don't have an income certificate?", "How much benefit will I receive?", "How do I apply?"],
    }
  }

  if (q.includes("income certificate") || q.includes("don't have") || q.includes("do not have") || q.includes("no land")) {
    return {
      answer: `If you're missing a specific document like this, you can usually still start your application — many Common Service Centres and local offices can help you obtain or substitute it. We'd recommend visiting your nearest CSC or the official portal for ${scheme.shortName} to check accepted alternatives.`,
      followUps: ["How do I apply?", "Can I apply online?", "What documents do I need?"],
    }
  }

  if (q.includes("benefit") || q.includes("amount") || q.includes("money") || q.includes("how much")) {
    return {
      answer: `${scheme.shortName} provides: ${scheme.benefit}${
        scheme.benefitAmount ? ` — typically ${scheme.benefitAmount}.` : "."
      } Actual amounts may vary based on your specific eligibility category, so always confirm on the official portal.`,
      followUps: ["Am I eligible?", "How do I apply?", "What documents do I need?"],
    }
  }

  if (q.includes("apply") || q.includes("procedure") || q.includes("process") || q.includes("online")) {
    return {
      answer: `To apply for ${scheme.shortName}: ${scheme.applicationSteps.join(" → ")}. You can start this process on the official government portal linked on this page.`,
      followUps: ["What documents do I need?", "Am I eligible?", "How much benefit will I receive?"],
    }
  }

  return {
    answer: `That's a great question about ${scheme.shortName}. While I can help explain eligibility, benefits, documents and the application process in simple terms, for the most precise and legally accurate answer, please refer to the official government portal linked on this page or visit your nearest Common Service Centre.`,
    followUps: defaultSuggestedQuestions.slice(0, 3),
  }
}
