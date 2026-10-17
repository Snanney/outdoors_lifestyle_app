/**
 * Public interface for the `lib` module: shared types, storage, data loading,
 * and design tokens. Import these from "../lib" (or "../../lib") rather than
 * reaching into individual files. See ADR-0008.
 */
export type {
  FeatureType,
  Difficulty,
  SpotProperties,
  Spot,
  SpotGeoJSONFeature,
  SpotGeoJSON,
} from "./types";
export { readJSON, writeJSON } from "./storage";
export { loadBundledSpots, toGeoJSON } from "./spots";
export type { SpotSource, LoadedSpots } from "./spots";
export { loadLiveSpots } from "./overpass";
export { COLORS } from "./colors";
