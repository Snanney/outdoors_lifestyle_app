# 0007 - Use a rule-based offline chatbot (no API keys)

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

The app includes an AI chat helper. The explicit requirement was a "lite" AI -
"not a big one, so no API keys or anything like that." We need useful answers
about the app and Utah outdoors without any external AI service.

## Decision Drivers

- No API keys and no external AI service.
- Instant, private, zero-cost, works offline.
- Answers should stay in sync with the app's data.

## Considered Options

- Rule-based intent matching over the local data.
- A small in-browser LLM (e.g. WebLLM / transformers.js).
- A hybrid: rules first, optional local model later.

## Decision Outcome

Chosen option: "Rule-based intent matching". The engine normalizes the message
and runs it past ordered intent matchers; first match wins, otherwise a friendly
fallback. Several intents are data-driven (e.g. "easy trails", "what's in
Zion?") and read the same seed data the map uses, so answers stay consistent.
See [`src/chat/chatEngine.ts`](../../src/chat/chatEngine.ts) and
[`src/chat/intents.ts`](../../src/chat/intents.ts).

### Consequences

- Good, because it is instant, fully offline, private, and free.
- Good, because answers reuse the app's real data.
- Bad, because it only understands patterns we encode - no open-ended reasoning.
- Neutral, because a small in-browser model could later sit behind the same
  `getReply` interface without changing callers.

## More Information

- The widget is [`src/chat/ChatWidget.tsx`](../../src/chat/ChatWidget.tsx).
