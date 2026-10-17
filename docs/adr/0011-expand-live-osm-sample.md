# 0011 - Expand the live OSM sample with a second Overpass wave

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

ADR-0010 loaded live Utah hiking-route *relations* via Overpass and capped the
result at ~120. That left out the majority of OSM trails, which are tagged as
named `path` / `footway` *ways*. The user asked for a bigger sample when online
without breaking the bundled offline fallback.

## Decision Drivers

- More trails when the network is available.
- Still instant first paint and a working offline fallback.
- Stay keyless (public Overpass only).
- Avoid one giant query that routinely times out.

## Considered Options

- Raise the existing relation query cap only.
- One combined Overpass query for relations + every named path (too large).
- Two waves: official hiking routes first, then named hiking paths.

## Decision Outcome

Chosen option: "Two waves". After the bundled seed, we:

1. Fetch named `route=hiking|foot` relations (fast, official network) and
   publish them as soon as they arrive.
2. Fetch named `path`/`footway` ways that look like real hikes (`sac_scale` or
   `foot=designated`) and merge them in, deduped by name, up to 500 trails.

If the primary Overpass instance fails, we retry
`overpass.kumi.systems`. Any failure leaves the best data we already have.

### Consequences

- Good, because online users see several times more trails than wave 1 alone.
- Good, because the map still upgrades in stages instead of waiting for both
  queries.
- Bad, because a second public Overpass call can still be slow or rate-limited.
- Neutral, because quality still depends on OSM tagging; many paths have no
  length or difficulty.

## More Information

- Related: ADR-0010 (live Overpass), ADR-0005 (bundled seed fallback).
