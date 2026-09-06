"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: string;
  category: "meal" | "item" | "care" | "gift_card";
  day_label: string;
  description: string;
  status: "open" | "pending" | "taken";
  claimed_by_name: string | null;
  external_url: string | null;
  scheduled_at: string | null;
  sort_order: number;
};

type Registry = {
  id: string;
  slug: string;
  mom_name: string;
  due_label: string | null;
  current_week: number;
  allergies: string | null;
  meal_preferences: string | null;
  dropoff_notes: string | null;
};

const TABS = [
  { key: "all", label: "This week" },
  { key: "meal", label: "Meals" },
  { key: "item", label: "Items" },
  { key: "care", label: "Time & care" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function matchesTab(slot: Slot, tab: TabKey) {
  if (tab === "all") return true;
  if (tab === "item") return slot.category === "item" || slot.category === "gift_card";
  return slot.category === tab;
}

function externalLinkLabel(category: Slot["category"]) {
  if (category === "gift_card") return "Buy a gift card ↗";
  if (category === "meal") return "Order here ↗";
  return "View item ↗";
}

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

  const visibleSlots = slots.filter((s) => matchesTab(s, tab));
  const hasNotes = registry?.allergies || registry?.meal_preferences || registry?.dropoff_notes;

  function handleClaimed(slotId: string, name: string, pending: boolean) {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, status: pending ? "pending" : "taken", claimed_by_name: pending ? null : name }
          : s
      )
    );
    // Don't close here -- the modal shows its own thank-you confirmation
    // and closes itself when the visitor clicks "Done".
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

      {hasNotes && (
        <div className="registry-notes">
          {registry.allergies && (
            <p>
              <strong>Allergies:</strong> {registry.allergies}
            </p>
          )}
          {registry.meal_preferences && (
            <p>
              <strong>Meal preferences:</strong> {registry.meal_preferences}
            </p>
          )}
          {registry.dropoff_notes && (
            <p>
              <strong>Drop-off notes:</strong> {registry.dropoff_notes}
            </p>
          )}
        </div>
      )}

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
              className={`slot ${slot.status !== "open" ? "taken" : ""}`}
              disabled={slot.status !== "open"}
              onClick={() => setActiveSlot(slot)}
            >
              <div className="day">{slot.day_label}</div>
              <div className="item">{slot.description}</div>
              <div className="status">
                {slot.status === "taken"
                  ? `Claimed by ${slot.claimed_by_name}`
                  : slot.status === "pending"
                    ? "Pending approval"
                    : "Open — claim it"}
              </div>
              {slot.external_url && slot.status === "open" && (
                <a
                  href={slot.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="slot-external-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {externalLinkLabel(slot.category)}
                </a>
              )}
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
  onClaimed: (slotId: string, name: string, pending: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ pending: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/registry/${slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id, name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not claim this slot.");
        return;
      }
      onClaimed(slot.id, name.trim(), !!data.pending);
      setDone({ pending: !!data.pending });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h4>Thank you!</h4>
          <p className="modal-sub" style={{ marginBottom: 16 }}>
            {done.pending
              ? `You're signed up for "${slot.description}", pending her approval. We've sent a confirmation to ${email}.`
              : `You're confirmed for "${slot.description}". We've sent a confirmation to ${email}${slot.scheduled_at ? ", with reminders coming closer to the time." : "."}`}
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ flex: 1 }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h4>{slot.description}</h4>
        <p className="modal-sub">{slot.day_label}</p>
        {slot.external_url && (
          <p className="modal-sub">
            <a href={slot.external_url} target="_blank" rel="noreferrer">
              {externalLinkLabel(slot.category)}
            </a>
          </p>
        )}
        <form onSubmit={submit}>
          <label htmlFor="claim-name">Your name</label>
          <input
            id="claim-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
          />
          <label htmlFor="claim-email">Email (for confirmation and reminders)</label>
          <input
            id="claim-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
