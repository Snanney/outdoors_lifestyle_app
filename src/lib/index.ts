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
export { loadSpots } from "./spots";
export { COLORS } from "./colors";
