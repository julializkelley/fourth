"use client";

function scrollToChat() {
  const el = document.getElementById("support-chat");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.querySelector("input")?.focus();
}

export function ChatWidget() {
  return (
    <div className="chat-wrap">
      <button className="chat-button" onClick={scrollToChat} aria-label="Jump to support chat">
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
