"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// 6am-10pm reads as daytime presence; 10pm-6am keeps the original
// late-night "awake" framing.
function labelFor(d: Date) {
  const hour = d.getHours();
  const isDaytime = hour >= 6 && hour < 22;
  return isDaytime ? "SOMEONE IS GOING THROUGH IT RIGHT NOW" : "SOMEONE IS AWAKE RIGHT NOW";
}

export function LiveTimestamp() {
  // Render a stable fallback during SSR/first paint so the client's local
  // time never causes a hydration mismatch -- the real time takes over
  // once mounted.
  const [state, setState] = useState<{ time: string; label: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setState({ time: formatTime(d), label: labelFor(d) });
    };
    queueMicrotask(tick);
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="timestamp">
      <span className="pulse-dot" />
      {state?.time ?? "2:14 AM"} — {state?.label ?? "SOMEONE IS AWAKE RIGHT NOW"}
    </div>
  );
}
