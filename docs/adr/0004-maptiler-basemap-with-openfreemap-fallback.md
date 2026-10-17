# 0004 - MapTiler basemap with a keyless OpenFreeMap fallback

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

MapLibre needs a basemap style. We want an attractive outdoor-oriented basemap,
but the app must never fail to load just because an API key is missing or
unconfigured. (The user is fine with non-AI API keys, but zero-config should
still work.)

## Decision Drivers

- Attractive, outdoor-friendly basemap when possible.
- App always runs, even with no keys configured.
- No AI API keys anywhere in the project.

## Considered Options

- MapTiler "Outdoor" style (free, non-AI key) with OpenFreeMap fallback.
- OpenStreetMap raster tiles (keyless, heavier/less crisp).
- Protomaps self-hosted `.pmtiles` (fully offline, more setup).
- MapTiler only (breaks with no key).

## Decision Outcome

Chosen option: "MapTiler with a keyless OpenFreeMap fallback". If
`VITE_MAPTILER_KEY` is set we use MapTiler's Outdoor style; otherwise we fall
back to the keyless OpenFreeMap style. See
[`src/map/basemap.ts`](../../src/map/basemap.ts).

### Consequences

- Good, because the app runs with zero configuration (OpenFreeMap).
- Good, because a nicer style is one env var away (MapTiler).
- Bad, because there are two basemap styles to reason about and test.
- Neutral, because switching providers later only touches `basemap.ts`.

## More Information

- The only optional key in the project is for map tiles - never for AI.
- Env example: [`.env.example`](../../.env.example).
