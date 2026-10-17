/**
 * Public interface for the `map` module. Callers use the `MapView` component
 * and its imperative handle; the MapLibre hook, layer specs, and basemap
 * resolver are internal details. See ADR-0008.
 */
export { MapView } from "./MapView";
export type { MapViewHandle } from "./MapView";
export type { MapFilters } from "./useMapLibre";
