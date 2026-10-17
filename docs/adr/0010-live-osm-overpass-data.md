# 0010 - Upgrade to live OpenStreetMap trail data via Overpass

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

ADR-0005 bundled a small, hand-made Utah GeoJSON seed so we could demonstrate
the app offline. The user asked to "upgrade the number of trails" and wanted a
real, citable source for the data instead of a handful of manually entered
features. We still want the app to load instantly and keep working offline.

## Decision Drivers

- More trails, from a real, attributable source.
- Keyless (the project forbids AI API keys and avoids paid data keys).
- Must not break offline use or first paint.

## Considered Options

- Keep only the bundled seed data.
- Replace the seed data with live OpenStreetMap data via the Overpass API.
- Progressive: load bundled first, then upgrade to live when reachable.

## Decision Outcome

Chosen option: "Progressive load". On startup we render the bundled seed
immediately (instant, offline), then query the keyless
[Overpass API](https://overpass-api.de/api/interpreter) for named `hiking`/`foot`
route relations within Utah and, if the request succeeds, swap in the live
dataset (curated national parks + live trails). Any failure - offline, timeout,
or rate limit - leaves the bundled data in place.

- Live loader: [`src/lib/overpass.ts`](../../src/lib/overpass.ts)
- Bundled loader + fallback: [`src/lib/spots.ts`](../../src/lib/spots.ts)
- A sidebar badge shows whether the active data is "Live OSM" or "Offline
  sample".

### Consequences

- Good, because trails now come from a real, citable source (OpenStreetMap
  contributors, ODbL) with no API key.
- Good, because first paint and offline use are unaffected (bundled-first).
- Bad, because live data quality varies (missing `sac_scale`/`distance` tags
  mean some difficulty/length values are null).
- Neutral, because Overpass is best-effort and rate-limited; the fallback keeps
  the app usable regardless.

## More Information

- Attribution: data (c) OpenStreetMap contributors, licensed under ODbL.
- Supersedes the data-sourcing part of ADR-0005; the bundled seed remains as the
  offline fallback.
- Related: ADR-0004 (basemap), ADR-0006 (device-local persistence).
