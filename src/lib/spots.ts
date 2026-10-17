import type { Spot, SpotGeoJSON, SpotGeoJSONFeature } from "./types";

export type SpotSource = "live" | "bundled";

export interface LoadedSpots {
  geojson: SpotGeoJSON;
  spots: Spot[];
  source: SpotSource;
}

/** Public path to the bundled seed data (served from /public). */
const DATA_URL = `${import.meta.env.BASE_URL}data/utah-trails.geojson`;

/** Builds a GeoJSON FeatureCollection from a flat Spot[] (for the map source). */
export function toGeoJSON(spots: Spot[]): SpotGeoJSON {
  return {
    type: "FeatureCollection",
    features: spots.map(
      (s): SpotGeoJSONFeature => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [s.lng, s.lat] },
        properties: {
          id: s.id,
          name: s.name,
          type: s.type,
          difficulty: s.difficulty,
          length_mi: s.length_mi,
          region: s.region,
          description: s.description,
        },
      })
    ),
  };
}

function spotsFromGeoJSON(geojson: SpotGeoJSON): Spot[] {
  return geojson.features.map((f) => ({
    ...f.properties,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));
}

let bundledCache: Promise<LoadedSpots> | null = null;

/**
 * Loads the bundled Utah seed GeoJSON (offline, instant). This is both the
 * default content and the fallback when live data is unavailable (ADR-0010).
 */
export function loadBundledSpots(): Promise<LoadedSpots> {
  if (!bundledCache) {
    bundledCache = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load seed data (${res.status})`);
        return res.json() as Promise<SpotGeoJSON>;
      })
      .then((geojson) => ({
        geojson,
        spots: spotsFromGeoJSON(geojson),
        source: "bundled" as const,
      }));
  }
  return bundledCache;
}
