/**
 * Public interface for the `trails` feature module: the UI components plus the
 * filter type and helpers used to wire them up. See ADR-0008.
 */
export { TrailList } from "./TrailList";
export { TrailFilters } from "./TrailFilters";
export { TrailDetail } from "./TrailDetail";
export { applyFilters, DEFAULT_FILTERS } from "./filters";
export type { Filters } from "./filters";
