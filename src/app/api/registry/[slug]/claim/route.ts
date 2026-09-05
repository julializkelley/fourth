import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.slotId !== "string" || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Your name is required to claim a slot." }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: registry, error: registryError } = await db
    .from("registries")
    .select("id")
    .eq("slug", slug)
    .single();

  if (registryError || !registry) {
    return NextResponse.json({ error: "Registry not found." }, { status: 404 });
  }

  const claimedByName = body.name.trim();
  const claimedByContact = typeof body.contact === "string" ? body.contact.trim() : null;

  const { data: approvedMatches } = await db
    .from("registry_approved_contacts")
    .select("name, contact")
    .eq("registry_id", registry.id);

  const isPreApproved = (approvedMatches ?? []).some((c) => {
    const nameMatch = c.name.trim().toLowerCase() === claimedByName.toLowerCase();
    const contactMatch =
      !!c.contact && !!claimedByContact && c.contact.trim().toLowerCase() === claimedByContact.toLowerCase();
    return nameMatch || contactMatch;
  });

  const newStatus = isPreApproved ? "taken" : "pending";

  const { data: updated, error } = await db
    .from("registry_slots")
    .update({
      status: newStatus,
      claimed_by_name: claimedByName,
      claimed_by_contact: claimedByContact,
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

  return NextResponse.json({ ok: true, slot: updated, pending: newStatus === "pending" });
}
