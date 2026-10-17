import type { Difficulty, Spot } from "./types";
import { loadBundledSpots, toGeoJSON, type LoadedSpots } from "./spots";

/**
 * Live trail data from OpenStreetMap via the Overpass API (keyless).
 *
 * Two-wave fetch (ADR-0011):
 *   1. Named hiking/foot route relations (the official route network).
 *   2. Named path/footway ways tagged as hiking (sac_scale or foot=designated).
 *
 * Wave 1 is published as soon as it arrives so the map upgrades quickly; wave 2
 * merges in afterwards. Any failure falls back to whatever we already have
 * (bundled seed, or wave 1 alone).
 */

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const ROUTES_QUERY = `
[out:json][timeout:50];
area["name"="Utah"]["admin_level"="4"]["boundary"="administrative"]->.utah;
(
  relation["route"~"^(hiking|foot)$"]["name"](area.utah);
);
out center tags 400;
`;

const PATHS_QUERY = `
[out:json][timeout:50];
area["name"="Utah"]["admin_level"="4"]["boundary"="administrative"]->.utah;
(
  way["highway"~"^(path|footway)$"]["name"]["sac_scale"](area.utah);
  way["highway"="path"]["name"]["foot"="designated"](area.utah);
);
out center tags 400;
`;

const MAX_TRAILS = 500;
const REQUEST_TIMEOUT_MS = 55000;

interface OverpassElement {
  type: string;
  id: number;
  center?: { lat: number; lon: number };
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

export type LiveProgress = (partial: LoadedSpots) => void;

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

function elementsToSpots(elements: OverpassElement[], kind: "route" | "path"): Spot[] {
  const spots: Spot[] = [];
  for (const el of elements) {
    const tags = el.tags;
    if (!tags?.name) continue;
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    if (lat == null || lon == null) continue;

    const name = tags.name.trim();
    const fromTo =
      tags.from && tags.to ? ` from ${tags.from} to ${tags.to}` : "";
    const label = kind === "route" ? "Hiking route" : "Hiking path";
    spots.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      type: "trail",
      difficulty: difficultyFromSac(tags.sac_scale),
      length_mi: lengthMiFromTags(tags),
      region: tags.operator || tags.network || "Utah",
      description: `${label}${fromTo}. Source: OpenStreetMap contributors.`,
      lng: lon,
      lat,
    });
  }
  return spots;
}

async function postOverpass(
  url: string,
  query: string
): Promise<OverpassElement[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
    const json = (await res.json()) as { elements: OverpassElement[] };
    return json.elements ?? [];
  } finally {
    clearTimeout(timer);
  }
}

/** Tries the primary Overpass instance, then a public mirror. */
async function fetchQuery(query: string): Promise<OverpassElement[]> {
  let lastError: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      return await postOverpass(url, query);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Overpass request failed");
}

function mergeUnique(into: Spot[], batch: Spot[], seen: Set<string>): void {
  for (const spot of batch) {
    if (into.length >= MAX_TRAILS) return;
    const key = spot.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    into.push(spot);
  }
}

/**
 * Loads live OSM trails and merges them with the bundled national parks.
 * `onPartial` is called after the first successful wave so the UI can upgrade
 * before the second (larger) query finishes. Returns null if nothing live
 * arrived, so the caller keeps the bundled data.
 */
export async function loadLiveSpots(
  onPartial?: LiveProgress
): Promise<LoadedSpots | null> {
  try {
    const bundled = await loadBundledSpots();
    const parks = bundled.spots.filter((s) => s.type === "park");
    const trails: Spot[] = [];
    const seen = new Set<string>();

    const publish = (): LoadedSpots => {
      const spots = [...parks, ...trails];
      return { spots, geojson: toGeoJSON(spots), source: "live" };
    };

    try {
      const routes = elementsToSpots(await fetchQuery(ROUTES_QUERY), "route");
      mergeUnique(trails, routes, seen);
      if (trails.length > 0) onPartial?.(publish());
    } catch {
      // Wave 1 failed; wave 2 may still succeed.
    }

    if (trails.length < MAX_TRAILS) {
      try {
        const paths = elementsToSpots(await fetchQuery(PATHS_QUERY), "path");
        mergeUnique(trails, paths, seen);
      } catch {
        // Keep whatever wave 1 produced.
      }
    }

    if (trails.length === 0) return null;
    return publish();
  } catch {
    return null;
  }
}
