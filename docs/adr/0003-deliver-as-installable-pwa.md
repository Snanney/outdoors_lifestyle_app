# 0003 - Deliver the app as an installable PWA

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

Users want to "pull up" the app on computers and phones/tablets. We need a single
delivery model that works across those devices, ideally with offline support and
without app-store friction.

## Decision Drivers

- One codebase for desktop and mobile/tablet.
- Installable to a home screen / desktop.
- Offline capability for a map app in the field.
- Avoid app-store review and distribution overhead.

## Considered Options

- Installable PWA (responsive web app + service worker).
- Plain responsive website (no offline/install).
- Web now, wrap as native later (Capacitor).

## Decision Outcome

Chosen option: "Installable PWA", implemented with `vite-plugin-pwa` (Workbox).
It installs to desktop and mobile home screens, works offline, and avoids app
stores. We precache the app shell and bundled seed data, and runtime-cache
basemap tiles (`CacheFirst`) so previously viewed areas still render offline.

### Consequences

- Good, because one responsive app covers all target devices.
- Good, because offline use works for already-visited areas.
- Bad, because PWA install UX and capabilities vary by browser/OS (notably iOS).
- Neutral, because we can still wrap in Capacitor later for native features.

## More Information

- Config in [`vite.config.ts`](../../vite.config.ts) (`VitePWA(...)`).
- Supersedes nothing; future native packaging would be a new ADR.
