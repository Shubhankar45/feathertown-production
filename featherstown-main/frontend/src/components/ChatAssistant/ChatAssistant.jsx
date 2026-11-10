/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Smart Chat Assistant
   /components/ChatAssistant/ChatAssistant.jsx
   Strict 60-30-10 Palette:
   60% Oat Milk (#F7F5F0, #FAF8F5, #FFFFFF, #E2DDD3)
   30% Forest Green (#1B3B22, #152B17, #E7EFE8)
   10% Tomato Red (#D9381E)
═══════════════════════════════════════════════════════════════ */
import { useState, useRef, useEffect, useCallback } from "react";
import { detectIntent, extractBudget, filterByIntent, buildChatReply } from "../../utils/recommendation";
import { useSettings } from "../../context/SettingsContext";

const WA = (n, waNum = "919556747518") =>
  `https://wa.me/${(waNum || "919556747518").replace(/\D/g, "")}?text=Hi%2C%20I'm%20interested%20in%20${encodeURIComponent(n)}`;

const SUGGESTIONS = [
  { label: "🌱 Best beginner bird",   text: "Best beginner bird" },
  { label: "🤫 Low noise birds",      text: "Low noise birds" },
  { label: "💰 Best under ₹5000",    text: "Best bird under ₹5000" },
  { label: "🗨️ Which bird talks more?", text: "Which bird talks more?" },
  { label: "🏡 Good for apartments", text: "Quiet birds for apartments" },
  { label: "💎 Most beautiful",       text: "Most beautiful birds" },
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 12px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#1B3B22",
          animation: `chatBounce .9s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

function BirdChip({ parrot }) {
  const { settings } = useSettings();
  const waNum = settings?.whatsapp || "919556747518";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#FFFFFF", border: "1px solid #E2DDD3",
      borderRadius: 12, padding: "8px 10px",
      transition: "transform .2s, border-color .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#1B3B22"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E2DDD3"; }}
    >
      <img src={parrot.image} alt={parrot.name}
        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#152B17", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {parrot.name}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#1B3B22" }}>{parrot.price}</div>
      </div>
      <a href={WA(parrot.name, waNum)} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#1B3B22",
          color: "#FFFFFF", padding: "6px 12px", borderRadius: 999,
          fontSize: 11, fontWeight: 800, textDecoration: "none",
          flexShrink: 0, whiteSpace: "nowrap",
        }}>
        <span>Ask</span>
      </a>
    </div>
  );
}

const css = `
@keyframes chatSlideUp{from{opacity:0;transform:translateY(20px) scale(.95);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes chatFadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@keyframes chatBounce{0%,80%,100%{transform:scale(0);}40%{transform:scale(1);}}
@keyframes chatPulse{0%{box-shadow:0 0 0 0 rgba(27,59,34,.4);}70%{box-shadow:0 0 0 10px rgba(27,59,34,0);}100%{box-shadow:0 0 0 0 rgba(27,59,34,0);}}
.chat-msg{animation:chatFadeIn .32s cubic-bezier(.16,1,.3,1) both;}
.chat-input{
  flex:1;background:transparent;border:none;outline:none;
  font-size:13.5px;color:#152B17;font-family:Outfit,system-ui,sans-serif;
}
.chat-input::placeholder{color:#736B5E;}
.chat-send-btn{
  width:34px;height:34px;border-radius:50%;
  background:#D9381E;
  border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;color:#fff;font-size:13px;
  box-shadow:0 2px 8px rgba(217,56,30,.3);
  transition:transform .2s,box-shadow .2s;
}
.chat-send-btn:hover{transform:scale(1.08);}
.chat-send-btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;}
.chat-chip{
  padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;
  border:1px solid #E2DDD3;background:#FAF8F5;
  color:#1B3B22;cursor:pointer;white-space:nowrap;
  transition:border-color .18s,background .18s,transform .2s;
  flex-shrink:0;
}
.chat-chip:hover{border-color:#1B3B22;background:#E7EFE8;transform:translateY(-1px);}
`;

let msgId = 0;

export default function ChatAssistant({ parrots = [] }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: ++msgId,
      from: "bot",
      type: "text",
      text: "👋 Hi! I'm the Feathers Town bird advisor. Ask me anything — or tap a suggestion below!",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); setUnread(0); }
  }, [open]);

  const pushMsg = useCallback((msg) => {
    setMessages(prev => [...prev, { id: ++msgId, ...msg }]);
    if (!open) setUnread(u => u + 1);
  }, [open]);

  const handleSend = useCallback((text = input.trim()) => {
    if (!text) return;
    setInput("");
    pushMsg({ from: "user", type: "text", text });
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const intent = detectIntent(text);
      const budget = extractBudget(text);
      const filtered = filterByIntent(parrots, intent, budget);
      const replyText = buildChatReply(intent, filtered, budget);
      pushMsg({ from: "bot", type: "text", text: replyText });
      if (filtered.length) {
        pushMsg({ from: "bot", type: "birds", birds: filtered });
      }
    }, 900 + Math.random() * 400);
  }, [input, parrots, pushMsg]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  return (
    <>
      <style>{css}</style>

      {/* Floating toggle button */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        aria-label="Open bird advisor chat"
        style={{
          position: "fixed", bottom: "clamp(60px, 8vh, 68px)", right: "clamp(12px, 3vw, 28px)", zIndex: 490,
          width: 50, height: 50, borderRadius: "50%",
          background: open ? "#D9381E" : "#1B3B22",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: open ? 19 : 23,
          boxShadow: "0 6px 20px rgba(27,59,34,.3)",
          animation: open ? "none" : "chatPulse 2.8s ease-out infinite",
          transition: "background .3s, transform .2s",
          color: "#FFFFFF",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "✕" : "🪶"}
        {unread > 0 && !open && (
          <span style={{
            position: "absolute", top: -3, right: -3,
            width: 18, height: 18, borderRadius: "50%",
            background: "#D9381E", color: "#fff",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #FFFFFF",
          }}>{unread}</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "clamp(115px, 15vh, 130px)", right: "clamp(12px, 3vw, 28px)", zIndex: 490,
          width: "min(380px, calc(100vw - 24px))",
          background: "#FFFFFF",
          border: "1px solid #E2DDD3",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(21, 43, 23, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "chatSlideUp .32s cubic-bezier(.16,1,.3,1) both",
          maxHeight: "min(540px, calc(100vh - 140px))",
          fontFamily: "Outfit, system-ui, sans-serif",
        }}>

          {/* Header */}
          <div style={{
            background: "#1B3B22",
            padding: "13px 15px",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#FAF8F5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>🦜</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: "#FFFFFF" }}>Bird Advisor</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#B8D4BA" }} />
                <span style={{ fontSize: 10.5, color: "#FAF8F5" }}>Online · Feathers Town</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,.15)", border: "none",
              borderRadius: "50%", width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#FFFFFF", fontSize: 14,
            }}>✕</button>
          </div>

          {/* Suggestions */}
          <div style={{
            padding: "10px 12px 8px",
            display: "flex", gap: 6, flexWrap: "nowrap",
            overflowX: "auto", flexShrink: 0,
            borderBottom: "1px solid #E2DDD3",
            background: "#FAF8F5",
            scrollbarWidth: "none",
          }}>
            {SUGGESTIONS.map(s => (
              <button key={s.text} className="chat-chip" onClick={() => handleSend(s.text)}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 14px 8px",
            display: "flex", flexDirection: "column", gap: 10,
            background: "#F7F5F0",
            scrollbarWidth: "thin",
          }}>
            {messages.map(msg => (
              <div key={msg.id} className="chat-msg" style={{
                display: "flex",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                flexDirection: "column",
                alignItems: msg.from === "user" ? "flex-end" : "flex-start",
              }}>
                {msg.type === "text" && (
                  <div style={{
                    maxWidth: "82%",
                    background: msg.from === "user" ? "#1B3B22" : "#FFFFFF",
                    color: msg.from === "user" ? "#FFFFFF" : "#152B17",
                    border: msg.from === "bot" ? "1px solid #E2DDD3" : "none",
                    borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "10px 14px",
                    fontSize: 13.5, lineHeight: 1.6,
                  }}>
                    {msg.text}
                  </div>
                )}
                {msg.type === "birds" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
                    {msg.birds.map(p => <BirdChip key={p.id} parrot={p} />)}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "#FFFFFF", border: "1px solid #E2DDD3",
                  borderRadius: "18px 18px 18px 4px",
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid #E2DDD3",
            display: "flex", alignItems: "center", gap: 8,
            background: "#FAF8F5", flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any bird…"
              style={{
                flex: 1, background: "#FFFFFF",
                border: "1.5px solid #E2DDD3",
                borderRadius: 20, padding: "9px 14px",
                fontSize: 13,
                color: "#152B17", outline: "none",
                transition: "border-color .2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#1B3B22")}
              onBlur={e => (e.target.style.borderColor = "#E2DDD3")}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || typing}
              aria-label="Send"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
