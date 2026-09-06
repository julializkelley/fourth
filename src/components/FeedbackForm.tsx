"use client";

import { useState } from "react";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your feedback.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setMessage("");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="message">What&rsquo;s working, what isn&rsquo;t, what&rsquo;s missing</label>
      <textarea
        id="message"
        required
        placeholder="Tell us anything — the good, the broken, the confusing."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <label htmlFor="email">Your email (optional, if you&rsquo;d like a reply)</label>
      <input
        type="email"
        id="email"
        placeholder="jane@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit" className="btn btn-primary form-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send feedback"}
      </button>

      {status === "success" && (
        <div className="success-msg">Thank you — this goes straight to the person building Fourth.</div>
      )}
      {status === "error" && <div className="error-msg">{error}</div>}

      <p className="form-note">Fourth is new and still evolving — every note helps shape what we build next.</p>
    </form>
  );
}
