import { createRoot } from "react-dom/client"
import { Languages, Mic, Send, Square, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import "./styles.css"

function App() {
  const [text, setText] = useState("")
  const [domain, setDomain] = useState("Current page")
  const [status, setStatus] = useState("Ready to guide you")
  const [language, setLanguage] = useState("en-IN")
  const send = async (type: "ACTIVATE_AGENT" | "USER_REQUEST" | "START_LISTENING" | "STOP_AGENT" | "SET_LANGUAGE", value?: string) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) return
    await chrome.tabs.sendMessage(tab.id, type === "USER_REQUEST" ? { type, text: value } : type === "ACTIVATE_AGENT" ? { type, text: value } : type === "SET_LANGUAGE" ? { type, language: value } : { type })
  }
  useEffect(() => {
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => setDomain(tab.url ? new URL(tab.url).host : "Current page"))
    const listener = (message: { type: string; detail?: string }) => { if (message.type === "STATUS" && message.detail) setStatus(message.detail) }
    chrome.runtime.onMessage.addListener(listener); return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])
  const activate = () => { void (async () => { await send("SET_LANGUAGE", language); await send("ACTIVATE_AGENT", text); setText("") })() }
  const startVoiceInput = () => { void (async () => { await send("SET_LANGUAGE", language); await send("START_LISTENING") })() }
  return <main className="popup"><header><span className="orb"><Sparkles size={14} /></span><div><strong>GuideDot</strong><small>{domain}</small></div></header><section><span className="avatar active" aria-hidden /><div><b>Visual browser agent</b><p>{status}</p></div></section><label className="language"><Languages size={14} /><select value={language} onChange={(event) => { setLanguage(event.target.value); void send("SET_LANGUAGE", event.target.value) }} aria-label="Agent language"><option value="en-IN">English</option><option value="hi-IN">हिन्दी</option><option value="mixed">English + हिन्दी</option></select></label><form onSubmit={(event) => { event.preventDefault(); activate() }}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask me what to do…" /><button aria-label="Start guiding" type="submit"><Send size={16} /></button></form><div className="actions"><button className="primary" onClick={activate}><Sparkles size={15} /> Activate agent</button><button aria-label="Use voice" onClick={startVoiceInput}><Mic size={16} /></button><button aria-label="Stop agent" onClick={() => void send("STOP_AGENT")}><Square size={14} /></button></div><footer>Active only in this website tab. You stay in control.</footer></main>
}
createRoot(document.getElementById("root")!).render(<App />)
