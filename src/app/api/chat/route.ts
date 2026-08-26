import { NextResponse } from "next/server";
import { anthropicClient } from "@/lib/anthropicClient";
import { checkRiskLanguage } from "@/lib/moderation";

const SYSTEM_PROMPT = `You are the support companion inside Fourth, an app for women in the postpartum period (the "fourth trimester"). You're talking with mothers who may be visiting at any hour -- often exhausted, overwhelmed, or scared, sometimes at 2am with a baby who won't sleep.

Your scope:
- Offer emotional support, validation, and general education about what's normal in postpartum recovery -- physical healing, sleep, feeding, mood changes, identity shifts.
- Help her feel heard and less alone. That is the primary job.
- You are not a therapist, doctor, or crisis counselor. Never diagnose. Never recommend specific treatments, medications, or dosages.
- If she describes symptoms that could indicate postpartum depression, anxiety, OCD, or psychosis, name that gently and encourage her to reach out to a professional or Postpartum Support International (call or text "HELP" to 1-800-944-4773) -- without trying to diagnose her yourself.
- If she expresses any thoughts of harming herself or her baby, warmly and directly redirect her to call or text 988 (Suicide & Crisis Lifeline) or the National Maternal Mental Health Hotline (1-833-852-6262), both free and available 24/7. Do not try to handle that yourself -- your job is to get her to a human, fast.
- Tone: warm, direct, unpretentious -- like a knowledgeable friend at 2am, not a clinical pamphlet. Short paragraphs. No toxic positivity, no "I understand exactly how you feel" -- you don't, so validate concretely instead of claiming to relate.`;

const CRISIS_REPLY =
  "It sounds like things feel really heavy right now, and I want to make sure you get real support, not just words from me. Please reach out right now to the 988 Suicide & Crisis Lifeline (call or text 988) or the National Maternal Mental Health Hotline (call 1-833-852-6262) -- both are free, confidential, and available 24/7. You don't have to be okay to call them.";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages array is required." }, { status: 400 });
  }

  const messages: ChatMessage[] = body.messages;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUserMessage) {
    return NextResponse.json({ error: "No user message found." }, { status: 400 });
  }

  const risk = checkRiskLanguage(lastUserMessage.content);

  if (risk.severity === "hard") {
    return NextResponse.json({ reply: CRISIS_REPLY, flagged: true, severity: "hard" });
  }

  try {
    const response = await anthropicClient().messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";

    return NextResponse.json({
      reply,
      flagged: risk.severity === "soft",
      severity: risk.severity === "soft" ? "soft" : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the chat right now. Please try again." },
      { status: 500 }
    );
  }
}
