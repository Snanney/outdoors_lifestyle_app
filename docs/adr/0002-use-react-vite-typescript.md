# 0002 - Use React + Vite + TypeScript

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

Trailhead is a map-centric, component-driven UI that must run well on desktop and
phones/tablets. We need a frontend stack that supports fast iteration, strong
typing, and a rich map/UI ecosystem.

## Decision Drivers

- Fast dev server and build.
- Strong typing to catch errors early.
- Large ecosystem for maps and UI components.
- No server-side rendering needed (yet).

## Considered Options

- React + Vite + TypeScript
- Vue 3 + Vite + TypeScript
- SvelteKit
- Vanilla JS/HTML/CSS
- Next.js (React, SSR)

## Decision Outcome

Chosen option: "React + Vite + TypeScript", because it combines a fast Vite
toolchain, TypeScript safety, and the broadest ecosystem for MapLibre and UI
work. We don't need SSR or backend routes yet, which makes Next.js overkill, and
vanilla JS would slow feature development.

### Consequences

- Good, because iteration is fast and the component model fits the map + panels UI.
- Good, because TypeScript documents and enforces our data shapes.
- Bad, because it adds a build step and framework overhead vs vanilla.
- Neutral, because we can adopt Next.js or a backend later if needs change.

## Pros and Cons of the Options

### React + Vite + TypeScript

- Good, because mature MapLibre React patterns and huge ecosystem.
- Bad, because larger dependency surface than vanilla.

### Vanilla JS/HTML/CSS

- Good, because minimal footprint.
- Bad, because we'd hand-roll state/reactivity and lose typing ergonomics.

### Next.js

- Good, because SSR and API routes are built in.
- Bad, because unnecessary complexity for a client-only map app today.
