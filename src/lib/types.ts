export type FeatureType = "park" | "trail";
export type Difficulty = "easy" | "moderate" | "hard";

/** Properties attached to every feature in the Utah seed GeoJSON. */
export interface SpotProperties {
  id: string;
  name: string;
  type: FeatureType;
  difficulty: Difficulty | null;
  length_mi: number | null;
  region: string;
  description: string;
}

/** A single map point (park or trail). */
export interface Spot extends SpotProperties {
  lng: number;
  lat: number;
}

/** Minimal GeoJSON typings for the seed file we load. */
export interface SpotGeoJSONFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: SpotProperties;
}

export interface SpotGeoJSON {
  type: "FeatureCollection";
  metadata?: Record<string, unknown>;
  features: SpotGeoJSONFeature[];
}
