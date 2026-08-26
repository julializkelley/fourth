export type RiskSeverity = "none" | "soft" | "hard";

export type RiskCheck = {
  severity: RiskSeverity;
  reason?: string;
};

// Hard triggers: unambiguous crisis language. On a match, the chat ends
// immediately and crisis resources are shown -- no AI call, no judgment call.
const HARD_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bkill (myself|me)\b/i, reason: "self-harm" },
  { pattern: /\b(want|wish) to (die|be dead)\b/i, reason: "self-harm" },
  { pattern: /\bend(ing)? my life\b/i, reason: "self-harm" },
  { pattern: /\bsuicid(e|al)\b/i, reason: "self-harm" },
  { pattern: /\b(hurt|harm|kill) (myself|the baby|my baby|him|her)\b/i, reason: "self-or-infant-harm" },
  { pattern: /\bbetter off (dead|without me)\b/i, reason: "self-harm" },
  { pattern: /\bno reason to (live|go on)\b/i, reason: "self-harm" },
  { pattern: /\bdon'?t want to (live|be here|exist) anymore\b/i, reason: "self-harm" },
];

// Soft triggers: concerning but not unambiguous -- surface resources
// alongside a continued, gentle response rather than ending the chat.
const SOFT_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bhearing voices\b/i, reason: "psychosis-warning-sign" },
  { pattern: /\bnothing feels real\b/i, reason: "psychosis-warning-sign" },
  { pattern: /\b(they'?re|someone'?s) watching me\b/i, reason: "psychosis-warning-sign" },
  { pattern: /\bcan'?t (tell|trust) what'?s real\b/i, reason: "psychosis-warning-sign" },
  { pattern: /\bnobody would (miss|notice) (me|if i)\b/i, reason: "self-harm-adjacent" },
];

// Harassment/abuse patterns for pair-chat moderation specifically -- one
// person being cruel or exploitative toward the other, not self-directed.
const ABUSE_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(kill|hurt|rape) you\b/i, reason: "threat" },
  { pattern: /\bshut up\b.*\bstupid\b/i, reason: "harassment" },
  { pattern: /\bsend (nudes|pics of yourself)\b/i, reason: "harassment" },
  { pattern: /\bwhat'?s your (address|phone number|last name)\b/i, reason: "personal-info-request" },
];

export function checkRiskLanguage(text: string): RiskCheck {
  for (const { pattern, reason } of HARD_PATTERNS) {
    if (pattern.test(text)) return { severity: "hard", reason };
  }
  for (const { pattern, reason } of ABUSE_PATTERNS) {
    if (pattern.test(text)) return { severity: "hard", reason };
  }
  for (const { pattern, reason } of SOFT_PATTERNS) {
    if (pattern.test(text)) return { severity: "soft", reason };
  }
  return { severity: "none" };
}
