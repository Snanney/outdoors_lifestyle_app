/**
 * Resolves which MapLibre basemap style to use for the current theme.
 *
 * Decision (see ADR-0004): the user is fine with non-AI API keys, so we prefer
 * MapTiler styles when `VITE_MAPTILER_KEY` is set, and otherwise fall back to
 * keyless OpenFreeMap styles so the app always runs with zero configuration.
 *
 * The basemap follows the app theme (ADR: dark mode): a light style in light
 * mode and a dark style in dark mode, so map and UI stay visually consistent.
 */

export type BasemapTheme = "light" | "dark";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY?.trim();

// Keyless fallbacks - free vector tiles from OpenFreeMap.
const OPENFREEMAP = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

// MapTiler styles (require a free, non-AI key).
const MAPTILER = {
  light: "outdoor-v2",
  dark: "streets-v2-dark",
} as const;

const OSM_ATTR =
  '\u00A9 <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

export interface BasemapInfo {
  style: string;
  /** Human-readable name of the active basemap, shown in the UI. */
  label: string;
  /** Attribution string to display on the map. */
  attribution: string;
  usingKey: boolean;
}

export function getBasemap(theme: BasemapTheme): BasemapInfo {
  if (MAPTILER_KEY) {
    return {
      style: `https://api.maptiler.com/maps/${MAPTILER[theme]}/style.json?key=${MAPTILER_KEY}`,
      label: `MapTiler ${theme === "dark" ? "Dark" : "Outdoor"}`,
      attribution: `\u00A9 <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> ${OSM_ATTR}`,
      usingKey: true,
    };
  }

  return {
    style: OPENFREEMAP[theme],
    label: `OpenFreeMap ${theme === "dark" ? "Dark" : "Liberty"}`,
    attribution: `\u00A9 <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> ${OSM_ATTR}`,
    usingKey: false,
  };
}
