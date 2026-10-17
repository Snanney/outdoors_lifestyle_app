# 0009 - Dark mode and AllTrails-inspired visual theming

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

The initial UI was functional but plain. We wanted it to look polished and
modern, and to support dark mode - both for user preference and for low-light
outdoor use. We also wanted a credible visual language rather than an ad-hoc one.

## Decision Drivers

- A refined, trustworthy "field guide" aesthetic.
- First-class light and dark themes, including the map.
- Keep it offline-first (no CDN fonts) and keyless-friendly.
- Reuse the existing data/marker colors so the map stays readable in both themes.

## Considered Options

- A CSS-variable theme system with light/dark palettes, modeled on top-rated
  outdoor apps (AllTrails primary; Komoot and dark map UIs as references).
- A component/UI library (e.g. shadcn, MUI) with built-in theming.
- Minimal tweaks to the existing styles only.

## Decision Outcome

Chosen option: "CSS-variable theme system modeled on AllTrails". We use
`data-theme` on `<html>` to switch token sets, a forest-green brand with the
easy/moderate/hard difficulty color scale shown as pills on every trail card,
glass/blur floating chrome so the map stays the focus, and self-hosted Inter
(`@fontsource-variable/inter`) for offline-safe typography. The basemap is
theme-aware (ADR-0004): a light style in light mode, a dark style in dark mode.
Theme choice follows the OS by default and persists on-device (ADR-0006).

### Consequences

- Good, because the app looks modern and is comfortable in light or dark.
- Good, because no runtime CSS framework was added - just tokens and Inter.
- Good, because difficulty is encoded by color, pill text, and the list dot
  (not color alone), which helps accessibility.
- Bad, because switching the basemap theme calls `map.setStyle`, which wipes
  custom layers; we re-add the spot source/layers and re-apply favorites and
  filters on `styledata` to handle this.
- Neutral, because `backdrop-filter` glass degrades gracefully to a solid panel
  where unsupported.

## More Information

- Theme hook: `src/features/theme/useTheme.ts`. Tokens: `src/index.css`.
- References: AllTrails (green + difficulty scale, Inter), Komoot (warm surfaces),
  Mapbox Dark / GeoLibre (dark map + glass panels).
