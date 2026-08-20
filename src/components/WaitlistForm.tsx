"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Postpartum mom / mom-to-be");
  const [due, setDue] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, due }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save your signup.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setDue("");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="name">Your name</label>
      <input
        type="text"
        id="name"
        required
        placeholder="Jane Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        required
        placeholder="jane@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="role">I&rsquo;m joining as a...</label>
      <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Postpartum mom / mom-to-be</option>
        <option>Partner</option>
        <option>Family member or friend</option>
        <option>Doula / provider</option>
      </select>

      <label htmlFor="due">Due date or baby&rsquo;s birthday (optional)</label>
      <input
        type="text"
        id="due"
        placeholder="MM/YYYY"
        value={due}
        onChange={(e) => setDue(e.target.value)}
      />

      <button type="submit" className="btn btn-primary form-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Joining…" : "Join the waitlist"}
      </button>

      {status === "success" && (
        <div className="success-msg">You&rsquo;re on the list. We&rsquo;ll reach out as we get closer to launch.</div>
      )}
      {status === "error" && <div className="error-msg">{error}</div>}

      <p className="form-note">No spam — just launch updates, and only when there&rsquo;s something real to share.</p>
    </form>
  );
}
