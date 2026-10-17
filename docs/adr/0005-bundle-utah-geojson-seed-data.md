# 0005 - Bundle a small Utah GeoJSON seed dataset

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

We need trail/park data to demonstrate the app. The requirement was "something
that pulls only from the Utah area, nothing crazy big - just enough to show the
idea is working." We want it to work offline and be easy to extend.

## Decision Drivers

- Utah-only, small dataset for now.
- Fully offline, no external data dependency.
- Trivial to read and extend by hand.

## Considered Options

- Bundled GeoJSON seed file in `public/`.
- Live OpenStreetMap data via the Overpass API.
- US National Park Service API (needs a key).
- A mix: bundled now, live later.

## Decision Outcome

Chosen option: "Bundled GeoJSON seed file" at
[`public/data/utah-trails.geojson`](../../public/data/utah-trails.geojson) -
Utah's Mighty 5 national parks plus a handful of popular trails. It is instant,
offline, and extended by adding features with the same properties
(`id, name, type, difficulty, length_mi, region, description`).

### Consequences

- Good, because there is no network dependency to break and it works offline.
- Good, because adding data is a simple edit.
- Bad, because data is small, approximate, and manually maintained.
- Neutral, because the loader in [`src/lib/spots.ts`](../../src/lib/spots.ts) is
  the single swap point for a future live source.

## More Information

- Related: ADR-0006 (local persistence) keeps user data on-device too.
