# 0008 - Expose module public interfaces via barrel files

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

As features grow, components were importing each other via deep relative paths
(e.g. the trail list reaching into `map/layers`). That couples modules to each
other's internals and makes refactoring risky. We want clearer boundaries so each
module has an explicit, intentional public surface.

## Decision Drivers

- Clear separation between a module's public API and its internals.
- Easier refactoring - internals can change without breaking callers.
- Minimal tooling and ceremony.

## Considered Options

- An `index.ts` "public interface" (barrel) per module; callers import only from it.
- Barrels plus an ESLint rule forbidding deep imports into module internals.
- Restructure folders into `src/modules/*` as well.

## Decision Outcome

Chosen option: "An `index.ts` public interface per module". Each module
(`lib`, `map`, `chat`, `features/trails`, `features/favorites`) exposes a barrel
that re-exports only its intended public API. Cross-module imports go through
these barrels; deep relative imports are reserved for a module's own internals.
Shared design tokens (`COLORS`) moved to `lib` so they are no longer pulled from
`map` internals.

### Consequences

- Good, because each module's public surface is explicit and small.
- Good, because internal files can be moved/renamed without touching callers.
- Bad, because barrels add a small amount of indirection and can affect
  tree-shaking if abused (we keep them thin and side-effect free).
- Neutral, because enforcement is by convention for now; an ESLint boundary rule
  (option 2) can be added later as a new ADR if drift becomes a problem.

## More Information

- Public interfaces: `src/lib/index.ts`, `src/map/index.ts`, `src/chat/index.ts`,
  `src/features/trails/index.ts`, `src/features/favorites/index.ts`.
