import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/resend";
import { claimConfirmationEmail } from "@/lib/registryEmails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.slotId !== "string" || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Your name is required to claim a slot." }, { status: 400 });
  }

  if (typeof body.email !== "string" || !EMAIL_RE.test(body.email.trim())) {
    return NextResponse.json({ error: "A valid email is required to claim a slot." }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: registry, error: registryError } = await db
    .from("registries")
    .select("id, mom_name")
    .eq("slug", slug)
    .single();

  if (registryError || !registry) {
    return NextResponse.json({ error: "Registry not found." }, { status: 404 });
  }

  const claimedByName = body.name.trim();
  const claimedByEmail = body.email.trim();

  const { data: approvedMatches } = await db
    .from("registry_approved_contacts")
    .select("name, contact")
    .eq("registry_id", registry.id);

  const isPreApproved = (approvedMatches ?? []).some((c) => {
    const nameMatch = c.name.trim().toLowerCase() === claimedByName.toLowerCase();
    const contactMatch = !!c.contact && c.contact.trim().toLowerCase() === claimedByEmail.toLowerCase();
    return nameMatch || contactMatch;
  });

  const newStatus = isPreApproved ? "taken" : "pending";

  const { data: updated, error } = await db
    .from("registry_slots")
    .update({
      status: newStatus,
      claimed_by_name: claimedByName,
      claimed_by_contact: claimedByEmail,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", body.slotId)
    .eq("registry_id", registry.id)
    .eq("status", "open")
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: "That slot was just claimed by someone else. Try another one." },
      { status: 409 }
    );
  }

  try {
    const { subject, html } = claimConfirmationEmail(
      registry.mom_name,
      updated.description,
      updated.day_label,
      updated.scheduled_at
    );
    await sendEmail({ to: claimedByEmail, subject, html });
  } catch {
    // Don't fail the claim if the email couldn't be sent -- the signup
    // itself already succeeded and is the important part.
  }

  return NextResponse.json({ ok: true, slot: updated, pending: newStatus === "pending" });
}
