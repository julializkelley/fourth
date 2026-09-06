import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/resend";
import { dayBeforeReminderEmail, hoursBeforeReminderEmail } from "@/lib/registryEmails";

// "9am the day before" is computed relative to whoever set the slot's time
// (scheduled_tz_offset_minutes, captured via JS getTimezoneOffset() at
// creation) rather than the server's UTC clock, so it lands close to a real
// local 9am rather than 9am UTC.
function dayBeforeNineAmUtc(scheduledAtIso: string, offsetMinutes: number | null): Date {
  const offset = offsetMinutes ?? 0;
  const scheduledUtcMs = new Date(scheduledAtIso).getTime();
  const localMs = scheduledUtcMs - offset * 60_000;
  const local = new Date(localMs);
  const dayBeforeLocalNineAm = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - 1,
    9,
    0,
    0
  );
  return new Date(dayBeforeLocalNineAm + offset * 60_000);
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = supabaseAdmin();
  const now = new Date();
  const results = { dayBeforeSent: 0, hoursBeforeSent: 0, errors: 0 };

  // Day-before reminders: look ahead far enough to cover any slot whose
  // "day before 9am" threshold could plausibly have arrived.
  const dayBeforeCutoff = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: dayBeforeCandidates } = await db
    .from("registry_slots")
    .select("*, registries!inner(mom_name)")
    .eq("status", "taken")
    .is("reminder_day_before_sent_at", null)
    .not("scheduled_at", "is", null)
    .not("claimed_by_contact", "is", null)
    .lte("scheduled_at", dayBeforeCutoff)
    .gt("scheduled_at", now.toISOString());

  for (const slot of dayBeforeCandidates ?? []) {
    if (!slot.scheduled_at) continue;
    const threshold = dayBeforeNineAmUtc(slot.scheduled_at, slot.scheduled_tz_offset_minutes);
    if (now < threshold) continue;

    try {
      const momName = (slot as unknown as { registries: { mom_name: string } }).registries.mom_name;
      const { subject, html } = dayBeforeReminderEmail(momName, slot.description, slot.day_label, slot.scheduled_at);
      await sendEmail({ to: slot.claimed_by_contact!, subject, html });
      await db
        .from("registry_slots")
        .update({ reminder_day_before_sent_at: now.toISOString() })
        .eq("id", slot.id);
      results.dayBeforeSent++;
    } catch {
      results.errors++;
    }
  }

  // Hours-before reminders: fixed 4-hour-before threshold, no timezone math
  // needed since it's a duration relative to an absolute instant.
  const hoursBeforeCutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const { data: hoursBeforeCandidates } = await db
    .from("registry_slots")
    .select("*, registries!inner(mom_name)")
    .eq("status", "taken")
    .is("reminder_hours_before_sent_at", null)
    .not("scheduled_at", "is", null)
    .not("claimed_by_contact", "is", null)
    .lte("scheduled_at", hoursBeforeCutoff)
    .gt("scheduled_at", now.toISOString());

  for (const slot of hoursBeforeCandidates ?? []) {
    if (!slot.scheduled_at) continue;
    const threshold = new Date(new Date(slot.scheduled_at).getTime() - 4 * 60 * 60 * 1000);
    if (now < threshold) continue;

    try {
      const momName = (slot as unknown as { registries: { mom_name: string } }).registries.mom_name;
      const { subject, html } = hoursBeforeReminderEmail(momName, slot.description, slot.day_label, slot.scheduled_at);
      await sendEmail({ to: slot.claimed_by_contact!, subject, html });
      await db
        .from("registry_slots")
        .update({ reminder_hours_before_sent_at: now.toISOString() })
        .eq("id", slot.id);
      results.hoursBeforeSent++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json(results);
}
