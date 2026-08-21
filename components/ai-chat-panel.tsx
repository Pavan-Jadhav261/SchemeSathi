"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { defaultSuggestedQuestions } from "@/lib/faq-engine"
import { getAccessToken, getSchemeChatHistory, saveSchemeChatHistory } from "@/lib/storage"
import { cn } from "@/lib/utils"
import type { ChatMessage, Scheme } from "@/lib/types"

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s]+)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="font-medium text-ai-blue-foreground underline underline-offset-2">{link[1]}</a>
    if (/^https?:\/\//.test(part)) return <a key={index} href={part} target="_blank" rel="noreferrer" className="font-medium text-ai-blue-foreground underline underline-offset-2">{part}</a>
    return part
  })
}

function ChatAnswer({ content }: { content: string }) {
  return <div className="space-y-2">{content.split("\n").filter(Boolean).map((line, index) => {
    const bullet = line.match(/^\s*[-*]\s+(.+)/)
    const numbered = line.match(/^\s*(\d+)\.\s+(.+)/)
    const heading = line.match(/^\s*(?:#{1,3}\s+)?\*\*(.+?)\*\*:?[\s]*$/)
    if (heading) return <p key={index} className="font-semibold text-foreground"><InlineMarkdown text={heading[1]} /></p>
    if (bullet) return <div key={index} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-ai-blue-foreground" /><span><InlineMarkdown text={bullet[1]} /></span></div>
    if (numbered) return <div key={index} className="flex gap-2"><span className="font-semibold text-ai-blue-foreground">{numbered[1]}.</span><span><InlineMarkdown text={numbered[2]} /></span></div>
    return <p key={index}><InlineMarkdown text={line} /></p>
  })}</div>
}

export function AiChatPanel({ scheme }: { scheme: Scheme }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [loadedSchemeId, setLoadedSchemeId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(getSchemeChatHistory(scheme.id))
    setLoadedSchemeId(scheme.id)
  }, [scheme.id])

  useEffect(() => {
    if (loadedSchemeId === scheme.id) saveSchemeChatHistory(scheme.id, messages)
  }, [loadedSchemeId, messages, scheme.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, thinking])

  async function ask(question: string) {
    if (!question.trim() || thinking) return
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setThinking(true)

    try {
      const response = await fetch("/api/scheme-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
        body: JSON.stringify({ schemeId: scheme.id, question }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        suggestions: result.followUps,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "I couldn't answer that right now. Please try again or check the official portal.", suggestions: defaultSuggestedQuestions }])
    } finally {
      setThinking(false)
    }
  }

  return (
    <div className="neu-card flex flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <span className="flex size-9 items-center justify-center rounded-xl bg-ai-blue/20 text-ai-blue-foreground">
          <Sparkles className="size-4.5" />
        </span>
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">Have questions about this scheme?</h3>
          <p className="text-xs text-muted-foreground">Ask in your own words — I&apos;ll explain it simply.</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex max-h-[420px] min-h-[220px] flex-col gap-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {defaultSuggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => ask(q)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-ai-blue hover:text-ai-blue-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex items-start gap-2.5", message.role === "user" && "flex-row-reverse")}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                message.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-ai-blue/20 text-ai-blue-foreground",
              )}
            >
              {message.role === "user" ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
            </span>
            <div className={cn("flex max-w-[85%] flex-col gap-2", message.role === "user" && "items-end")}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "neu-inset text-foreground",
                )}
              >
                {message.role === "assistant" ? <ChatAnswer content={message.content} /> : message.content}
              </div>
              {message.suggestions && (
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-ai-blue hover:text-ai-blue-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ai-blue/20 text-ai-blue-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <div className="neu-inset flex items-center gap-1 rounded-2xl px-4 py-3">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="flex items-center gap-2 border-t border-border/60 px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              ask(input)
            }
          }}
          placeholder="Type your question about this scheme..."
          aria-label="Ask a question about this scheme"
          className="h-11 flex-1 rounded-full bg-muted px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon-lg" className="rounded-full" disabled={!input.trim() || thinking} aria-label="Send question">
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </div>
  )
}
