"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function LiveTimestamp() {
  // Render a stable fallback during SSR/first paint so the client's local
  // time never causes a hydration mismatch -- the real time takes over
  // once mounted.
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(formatTime(new Date()));
    queueMicrotask(tick);
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="timestamp">
      <span className="pulse-dot" />
      {now ?? "2:14 AM"} — SOMEONE IS AWAKE RIGHT NOW
    </div>
  );
}
