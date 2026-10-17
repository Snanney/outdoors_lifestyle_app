import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";

export const SOURCE_ID = "spots";

export const LAYERS = {
  favoriteRing: "spots-favorite-ring",
  circle: "spots-circle",
  label: "spots-label",
} as const;

// Color palette shared with the UI legend.
export const COLORS = {
  park: "#2f8f5b",
  easy: "#3aa655",
  moderate: "#e0a500",
  hard: "#d1483c",
  favorite: "#ffd24a",
} as const;

/**
 * Expression that picks a circle color:
 * parks are green; trails are colored by difficulty.
 */
const colorByKind: CircleLayerSpecification["paint"] = {
  "circle-color": [
    "case",
    ["==", ["get", "type"], "park"],
    COLORS.park,
    ["==", ["get", "difficulty"], "easy"],
    COLORS.easy,
    ["==", ["get", "difficulty"], "moderate"],
    COLORS.moderate,
    ["==", ["get", "difficulty"], "hard"],
    COLORS.hard,
    "#888888",
  ],
  "circle-radius": [
    "interpolate",
    ["linear"],
    ["zoom"],
    4,
    ["case", ["==", ["get", "type"], "park"], 6, 4],
    10,
    ["case", ["==", ["get", "type"], "park"], 11, 7],
  ],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff",
};

export const circleLayer: CircleLayerSpecification = {
  id: LAYERS.circle,
  type: "circle",
  source: SOURCE_ID,
  paint: colorByKind,
};

/** A golden halo rendered only for favorited features (via feature-state). */
export const favoriteRingLayer: CircleLayerSpecification = {
  id: LAYERS.favoriteRing,
  type: "circle",
  source: SOURCE_ID,
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      4,
      ["case", ["==", ["get", "type"], "park"], 11, 9],
      10,
      ["case", ["==", ["get", "type"], "park"], 17, 13],
    ],
    "circle-color": COLORS.favorite,
    "circle-opacity": [
      "case",
      ["boolean", ["feature-state", "favorite"], false],
      0.9,
      0,
    ],
  },
};

export const labelLayer: SymbolLayerSpecification = {
  id: LAYERS.label,
  type: "symbol",
  source: SOURCE_ID,
  layout: {
    "text-field": ["get", "name"],
    "text-size": 12,
    "text-offset": [0, 1.2],
    "text-anchor": "top",
    "text-optional": true,
    "text-max-width": 8,
  },
  paint: {
    "text-color": "#1b2a21",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.4,
  },
};
