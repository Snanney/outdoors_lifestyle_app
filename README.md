# Trailhead - Outdoors Lifestyle App

An installable, map-first web app (PWA) for discovering Utah's outdoor spots. It
runs on desktop, phones, and tablets from a single codebase, works offline once
installed, and ships with a tiny rule-based chatbot that answers questions about
the app and the outdoors - **no API keys, no external AI service**.

> This README is meant to be edited by both of us. It captures what the app is
> and how to run it. For the "why" behind our decisions, see
> [`ARCHITECTURE.md`](./ARCHITECTURE.md). For the running task list, see
> [`TODO.md`](./TODO.md).

## Features

- Interactive MapLibre map centered on Utah, with parks and popular trails.
- Searchable, filterable list (by type and difficulty) synced with the map.
- Save favorites to your device (no account needed); favorites show a golden
  ring on the map.
- A small offline "Trail Guide" chatbot (rule-based) for quick questions.
- Installable PWA: add it to your phone/tablet home screen or desktop.

## Tech stack

- **React + Vite + TypeScript**
- **MapLibre GL JS** for the map
- **vite-plugin-pwa** (Workbox) for installability and offline caching
- Device-local storage (`localStorage`) for favorites - no backend

## Getting started

Prerequisites: **Node.js 18+** and npm.

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173). The dev server is
exposed on your LAN (`host: true`), so you can also open it on a phone/tablet
using your computer's IP to test the mobile layout.

### Basemap / API keys

The app needs a MapLibre basemap style:

- **Default (zero config):** if no key is set, it uses the keyless
  [OpenFreeMap](https://openfreemap.org) basemap, so it just works.
- **Optional nicer style:** add a free, non-AI
  [MapTiler](https://www.maptiler.com/) key to use the "Outdoor" style. Copy
  `.env.example` to `.env` and set:

  ```bash
  VITE_MAPTILER_KEY=your_key_here
  ```

The active basemap name is shown in the bottom-left corner of the map.

> Note: The "lite AI" chatbot never uses any API key or network model - it is
> pure local logic. The only optional key is for map tiles.

## Scripts

| Script              | Purpose                                 |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start the dev server                    |
| `npm run build`     | Type-check and build for production      |
| `npm run preview`   | Preview the production build locally     |
| `npm run typecheck` | Type-check without emitting              |

## Project structure

```
public/
  data/utah-trails.geojson   # bundled Utah seed data
  icons/                     # PWA icons (SVG)
src/
  App.tsx                    # app shell + state wiring
  map/                       # MapLibre: MapView, hook, basemap, layers
  features/trails/           # list, filters, detail, filter logic
  features/favorites/        # local favorites hook
  chat/                      # offline chatbot (engine + intents + widget)
  lib/                       # types, storage, data loader
```

## Data

The seed data in `public/data/utah-trails.geojson` is a small, hand-curated
sample of Utah national parks and popular trails - just enough to demonstrate
the concept. Extend it by adding features with the same properties
(`id`, `name`, `type`, `difficulty`, `length_mi`, `region`, `description`).
