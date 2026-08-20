"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: string;
  category: "meal" | "item" | "care";
  day_label: string;
  description: string;
  status: "open" | "taken";
  claimed_by_name: string | null;
  claimed_by_contact: string | null;
};

type Registry = {
  id: string;
  slug: string;
  mom_name: string;
  due_label: string | null;
};

const DAYS = [
  { value: "any", label: "Any day" },
  { value: "sun", label: "Sunday" },
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
] as const;

const TIMEFRAMES = [
  { value: "any", label: "Any time" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
] as const;

const RECURRENCES = [
  { value: "once", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
] as const;

function buildDayLabel(day: string, timeframe: string, recurrence: string) {
  const parts: string[] = [];
  if (day !== "any") parts.push(day.toUpperCase());
  if (timeframe !== "any") {
    parts.push(TIMEFRAMES.find((t) => t.value === timeframe)!.label.toUpperCase());
  }
  let base = parts.length ? parts.join(", ") : "ANYTIME";
  if (recurrence !== "once") {
    base += ` — ${RECURRENCES.find((r) => r.value === recurrence)!.label.toUpperCase()}`;
  }
  return base;
}

export function ManageBoard({ slug, token }: { slug: string; token: string }) {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ready">(token ? "loading" : "denied");

  const [category, setCategory] = useState<"meal" | "item" | "care">("item");
  const [day, setDay] = useState("any");
  const [timeframe, setTimeframe] = useState("any");
  const [recurrence, setRecurrence] = useState("once");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  function load() {
    if (!token) return;
    fetch(`/api/registry/${slug}/manage?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("denied");
        return res.json();
      })
      .then((data) => {
        setRegistry(data.registry);
        setSlots(data.slots);
        setState("ready");
      })
      .catch(() => setState("denied"));
  }

  useEffect(load, [slug, token]);

  async function runAction(body: Record<string, unknown>) {
    await fetch(`/api/registry/${slug}/manage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...body }),
    });
    load();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setAdding(true);
    const dayLabel = buildDayLabel(day, timeframe, recurrence);
    await runAction({ action: "add", category, dayLabel, description });
    setDescription("");
    setAdding(false);
  }

  if (state === "loading") {
    return <p className="hero-sub">Checking your link…</p>;
  }

  if (state === "denied") {
    return (
      <div className="error-msg" style={{ marginTop: 32 }}>
        This management link is invalid or incomplete. Use the private link you saved when you
        created the registry.
      </div>
    );
  }

  return (
    <>
      <p className="section-lede">
        Managing <strong>{registry?.mom_name}&rsquo;s</strong> registry.
      </p>

      <div className="manage-table">
        {slots.length === 0 && <div className="manage-row">No slots yet — add one below.</div>}
        {slots.map((slot) => (
          <div className="manage-row" key={slot.id}>
            <div className="meta">
              <span className="day">{slot.day_label}</span>
              {slot.description}
              {slot.status === "taken" && (
                <div className="claimed-by">
                  Claimed by {slot.claimed_by_name}
                  {slot.claimed_by_contact ? ` (${slot.claimed_by_contact})` : ""}
                </div>
              )}
            </div>
            <div className="manage-actions">
              {slot.status === "taken" && (
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => runAction({ action: "reopen", slotId: slot.id })}
                >
                  Reopen
                </button>
              )}
              <button
                className="btn btn-danger btn-small"
                onClick={() => runAction({ action: "remove", slotId: slot.id })}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} style={{ marginTop: 32, maxWidth: 480 }}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as "meal" | "item" | "care")}
        >
          <option value="meal">Meal</option>
          <option value="item">Item</option>
          <option value="care">Time & care</option>
        </select>

        <label htmlFor="day">Day</label>
        <select id="day" value={day} onChange={(e) => setDay(e.target.value)}>
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <label htmlFor="timeframe">Time of day</label>
        <select id="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          {TIMEFRAMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <label htmlFor="recurrence">Repeats</label>
        <select id="recurrence" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
          {RECURRENCES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <label htmlFor="description">What&rsquo;s needed</label>
        <input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Bring a meal"
          required
        />

        <button type="submit" className="btn btn-primary form-submit" disabled={adding}>
          {adding ? "Adding…" : "Add to registry"}
        </button>
      </form>
    </>
  );
}
