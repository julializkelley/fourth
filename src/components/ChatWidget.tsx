"use client";

import { useEffect, useRef, useState } from "react";
import { getSessionId, resetSessionId } from "@/lib/chatSession";

type AiMessage = { role: "user" | "assistant"; content: string; flagged?: boolean };
type PairMessage = {
  id: string;
  sender_session_id: string;
  content: string;
  flagged: boolean;
  created_at: string;
};

type Mode = "ai" | "pair_waiting" | "paired" | "ended";

const CRISIS_LINE =
  "If things feel unsafe right now: call or text 988, or call the National Maternal Mental Health Hotline at 1-833-852-6262. Both are free, 24/7.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("ai");
  const [sessionId, setSessionId] = useState(() => getSessionId());
  const [hasEngaged, setHasEngaged] = useState(false);
  const [othersActive, setOthersActive] = useState(false);

  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [pairChatId, setPairChatId] = useState<string | null>(null);
  const [pairMessages, setPairMessages] = useState<PairMessage[]>([]);
  const [endedReason, setEndedReason] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastPairFetchRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [aiMessages, pairMessages, mode, endedReason]);

  // Presence heartbeat -- only once she's actually engaged, so passively
  // opening the widget doesn't count as "in distress right now".
  useEffect(() => {
    if (!hasEngaged || !sessionId || mode !== "ai") return;
    let cancelled = false;

    async function ping() {
      try {
        const res = await fetch("/api/presence/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!cancelled) setOthersActive(!!data.othersActive);
      } catch {
        // ignore -- presence is a nice-to-have, not core functionality
      }
    }

    ping();
    const interval = setInterval(ping, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasEngaged, sessionId, mode]);

  // Poll for a match while waiting.
  useEffect(() => {
    if (mode !== "pair_waiting" || !sessionId) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/pair/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.status === "paired") {
          setPairChatId(data.pairChatId);
          setMode("paired");
        }
      } catch {
        // retry on next tick
      }
    }

    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [mode, sessionId]);

  // Poll pair chat messages.
  useEffect(() => {
    if (mode !== "paired" || !pairChatId) return;
    let cancelled = false;

    async function poll() {
      const since = lastPairFetchRef.current;
      const url = since
        ? `/api/pair/${pairChatId}/messages?since=${encodeURIComponent(since)}`
        : `/api/pair/${pairChatId}/messages`;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.pairChat?.status === "ended") {
          setEndedReason(data.pairChat.ended_reason ?? "ended");
          setMode("ended");
          setSessionId(resetSessionId());
          return;
        }

        if (data.messages?.length) {
          setPairMessages((prev) => [...prev, ...data.messages]);
          lastPairFetchRef.current = data.messages[data.messages.length - 1].created_at;
        }
      } catch {
        // retry on next tick
      }
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [mode, pairChatId]);

  async function sendAiMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setHasEngaged(true);
    setSending(true);

    const nextMessages: AiMessage[] = [...aiMessages, { role: "user", content: text }];
    setAiMessages(nextMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Something went wrong. Please try again.", flagged: data.flagged },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong reaching the chat. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function requestPairing() {
    setMode("pair_waiting");
    const res = await fetch("/api/pair/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (data.status === "paired") {
      setPairChatId(data.pairChatId);
      setMode("paired");
    }
  }

  function cancelPairing() {
    setMode("ai");
  }

  async function sendPairMessage() {
    const text = input.trim();
    if (!text || !pairChatId || sending) return;
    setInput("");
    setSending(true);
    try {
      const res = await fetch(`/api/pair/${pairChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: text }),
      });
      const data = await res.json();
      if (data.message) {
        setPairMessages((prev) => [...prev, data.message]);
        lastPairFetchRef.current = data.message.created_at;
      }
      if (data.endedChat) {
        setEndedReason("risk_language");
        setMode("ended");
        setSessionId(resetSessionId());
      }
    } finally {
      setSending(false);
    }
  }

  async function endPairChat() {
    if (!pairChatId) return;
    await fetch(`/api/pair/${pairChatId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setEndedReason("left");
    setMode("ended");
    setSessionId(resetSessionId());
  }

  function backToAiChat() {
    setMode("ai");
    setPairChatId(null);
    setPairMessages([]);
    setEndedReason(null);
    setOthersActive(false);
    lastPairFetchRef.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if (mode === "ai") sendAiMessage();
    if (mode === "paired") sendPairMessage();
  }

  return (
    <div className="chat-wrap">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-head">
            <div>
              <h4>
                {mode === "paired" ? "Anonymous chat" : mode === "ended" ? "Chat ended" : "Talk to someone"}
              </h4>
              <p>
                {mode === "ai" && "Support & education — not a substitute for a professional"}
                {mode === "pair_waiting" && "Looking for someone else here right now…"}
                {mode === "paired" && "You're both anonymous. Leave anytime."}
                {mode === "ended" && "You can start a new chat below."}
              </p>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          {mode === "ai" && othersActive && (
            <div className="chat-ambient-banner">
              <p>Someone else is here right now too, going through something similar.</p>
              <div className="row">
                <button className="btn btn-primary btn-small" onClick={requestPairing}>
                  Chat anonymously with her
                </button>
              </div>
            </div>
          )}

          <div className="chat-messages" ref={scrollRef}>
            {mode === "ai" &&
              (aiMessages.length === 0 ? (
                <div className="chat-bubble chat-bubble-system">
                  Whatever it is, you can say it here. This isn&rsquo;t a substitute for a
                  professional, but it&rsquo;s a place to start.
                </div>
              ) : (
                aiMessages.map((m, i) => (
                  <div key={i}>
                    <div className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                      {m.content}
                    </div>
                    {m.flagged && (
                      <div className="chat-flag-banner" style={{ marginTop: 8 }}>
                        {CRISIS_LINE}
                      </div>
                    )}
                  </div>
                ))
              ))}

            {mode === "pair_waiting" && (
              <div className="chat-bubble chat-bubble-system">Waiting for a match…</div>
            )}

            {(mode === "paired" || mode === "ended") &&
              pairMessages.map((m) => (
                <div
                  key={m.id}
                  className={`chat-bubble ${m.sender_session_id === sessionId ? "chat-bubble-self" : "chat-bubble-peer"}`}
                >
                  {m.content}
                </div>
              ))}

            {mode === "ended" && (
              <div className="chat-bubble chat-bubble-system">
                {endedReason === "risk_language"
                  ? "This chat was ended for everyone's safety."
                  : "Chat ended."}
              </div>
            )}
            {mode === "ended" && endedReason === "risk_language" && (
              <div className="chat-flag-banner">{CRISIS_LINE}</div>
            )}
          </div>

          {mode === "ai" && (
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type here…"
                disabled={sending}
              />
              <button className="chat-send" onClick={sendAiMessage} disabled={sending || !input.trim()}>
                Send
              </button>
            </div>
          )}

          {mode === "pair_waiting" && (
            <div className="chat-footer-actions">
              <button className="btn btn-secondary btn-small" onClick={cancelPairing}>
                Cancel
              </button>
            </div>
          )}

          {mode === "paired" && (
            <>
              <div className="chat-input-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type here…"
                  disabled={sending}
                />
                <button className="chat-send" onClick={sendPairMessage} disabled={sending || !input.trim()}>
                  Send
                </button>
              </div>
              <div className="chat-footer-actions">
                <button className="btn btn-danger btn-small" onClick={endPairChat}>
                  End chat
                </button>
              </div>
            </>
          )}

          {mode === "ended" && (
            <div className="chat-footer-actions">
              <button className="btn btn-primary btn-small" onClick={backToAiChat}>
                Start a new chat
              </button>
            </div>
          )}
        </div>
      )}

      <button className="chat-button" onClick={() => setOpen((v) => !v)} aria-label="Open support chat">
        <ChatIcon />
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H9l-4.4 3.3A1 1 0 013 19.5V16H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
  );
}
