import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom"

export class AgentOverlay {
  private host = document.createElement("div")
  private avatar: HTMLDivElement
  private label: HTMLDivElement
  private transcript: HTMLDivElement
  private highlight: HTMLDivElement
  private cleanupPosition?: () => void
  private active = false
  private navigating = false

  constructor() {
    this.host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;"
    const shadow = this.host.attachShadow({ mode: "closed" })
    shadow.innerHTML = `<style>.avatar{position:fixed;width:24px;height:24px;will-change:transform;transition:transform 1.25s cubic-bezier(.16,1,.3,1)}.orb{position:absolute;inset:0;border-radius:50%;background:#080808;box-shadow:0 4px 14px #0008}.orb:before{content:'';position:absolute;inset:-2px;border-radius:inherit;background:conic-gradient(from 0deg,#ffbd3f,#ff4f6d,#a56cff,#319cff,#55e2b7,#ffbd3f);z-index:-1;animation:orbit 3.4s linear infinite}.orb:after{content:'';position:absolute;inset:2px;border-radius:inherit;background:#080808}.avatar.active .orb{background:#101010;box-shadow:0 0 10px #ff6a4d99,0 0 16px #756bff66}.avatar.active .orb:after{background:#101010}.avatar.listening .orb{animation:listen .85s ease-in-out infinite alternate}.avatar.thinking .orb{background:conic-gradient(#ffca4a,#ff4c7d,#905cff,#2da6ff,#46e7b9,#ffca4a);box-shadow:0 0 20px #ff4d8fcc,0 0 38px #5d6fffa8;animation:think 1.15s ease-in-out infinite alternate}.avatar.thinking .orb:after{background:radial-gradient(circle,#ffffffa8 0%,#a061ff 27%,#ff4277 63%,#2136a7 100%);opacity:.9}.label,.transcript{position:fixed;color:#fff;font:12px/1.4 system-ui;opacity:0;transition:opacity .2s}.label{max-width:300px;padding:8px 10px;border-radius:10px;background:#111d;border:1px solid #ffffff25;backdrop-filter:blur(10px)}.transcript{left:50%;bottom:20px;transform:translateX(-50%);width:min(520px,calc(100vw - 32px));box-sizing:border-box;padding:12px 16px;border-radius:14px;background:#10131df2;border:1px solid #ffffff30;box-shadow:0 12px 34px #0007;backdrop-filter:blur(14px);text-align:left}.label.show,.transcript.show{opacity:1}.transcript b{display:block;margin-bottom:4px;color:#b9c6ff;font-size:10px;text-transform:uppercase;letter-spacing:.1em}.transcript span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.transcript.listening b:before{content:'';display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#ff566b;box-shadow:0 0 10px #ff566b;animation:pulse .8s infinite alternate}.highlight{position:fixed;border:2px solid #fff;border-radius:8px;box-shadow:0 0 0 4px #735cff55,0 0 22px #ff4c9b99;opacity:0;transition:all .35s;box-sizing:border-box}.highlight.show{opacity:1}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes listen{to{transform:scale(1.12)}}@keyframes think{to{transform:scale(1.14) rotate(8deg)}}@keyframes pulse{to{transform:scale(.65);opacity:.5}}</style><div class="avatar"><div class="orb"></div></div><div class="highlight"></div><div class="label"></div><div class="transcript"><b>Listening</b><span></span></div>`
    this.avatar = shadow.querySelector(".avatar")!; this.highlight = shadow.querySelector(".highlight")!; this.label = shadow.querySelector(".label")!; this.transcript = shadow.querySelector(".transcript")!
  }
  mount() { if (!this.host.isConnected) document.documentElement.append(this.host) }
  setActive(active: boolean) { this.active = active; this.avatar.classList.toggle("active", active) }
  setListening(listening: boolean) { this.avatar.classList.toggle("listening", listening); this.transcript.classList.toggle("listening", listening) }
  setThinking(thinking: boolean) { this.avatar.classList.toggle("thinking", thinking) }
  followCursor(x: number, y: number) { if (this.active && !this.navigating) this.avatar.style.transform = `translate(${x + 18}px,${y - 38}px)` }
  showTranscript(text: string, title = "Listening") { this.transcript.querySelector("b")!.textContent = title; this.transcript.querySelector("span")!.textContent = text || "I’m listening…"; this.transcript.classList.add("show") }
  clearTranscript(title = "Listening live") { this.transcript.querySelector("b")!.textContent = title; this.transcript.querySelector("span")!.textContent = ""; this.transcript.classList.add("show") }
  hideTranscript() { this.transcript.classList.remove("show") }
  clear() { this.cleanupPosition?.(); this.cleanupPosition = undefined; this.highlight.classList.remove("show"); this.label.classList.remove("show") }
  returnToCursor(x: number, y: number) { this.clear(); this.navigating = false; this.followCursor(x, y) }
  async pointTo(target: HTMLElement, text: string) { this.clear(); this.navigating = true; target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }); await new Promise((resolve) => setTimeout(resolve, 650)); const position = async () => { const { x, y } = await computePosition(target, this.avatar, { strategy: "fixed", placement: "top-end", middleware: [offset(14), flip(), shift({ padding: 12 })] }); this.avatar.style.transform = `translate(${x}px,${y}px)`; const rect = target.getBoundingClientRect(); this.highlight.style.cssText += `;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`; this.label.textContent = text; this.label.style.transform = `translate(${Math.max(12, rect.left)}px,${Math.max(12, rect.top - 44)}px)` }; await position(); this.highlight.classList.add("show"); this.label.classList.add("show"); this.cleanupPosition = autoUpdate(target, this.avatar, position, { animationFrame: true }) }
}
