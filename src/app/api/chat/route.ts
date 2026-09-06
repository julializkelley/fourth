import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropicClient } from "@/lib/anthropicClient";
import { checkRiskLanguage } from "@/lib/moderation";
import { searchProducts, type Product } from "@/lib/productCatalog";

const SYSTEM_PROMPT = `You are the support companion inside Fourth, an app for women in the postpartum period (the "fourth trimester"). You're talking with mothers who may be visiting at any hour -- often exhausted, overwhelmed, or scared, sometimes at 2am with a baby who won't sleep.

Your scope:
- Offer emotional support, validation, and general education about what's normal in postpartum recovery -- physical healing, sleep, feeding, mood changes, identity shifts.
- Help her feel heard and less alone. That is the primary job.
- You are not a therapist, doctor, or crisis counselor. Never diagnose. Never recommend specific treatments, medications, or dosages.
- If she describes symptoms that could indicate postpartum depression, anxiety, OCD, or psychosis, name that gently and encourage her to reach out to a professional or Postpartum Support International (call or text "HELP" to 1-800-944-4773) -- without trying to diagnose her yourself.
- If she expresses any thoughts of harming herself or her baby, warmly and directly redirect her to call or text 988 (Suicide & Crisis Lifeline) or the National Maternal Mental Health Hotline (1-833-852-6262), both free and available 24/7. Do not try to handle that yourself -- your job is to get her to a human, fast.
- Tone: warm, direct, unpretentious -- like a knowledgeable friend at 2am, not a clinical pamphlet. Short paragraphs. No toxic positivity, no "I understand exactly how you feel" -- you don't, so validate concretely instead of claiming to relate.
- If she asks what to buy, or is deciding between products, or a product would genuinely help what she's describing, use the search_products tool to pull real curated options rather than describing products from memory. Mention them briefly and naturally -- the app will show the actual cards below your message, so don't repeat every detail.`;

const CRISIS_REPLY =
  "It sounds like things feel really heavy right now, and I want to make sure you get real support, not just words from me. Please reach out right now to the 988 Suicide & Crisis Lifeline (call or text 988) or the National Maternal Mental Health Hotline (call 1-833-852-6262) -- both are free, confidential, and available 24/7. You don't have to be okay to call them.";

const SEARCH_PRODUCTS_TOOL: Anthropic.Tool = {
  name: "search_products",
  description:
    "Search Fourth's curated, editorially-independent list of postpartum product recommendations (nursing wear, pumps, recovery items, sleep aids, etc). Use when the mom asks for a product recommendation or is deciding what to buy.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "What she's looking for, e.g. 'nursing bra' or 'help with sore nipples'.",
      },
    },
    required: ["query"],
  },
};

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_TOOL_ITERATIONS = 3;

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
    const client = anthropicClient();
    const workingMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const productsShown: Product[] = [];
    let finalReply = "";

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [SEARCH_PRODUCTS_TOOL],
        messages: workingMessages,
      });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) {
        const textBlock = response.content.find((b) => b.type === "text");
        finalReply = textBlock && "text" in textBlock ? textBlock.text : "";
        break;
      }

      workingMessages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolUseBlocks) {
        if (tool.name === "search_products") {
          const query = typeof (tool.input as { query?: unknown })?.query === "string"
            ? (tool.input as { query: string }).query
            : "";
          const results = searchProducts(query);
          productsShown.push(...results);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify(
              results.map((r) => ({ name: r.name, description: r.description, priceRange: r.priceRange }))
            ),
          });
        } else {
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: "Unknown tool.",
            is_error: true,
          });
        }
      }

      workingMessages.push({ role: "user", content: toolResults });

      if (response.stop_reason !== "tool_use") {
        const textBlock = response.content.find((b) => b.type === "text");
        finalReply = textBlock && "text" in textBlock ? textBlock.text : "";
        break;
      }
    }

    // Dedupe products (same item could surface across multiple tool calls).
    const uniqueProducts = Array.from(new Map(productsShown.map((p) => [p.name, p])).values());

    return NextResponse.json({
      reply: finalReply || "Sorry, I lost my train of thought there. Could you try that again?",
      flagged: risk.severity === "soft",
      severity: risk.severity === "soft" ? "soft" : undefined,
      products: uniqueProducts.length > 0 ? uniqueProducts : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the chat right now. Please try again." },
      { status: 500 }
    );
  }
}
