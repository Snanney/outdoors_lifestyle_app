# Architecture Decision Records (ADRs)

This directory records the significant architecture decisions for Trailhead using
the [MADR](https://adr.github.io/madr/) format (Markdown Any Decision Records).

Each ADR is an immutable record of one decision: its context, the options we
considered, and the outcome with its consequences. When a decision changes, we
don't rewrite history - we add a new ADR and mark the old one as superseded.

## Why ADRs

- Capture the "why", not just the "what", close to the code.
- Make trade-offs explicit and reviewable.
- Give newcomers (and future us) the context behind the current design.

See [`ARCHITECTURE.md`](../../ARCHITECTURE.md) for the high-level overview that
ties these decisions together.

## How to add a new ADR

1. Copy [`adr-template.md`](adr-template.md) to `NNNN-short-title.md`, where
   `NNNN` is the next number in sequence (zero-padded).
2. Fill in the sections. Keep it short and concrete.
3. Set the status to `accepted` once agreed. If it replaces an earlier decision,
   set that ADR's status to `superseded by [ADR-NNNN](NNNN-...)`.
4. Add the ADR to the index below.

## Status values

- `proposed` - under discussion
- `accepted` - the current decision
- `deprecated` - no longer relevant
- `superseded by [ADR-XXXX]` - replaced by a newer decision

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions using MADR | accepted |
| [0002](0002-use-react-vite-typescript.md) | Use React + Vite + TypeScript | accepted |
| [0003](0003-deliver-as-installable-pwa.md) | Deliver the app as an installable PWA | accepted |
| [0004](0004-maptiler-basemap-with-openfreemap-fallback.md) | MapTiler basemap with a keyless OpenFreeMap fallback | accepted |
| [0005](0005-bundle-utah-geojson-seed-data.md) | Bundle a small Utah GeoJSON seed dataset | accepted |
| [0006](0006-device-local-persistence.md) | Store user data device-locally only | accepted |
| [0007](0007-rule-based-offline-chatbot.md) | Use a rule-based offline chatbot (no API keys) | accepted |
| [0008](0008-module-public-interfaces.md) | Expose module public interfaces via barrel files | accepted |
| [0009](0009-dark-mode-and-visual-theming.md) | Dark mode and AllTrails-inspired visual theming | accepted |
| [0010](0010-live-osm-overpass-data.md) | Upgrade to live OpenStreetMap trail data via Overpass | accepted |
