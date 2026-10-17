# TODO - Trailhead

A living task list. Check items off as we go, and add new ideas under "Backlog".

## Done (initial build)

- [x] Scaffold React + Vite + TypeScript project with `.gitignore`
- [x] Add dependencies (maplibre-gl, vite-plugin-pwa) and responsive base layout
- [x] Configure PWA (manifest, icons, service worker) for desktop + mobile install
- [x] Basemap resolver: MapTiler key + keyless OpenFreeMap fallback (`.env.example`)
- [x] MapView + `useMapLibre` hook: Utah map, GeoJSON layers, popups, fly-to
- [x] Utah seed data (`public/data/utah-trails.geojson`): Mighty 5 + popular trails
- [x] Trail list, filters, and detail panel wired to the map
- [x] Local favorites (localStorage) shown on the map and list
- [x] Offline rule-based chatbot (engine + intents + widget)
- [x] Docs: `README.md`, `TODO.md`, `ARCHITECTURE.md`

## In progress / to verify

- [ ] Verify `npm run dev` loads the map with no console errors (keyless + with key)
- [ ] Verify favorites persist across reload
- [ ] Verify chatbot answers sample questions offline
- [ ] Verify PWA installs and works on a phone/tablet viewport

## Backlog (ideas)

- [ ] Render trails as route lines (LineString), not just points
- [ ] Expand seed data; consider live OpenStreetMap/Overpass or park APIs
- [ ] "Near me" sorting using the browser geolocation control
- [ ] Trail detail: elevation, photos, external links
- [ ] Favorites: export/import, optional cloud sync + accounts
- [ ] Basemap switcher UI (outdoor/satellite/terrain)
- [ ] Richer chatbot (optional small in-browser model behind `getReply`)
- [ ] Unit tests for `applyFilters` and the chat `getReply`
- [ ] Accessibility pass (focus management, ARIA, color contrast)
- [ ] Deploy (static host) and add install instructions with screenshots

## Open questions

- Which regions beyond Utah (if any) should we add next?
- Do we want user accounts eventually, or stay fully local?
