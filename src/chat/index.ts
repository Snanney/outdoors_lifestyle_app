/**
 * Public interface for the `chat` module. The widget is the public surface; the
 * engine and intents are internal (a different implementation could sit behind
 * the same widget). See ADR-0007 and ADR-0008.
 */
export { ChatWidget } from "./ChatWidget";
