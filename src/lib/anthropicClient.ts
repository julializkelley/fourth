import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function anthropicClient() {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Anthropic is not configured. Add ANTHROPIC_API_KEY to .env.local."
    );
  }

  client = new Anthropic({ apiKey });
  return client;
}
