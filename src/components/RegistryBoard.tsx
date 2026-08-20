"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: string;
  category: "meal" | "item" | "care";
  day_label: string;
  description: string;
  status: "open" | "taken";
  claimed_by_name: string | null;
  sort_order: number;
};

type Registry = {
  id: string;
  slug: string;
  mom_name: string;
  due_label: string | null;
  current_week: number;
};

const TABS = [
  { key: "all", label: "This week" },
  { key: "meal", label: "Meals" },
  { key: "item", label: "Items" },
  { key: "care", label: "Time & care" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function RegistryBoard({ slug }: { slug: string }) {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/registry/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRegistry(data.registry);
        setSlots(data.slots);
      })
      .catch(() => {
        if (!cancelled) setLoadError("This registry couldn't be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visibleSlots = tab === "all" ? slots : slots.filter((s) => s.category === tab);

  function handleClaimed(slotId: string, name: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: "taken", claimed_by_name: name } : s))
    );
    setActiveSlot(null);
  }

  if (loading) {
    return (
      <div className="registry-shell">
        <div className="registry-empty">Loading registry…</div>
      </div>
    );
  }

  if (loadError || !registry) {
    return (
      <div className="registry-shell">
        <div className="registry-empty">{loadError ?? "Registry not found."}</div>
      </div>
    );
  }

  return (
    <div className="registry-shell">
      <div className="registry-head">
        <div>
          <h4>{registry.mom_name}&rsquo;s Fourth Trimester Registry</h4>
          <p>
            {registry.due_label ? registry.due_label.toUpperCase() + " — " : ""}
            UPDATES WEEKLY BASED ON WHAT SHE NEEDS
          </p>
        </div>
        <div className="no-account-badge">No sign-up required</div>
      </div>
      <div className="registry-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`rtab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {visibleSlots.length === 0 ? (
        <div className="registry-empty">Nothing in this category yet.</div>
      ) : (
        <div className="registry-grid">
          {visibleSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`slot ${slot.status === "taken" ? "taken" : ""}`}
              disabled={slot.status === "taken"}
              onClick={() => setActiveSlot(slot)}
            >
              <div className="day">{slot.day_label}</div>
              <div className="item">{slot.description}</div>
              <div className="status">
                {slot.status === "taken" ? `Claimed by ${slot.claimed_by_name}` : "Open — claim it"}
              </div>
            </button>
          ))}
        </div>
      )}

      {activeSlot && (
        <ClaimModal
          slug={slug}
          slot={activeSlot}
          onClose={() => setActiveSlot(null)}
          onClaimed={handleClaimed}
        />
      )}
    </div>
  );
}

function ClaimModal({
  slug,
  slot,
  onClose,
  onClaimed,
}: {
  slug: string;
  slot: Slot;
  onClose: () => void;
  onClaimed: (slotId: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/registry/${slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id, name, contact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not claim this slot.");
        return;
      }
      onClaimed(slot.id, name.trim());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h4>{slot.description}</h4>
        <p className="modal-sub">{slot.day_label}</p>
        <form onSubmit={submit}>
          <label htmlFor="claim-name">Your name</label>
          <input
            id="claim-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
          />
          <label htmlFor="claim-contact">Phone or email (for a reminder, optional)</label>
          <input
            id="claim-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="jane@email.com"
          />
          {error && <div className="error-msg">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Claiming…" : "Claim this"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
