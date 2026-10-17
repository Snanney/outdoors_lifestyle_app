import { useEffect, useRef, useState } from "react";
import maplibregl, { type FilterSpecification, type Map } from "maplibre-gl";
import { getBasemap, type BasemapTheme } from "./basemap";
import {
  LAYERS,
  SOURCE_ID,
  circleLayer,
  favoriteRingLayer,
  labelLayer,
} from "./layers";
import type { Difficulty, FeatureType, Spot, SpotGeoJSON } from "../lib";

/** Rough center + zoom that frames the state of Utah on first load. */
const UTAH_CENTER: [number, number] = [-111.0937, 39.321];
const UTAH_ZOOM = 5.6;

export interface MapFilters {
  type: FeatureType | "all";
  difficulty: Difficulty | "all";
}

interface UseMapLibreOptions {
  container: React.RefObject<HTMLDivElement | null>;
  geojson: SpotGeoJSON | null;
  favorites: Set<string>;
  filters: MapFilters;
  theme: BasemapTheme;
  onSelectSpot: (id: string) => void;
}

function buildFilter(filters: MapFilters): FilterSpecification | null {
  const clauses: FilterSpecification[] = [];
  if (filters.type !== "all") {
    clauses.push(["==", ["get", "type"], filters.type]);
  }
  if (filters.difficulty !== "all") {
    clauses.push(["==", ["get", "difficulty"], filters.difficulty]);
  }
  if (clauses.length === 0) return null;
  return ["all", ...clauses] as unknown as FilterSpecification;
}

export function useMapLibre({
  container,
  geojson,
  favorites,
  filters,
  theme,
  onSelectSpot,
}: UseMapLibreOptions) {
  const mapRef = useRef<Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Latest props kept in refs so map callbacks never go stale and so we can
  // re-apply state after a basemap style swap (which wipes custom layers).
  const geojsonRef = useRef(geojson);
  geojsonRef.current = geojson;
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const onSelectRef = useRef(onSelectSpot);
  onSelectRef.current = onSelectSpot;

  const handlersAttachedRef = useRef(false);
  const appliedThemeRef = useRef<BasemapTheme>(theme);

  function applyFavorites(map: Map) {
    const gj = geojsonRef.current;
    if (!gj || !map.getSource(SOURCE_ID)) return;
    for (const feature of gj.features) {
      const id = feature.properties.id;
      map.setFeatureState(
        { source: SOURCE_ID, id },
        { favorite: favoritesRef.current.has(id) }
      );
    }
  }

  function applyFilters(map: Map) {
    const filter = buildFilter(filtersRef.current);
    for (const layerId of [LAYERS.favoriteRing, LAYERS.circle, LAYERS.label]) {
      if (map.getLayer(layerId)) map.setFilter(layerId, filter);
    }
  }

  /** Adds the GeoJSON source + spot layers (idempotent) and re-applies state. */
  function addSpotLayers(map: Map) {
    const gj = geojsonRef.current;
    if (!gj) return;
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: gj as unknown as GeoJSON.FeatureCollection,
        promoteId: "id",
      });
    }
    if (!map.getLayer(LAYERS.favoriteRing)) map.addLayer(favoriteRingLayer);
    if (!map.getLayer(LAYERS.circle)) map.addLayer(circleLayer);
    if (!map.getLayer(LAYERS.label)) map.addLayer(labelLayer);
    applyFavorites(map);
    applyFilters(map);
  }

  /** Attaches click/hover handlers once; they survive basemap style swaps. */
  function attachHandlers(map: Map) {
    if (handlersAttachedRef.current) return;
    handlersAttachedRef.current = true;
    map.on("click", LAYERS.circle, (e) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) onSelectRef.current(id);
    });
    map.on("mouseenter", LAYERS.circle, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", LAYERS.circle, () => {
      map.getCanvas().style.cursor = "";
    });
  }

  // 1) Create the map exactly once.
  useEffect(() => {
    if (!container.current || mapRef.current) return;

    const initial = getBasemap(appliedThemeRef.current);
    const map = new maplibregl.Map({
      container: container.current,
      style: initial.style,
      center: UTAH_CENTER,
      zoom: UTAH_ZOOM,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      addSpotLayers(map);
      attachHandlers(map);
      setLoaded(true);
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      handlersAttachedRef.current = false;
      setLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Add/refresh the data layers when the data arrives.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !geojson) return;
    addSpotLayers(map);
  }, [loaded, geojson]);

  // 3) Reflect favorites via feature-state (drives the golden halo layer).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    applyFavorites(map);
  }, [favorites, loaded]);

  // 4) Apply type/difficulty filters to all spot layers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    applyFilters(map);
  }, [filters, loaded]);

  // 5) Swap the basemap when the theme changes, then re-add our layers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    if (appliedThemeRef.current === theme) return;
    appliedThemeRef.current = theme;
    map.setStyle(getBasemap(theme).style);
    map.once("styledata", () => addSpotLayers(map));
  }, [theme, loaded]);

  function flyToSpot(spot: Spot) {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [spot.lng, spot.lat],
      zoom: Math.max(map.getZoom(), spot.type === "park" ? 9 : 12),
      speed: 1.2,
      essential: true,
    });
  }

  return { flyToSpot, basemap: getBasemap(theme), ready: loaded };
}
