# 0006 - Store user data device-locally only

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

Users can favorite spots and set filters. We need to persist that without the
complexity of accounts or a backend, at least for now.

## Decision Drivers

- No backend or accounts required yet.
- Simple, private, and offline-friendly.
- A single, clear integration point if sync is added later.

## Considered Options

- Device-local storage only (`localStorage` / IndexedDB).
- No persistence (browse only).
- Local now, design for an optional backend/accounts later.

## Decision Outcome

Chosen option: "Device-local storage only", via a small wrapper in
[`src/lib/storage.ts`](../../src/lib/storage.ts) used by the favorites hook
[`src/features/favorites/useFavorites.ts`](../../src/features/favorites/useFavorites.ts).
Writes fail safe if storage is unavailable (e.g. private mode).

### Consequences

- Good, because there is no server to run, secure, or pay for.
- Good, because user data stays private on the device.
- Bad, because favorites don't sync across devices.
- Neutral, because the favorites hook is the single point to add sync later.
