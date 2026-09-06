"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShareCard } from "@/components/ShareCard";

export default function StartPage() {
  const [momName, setMomName] = useState("");
  const [dueLabel, setDueLabel] = useState("");
  const [allergies, setAllergies] = useState("");
  const [mealPreferences, setMealPreferences] = useState("");
  const [dropoffNotes, setDropoffNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; editToken: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!momName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ momName, dueLabel, allergies, mealPreferences, dropoffNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create your registry.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="simple-page">
      <SiteHeader />
      <main className="simple-main">
        <div className="wrap-narrow">
          <div className="eyebrow">Create your registry</div>
          <h1>We&rsquo;ll set you up with a starter list. Adjust it anytime.</h1>
          <p className="hero-sub">
            No account, no password. We&rsquo;ll give you a private link to manage your registry
            and a public link to share — save both.
          </p>

          {!result ? (
            <form onSubmit={submit} style={{ marginTop: 40 }}>
              <label htmlFor="momName">Your name</label>
              <input
                id="momName"
                required
                placeholder="Maya"
                value={momName}
                onChange={(e) => setMomName(e.target.value)}
              />
              <label htmlFor="dueLabel">Due date or baby&rsquo;s birthday (optional)</label>
              <input
                id="dueLabel"
                placeholder="e.g. Week 2, or March 2026"
                value={dueLabel}
                onChange={(e) => setDueLabel(e.target.value)}
              />
              <label htmlFor="allergies">Any allergies helpers should know about (optional)</label>
              <input
                id="allergies"
                placeholder="e.g. Peanuts, shellfish"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
              <label htmlFor="mealPreferences">Meal preferences (optional)</label>
              <input
                id="mealPreferences"
                placeholder="e.g. Vegetarian, no spicy food"
                value={mealPreferences}
                onChange={(e) => setMealPreferences(e.target.value)}
              />
              <label htmlFor="dropoffNotes">Ideal drop-off times or instructions (optional)</label>
              <input
                id="dropoffNotes"
                placeholder="e.g. Weekdays after 4pm, leave on the porch"
                value={dropoffNotes}
                onChange={(e) => setDropoffNotes(e.target.value)}
              />
              {error && <div className="error-msg">{error}</div>}
              <button type="submit" className="btn btn-primary form-submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create my registry"}
              </button>
            </form>
          ) : (
            <div className="share-box">
              <strong>Your registry is live.</strong>
              <p className="form-note" style={{ marginTop: 6 }}>
                Share this link with anyone — no account needed for them to claim something:
              </p>
              <span className="link-value">{`${origin}/r/${result.slug}`}</span>

              <p className="form-note" style={{ marginTop: 18 }}>
                Save this private link for yourself — it lets you add or remove items later. It
                won&rsquo;t be shown again:
              </p>
              <span className="link-value">{`${origin}/r/${result.slug}/manage?token=${result.editToken}`}</span>
            </div>
          )}

          {result && (
            <>
              <p className="form-note" style={{ marginTop: 32, textAlign: "center" }}>
                Want to spread the word? Share this on Instagram, Facebook, or by text:
              </p>
              <ShareCard momName={momName} registryUrl={`${origin}/r/${result.slug}`} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
