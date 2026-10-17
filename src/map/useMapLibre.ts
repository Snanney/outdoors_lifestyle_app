import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type FilterSpecification, type Map } from "maplibre-gl";
import { getBasemap } from "./basemap";
import {
  LAYERS,
  SOURCE_ID,
  circleLayer,
  favoriteRingLayer,
  labelLayer,
} from "./layers";
import type { Difficulty, FeatureType, Spot, SpotGeoJSON } from "../lib/types";

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
  onSelectSpot,
}: UseMapLibreOptions) {
  const mapRef = useRef<Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const basemap = useMemo(() => getBasemap(), []);

  // Keep the latest select handler without re-registering map events.
  const onSelectRef = useRef(onSelectSpot);
  onSelectRef.current = onSelectSpot;

  // 1) Create the map exactly once.
  useEffect(() => {
    if (!container.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: container.current,
      style: basemap.style,
      center: UTAH_CENTER,
      zoom: UTAH_ZOOM,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: basemap.attribution,
      })
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

    map.on("load", () => setLoaded(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setLoaded(false);
    };
    // basemap is stable (computed once); container ref identity is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Add the data source + layers once the style and data are ready.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !geojson) return;
    if (map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: geojson as unknown as GeoJSON.FeatureCollection,
      promoteId: "id",
    });
    map.addLayer(favoriteRingLayer);
    map.addLayer(circleLayer);
    map.addLayer(labelLayer);

    const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      const id = f?.properties?.id as string | undefined;
      if (id) onSelectRef.current(id);
    };
    map.on("click", LAYERS.circle, handleClick);
    map.on("mouseenter", LAYERS.circle, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", LAYERS.circle, () => {
      map.getCanvas().style.cursor = "";
    });
  }, [loaded, geojson]);

  // 3) Reflect favorites via feature-state (drives the golden halo layer).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !geojson || !map.getSource(SOURCE_ID)) return;
    for (const feature of geojson.features) {
      const id = feature.properties.id;
      map.setFeatureState(
        { source: SOURCE_ID, id },
        { favorite: favorites.has(id) }
      );
    }
  }, [favorites, loaded, geojson]);

  // 4) Apply type/difficulty filters to all spot layers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const filter = buildFilter(filters);
    for (const layerId of [
      LAYERS.favoriteRing,
      LAYERS.circle,
      LAYERS.label,
    ]) {
      if (map.getLayer(layerId)) map.setFilter(layerId, filter);
    }
  }, [filters, loaded]);

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

  return { flyToSpot, basemap, ready: loaded };
}
