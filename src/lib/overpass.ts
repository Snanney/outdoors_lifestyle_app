import type { Difficulty, Spot } from "./types";
import { loadBundledSpots, toGeoJSON, type LoadedSpots } from "./spots";

/**
 * Live trail data from OpenStreetMap via the Overpass API (keyless). We query
 * named hiking/foot route relations within the state of Utah and represent each
 * as a point (its center). If anything fails - offline, timeout, rate limit -
 * callers fall back to the bundled seed data. See ADR-0010.
 */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const QUERY = `
[out:json][timeout:50];
area["name"="Utah"]["admin_level"="4"]["boundary"="administrative"]->.utah;
(
  relation["route"~"^(hiking|foot)$"]["name"](area.utah);
);
out center tags 200;
`;

const MAX_TRAILS = 120;
// The public Overpass instance can be slow under load (30s+ is common), and the
// upgrade happens in the background after the bundled data is already visible,
// so we allow a generous client-side timeout.
const REQUEST_TIMEOUT_MS = 55000;

interface OverpassElement {
  type: string;
  id: number;
  center?: { lat: number; lon: number };
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

function difficultyFromSac(sac?: string): Difficulty | null {
  switch (sac) {
    case "hiking":
      return "easy";
    case "mountain_hiking":
      return "moderate";
    case "demanding_mountain_hiking":
    case "alpine_hiking":
    case "demanding_alpine_hiking":
    case "difficult_alpine_hiking":
      return "hard";
    default:
      return null;
  }
}

function lengthMiFromTags(tags: Record<string, string>): number | null {
  const raw = tags.distance ?? tags.length;
  if (!raw) return null;
  const km = parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (!isFinite(km) || km <= 0) return null;
  return Math.round(km * 0.621371 * 10) / 10;
}

async function fetchOverpassTrails(): Promise<Spot[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(QUERY),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
    const json = (await res.json()) as { elements: OverpassElement[] };

    const seen = new Set<string>();
    const spots: Spot[] = [];
    for (const el of json.elements) {
      const tags = el.tags;
      if (!tags?.name) continue;
      const lat = el.center?.lat ?? el.lat;
      const lon = el.center?.lon ?? el.lon;
      if (lat == null || lon == null) continue;

      const name = tags.name.trim();
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const fromTo =
        tags.from && tags.to ? ` from ${tags.from} to ${tags.to}` : "";
      spots.push({
        id: `osm-${el.type}-${el.id}`,
        name,
        type: "trail",
        difficulty: difficultyFromSac(tags.sac_scale),
        length_mi: lengthMiFromTags(tags),
        region: tags.operator || tags.network || "Utah",
        description: `Hiking route${fromTo}. Source: OpenStreetMap contributors.`,
        lng: lon,
        lat,
      });
      if (spots.length >= MAX_TRAILS) break;
    }
    return spots;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Attempts to load live OSM trails and merges them with the bundled national
 * parks (so the curated parks always appear). Returns null on any failure so
 * the caller keeps the bundled data.
 */
export async function loadLiveSpots(): Promise<LoadedSpots | null> {
  try {
    const trails = await fetchOverpassTrails();
    if (trails.length === 0) return null;
    const bundled = await loadBundledSpots();
    const parks = bundled.spots.filter((s) => s.type === "park");
    const spots = [...parks, ...trails];
    return { spots, geojson: toGeoJSON(spots), source: "live" };
  } catch {
    return null;
  }
}
