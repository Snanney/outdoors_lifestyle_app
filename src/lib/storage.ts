/**
 * Tiny, dependency-free wrapper around localStorage.
 *
 * We keep persistence device-local (no backend, no accounts) by design.
 * Everything is namespaced under a single prefix and fails safe if storage
 * is unavailable (e.g. private mode, blocked cookies).
 */
const PREFIX = "outdoors.";

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore write failures (storage full / unavailable). Non-critical.
  }
}
