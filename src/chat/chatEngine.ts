import {
  FALLBACK_REPLY,
  intents,
  type BotReply,
  type ChatContext,
} from "./intents";

/**
 * The entire "AI": normalize the message, then run it past an ordered list of
 * intent matchers. The first matching intent wins; otherwise we fall back to a
 * friendly hint. No network, no model, no API keys - fully offline and instant.
 */
export function getReply(message: string, ctx: ChatContext): BotReply {
  const normalized = message.toLowerCase().trim();
  if (!normalized) return FALLBACK_REPLY;

  for (const intent of intents) {
    if (intent.test(normalized)) {
      return intent.respond(normalized, ctx);
    }
  }
  return FALLBACK_REPLY;
}

export const WELCOME_MESSAGE =
  "Hi! I'm your offline trail guide. Ask me about Utah's parks, trails by difficulty, favorites, or how to use the map.";

export const SUGGESTIONS = [
  "Show me the parks",
  "Easy trails",
  "What's in Zion?",
  "How do I use the map?",
];
