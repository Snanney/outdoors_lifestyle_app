/**
 * Resolves which MapLibre basemap style to use.
 *
 * Decision (see ARCHITECTURE.md): the user is fine with non-AI API keys, so we
 * prefer the nicer MapTiler "Outdoor" style when a key is provided via
 * `VITE_MAPTILER_KEY`. If no key is set, we fall back to the keyless
 * OpenFreeMap "liberty" style so the app always runs with zero configuration.
 */

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY?.trim();

/** Keyless fallback - free vector tiles from OpenFreeMap. */
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export interface BasemapInfo {
  style: string;
  /** Human-readable name of the active basemap, shown in the UI. */
  label: string;
  /** Attribution string to display on the map. */
  attribution: string;
  usingKey: boolean;
}

export function getBasemap(): BasemapInfo {
  if (MAPTILER_KEY) {
    return {
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
      label: "MapTiler Outdoor",
      attribution:
        '\u00A9 <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> \u00A9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      usingKey: true,
    };
  }

  return {
    style: OPENFREEMAP_STYLE,
    label: "OpenFreeMap",
    attribution:
      '\u00A9 <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> \u00A9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    usingKey: false,
  };
}
