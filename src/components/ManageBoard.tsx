"use client";

import { useEffect, useState } from "react";

type Slot = {
  id: string;
  category: "meal" | "item" | "care" | "gift_card";
  day_label: string;
  description: string;
  status: "open" | "pending" | "taken";
  claimed_by_name: string | null;
  claimed_by_contact: string | null;
};

type Registry = {
  id: string;
  slug: string;
  mom_name: string;
  due_label: string | null;
  allergies: string | null;
  meal_preferences: string | null;
  dropoff_notes: string | null;
};

type ApprovedContact = {
  id: string;
  name: string;
  contact: string | null;
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

const SUGGESTED_ITEMS: { category: "meal" | "item" | "care"; description: string }[] = [
  { category: "item", description: "Nursing-friendly pajamas" },
  { category: "item", description: "Perineal spray" },
  { category: "item", description: "Postnatal vitamins" },
  { category: "item", description: "Nursing pillow" },
  { category: "item", description: "Diapers, size 2" },
  { category: "care", description: "2 hours of childcare" },
  { category: "care", description: "A grocery run" },
  { category: "care", description: "A load of laundry, done" },
  { category: "meal", description: "A home-cooked meal" },
];

const GIFT_CARDS = [
  {
    description: "$25 DoorDash gift card",
    url: "https://www.doordash.com/gift-cards/",
  },
  {
    description: "$25 Uber Eats gift card",
    url: "https://www.ubereats.com/gift-cards",
  },
];

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
  const [approvedContacts, setApprovedContacts] = useState<ApprovedContact[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ready">(token ? "loading" : "denied");

  const [category, setCategory] = useState<"meal" | "item" | "care">("item");
  const [day, setDay] = useState("any");
  const [timeframe, setTimeframe] = useState("any");
  const [recurrence, setRecurrence] = useState("once");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [adding, setAdding] = useState(false);

  const [allergies, setAllergies] = useState("");
  const [mealPreferences, setMealPreferences] = useState("");
  const [dropoffNotes, setDropoffNotes] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsLoaded, setDetailsLoaded] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [addingContact, setAddingContact] = useState(false);

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
        setApprovedContacts(data.approvedContacts ?? []);
        if (!detailsLoaded) {
          setAllergies(data.registry?.allergies ?? "");
          setMealPreferences(data.registry?.meal_preferences ?? "");
          setDropoffNotes(data.registry?.dropoff_notes ?? "");
          setDetailsLoaded(true);
        }
        setState("ready");
      })
      .catch(() => setState("denied"));
  }

  useEffect(load, [slug, token]); // eslint-disable-line react-hooks/exhaustive-deps

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

    let scheduledAt: string | undefined;
    let scheduledTzOffsetMinutes: number | undefined;
    if (scheduledDate && scheduledTime) {
      const [y, m, d] = scheduledDate.split("-").map(Number);
      const [hh, mm] = scheduledTime.split(":").map(Number);
      const local = new Date(y, m - 1, d, hh, mm);
      scheduledAt = local.toISOString();
      scheduledTzOffsetMinutes = local.getTimezoneOffset();
    }

    await runAction({
      action: "add",
      category,
      dayLabel,
      description,
      externalUrl,
      scheduledAt,
      scheduledTzOffsetMinutes,
    });
    setDescription("");
    setExternalUrl("");
    setScheduledDate("");
    setScheduledTime("");
    setAdding(false);
  }

  async function quickAdd(category: "meal" | "item" | "care" | "gift_card", description: string, externalUrl?: string) {
    await runAction({ action: "add", category, dayLabel: "ANYTIME", description, externalUrl });
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSavingDetails(true);
    await runAction({ action: "update_details", allergies, mealPreferences, dropoffNotes });
    setSavingDetails(false);
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim()) return;
    setAddingContact(true);
    await runAction({ action: "add_approved_contact", name: contactName, contact: contactInfo });
    setContactName("");
    setContactInfo("");
    setAddingContact(false);
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

  const pendingSlots = slots.filter((s) => s.status === "pending");
  const otherSlots = slots.filter((s) => s.status !== "pending");

  return (
    <>
      <p className="section-lede">
        Managing <strong>{registry?.mom_name}&rsquo;s</strong> registry.
      </p>

      {pendingSlots.length > 0 && (
        <>
          <h3 className="manage-subheading">Waiting for your approval</h3>
          <div className="manage-table">
            {pendingSlots.map((slot) => (
              <div className="manage-row" key={slot.id}>
                <div className="meta">
                  <span className="day">{slot.day_label}</span>
                  {slot.description}
                  <div className="claimed-by">
                    {slot.claimed_by_name}
                    {slot.claimed_by_contact ? ` (${slot.claimed_by_contact})` : ""} wants to help
                  </div>
                </div>
                <div className="manage-actions">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => runAction({ action: "approve", slotId: slot.id })}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => runAction({ action: "reopen", slotId: slot.id })}
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="manage-subheading">Your registry</h3>
      <div className="manage-table">
        {otherSlots.length === 0 && <div className="manage-row">No slots yet — add one below.</div>}
        {otherSlots.map((slot) => (
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
          onChange={(e) => {
            setCategory(e.target.value as "meal" | "item" | "care");
            setExternalUrl("");
          }}
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

        {category === "meal" && (
          <>
            <label htmlFor="externalUrl">
              Link a restaurant, DoorDash, or Uber Eats order page (optional)
            </label>
            <input
              id="externalUrl"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://www.doordash.com/store/..."
            />
            <p className="form-note" style={{ marginTop: -12 }}>
              Prefer a gift card instead? Use the gift card section below rather than a specific
              restaurant.
            </p>
          </>
        )}

        {category === "item" && (
          <>
            <label htmlFor="externalUrl">Link the exact item (Amazon, Target, etc.) — optional</label>
            <input
              id="externalUrl"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://www.amazon.com/..."
            />
          </>
        )}

        <label htmlFor="scheduledDate">Specific date & time (optional — enables email reminders)</label>
        <div className="field-row">
          <div>
            <input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div>
            <input
              id="scheduledTime"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary form-submit" disabled={adding}>
          {adding ? "Adding…" : "Add to registry"}
        </button>
      </form>

      <h3 className="manage-subheading">Suggested items</h3>
      <p className="form-note">One click to add a common postpartum need to your registry.</p>
      <div className="suggested-chip-row">
        {SUGGESTED_ITEMS.map((item) => (
          <button
            key={item.description}
            type="button"
            className="suggested-chip"
            onClick={() => quickAdd(item.category, item.description)}
          >
            + {item.description}
          </button>
        ))}
      </div>

      <h3 className="manage-subheading">Food delivery gift cards</h3>
      <p className="form-note">
        Add a gift card as a claimable item — whoever claims it buys it directly.
      </p>
      <div className="suggested-chip-row">
        {GIFT_CARDS.map((gc) => (
          <button
            key={gc.description}
            type="button"
            className="suggested-chip"
            onClick={() => quickAdd("gift_card", gc.description, gc.url)}
          >
            + {gc.description}
          </button>
        ))}
      </div>

      <h3 className="manage-subheading">Good to know (shown to helpers)</h3>
      <form onSubmit={saveDetails} style={{ maxWidth: 480 }}>
        <label htmlFor="allergies">Allergies</label>
        <input
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g. Peanuts, shellfish"
        />
        <label htmlFor="mealPreferences">Meal preferences</label>
        <input
          id="mealPreferences"
          value={mealPreferences}
          onChange={(e) => setMealPreferences(e.target.value)}
          placeholder="e.g. Vegetarian, no spicy food"
        />
        <label htmlFor="dropoffNotes">Ideal drop-off times or instructions</label>
        <input
          id="dropoffNotes"
          value={dropoffNotes}
          onChange={(e) => setDropoffNotes(e.target.value)}
          placeholder="e.g. Weekdays after 4pm, leave on the porch"
        />
        <button type="submit" className="btn btn-secondary form-submit" disabled={savingDetails}>
          {savingDetails ? "Saving…" : "Save details"}
        </button>
      </form>

      <h3 className="manage-subheading">Pre-approved people</h3>
      <p className="form-note">
        Signups from these names or contacts confirm automatically — no approval needed.
      </p>
      <div className="manage-table">
        {approvedContacts.length === 0 && (
          <div className="manage-row">Nobody pre-approved yet.</div>
        )}
        {approvedContacts.map((c) => (
          <div className="manage-row" key={c.id}>
            <div className="meta">
              {c.name}
              {c.contact && <div className="claimed-by">{c.contact}</div>}
            </div>
            <div className="manage-actions">
              <button
                className="btn btn-danger btn-small"
                onClick={() => runAction({ action: "remove_approved_contact", contactId: c.id })}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={addContact} style={{ marginTop: 16, maxWidth: 480 }}>
        <div className="field-row">
          <div>
            <label htmlFor="contactName">Name</label>
            <input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Mom, best friend"
              required
            />
          </div>
          <div>
            <label htmlFor="contactInfo">Email (optional)</label>
            <input
              id="contactInfo"
              type="email"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="jane@email.com"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-secondary btn-small"
          disabled={addingContact || !contactName.trim()}
          style={{ marginTop: 8 }}
        >
          {addingContact ? "Adding…" : "Add to pre-approved list"}
        </button>
      </form>
    </>
  );
}
