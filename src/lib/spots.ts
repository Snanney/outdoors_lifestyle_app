import type { Spot, SpotGeoJSON } from "./types";

/** Public path to the bundled seed data (served from /public). */
const DATA_URL = `${import.meta.env.BASE_URL}data/utah-trails.geojson`;

let cache: Promise<{ geojson: SpotGeoJSON; spots: Spot[] }> | null = null;

/**
 * Loads and parses the Utah seed GeoJSON exactly once.
 * Returns both the raw GeoJSON (for the map source) and a flattened
 * `Spot[]` list (convenient for the UI).
 */
export function loadSpots(): Promise<{ geojson: SpotGeoJSON; spots: Spot[] }> {
  if (!cache) {
    cache = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load seed data (${res.status})`);
        return res.json() as Promise<SpotGeoJSON>;
      })
      .then((geojson) => {
        const spots: Spot[] = geojson.features.map((f) => ({
          ...f.properties,
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
        }));
        return { geojson, spots };
      });
  }
  return cache;
}
