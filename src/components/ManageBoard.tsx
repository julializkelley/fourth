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

export function ManageBoard({ slug, token }: { slug: string; token: string }) {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ready">(token ? "loading" : "denied");

  const [category, setCategory] = useState<"meal" | "item" | "care">("item");
  const [dayLabel, setDayLabel] = useState("ANYTIME");
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

        <label htmlFor="dayLabel">When</label>
        <input
          id="dayLabel"
          value={dayLabel}
          onChange={(e) => setDayLabel(e.target.value)}
          placeholder="e.g. TUE, DINNER or ANYTIME"
        />

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
