import { forwardRef, useImperativeHandle, useRef } from "react";
import { useMapLibre, type MapFilters } from "./useMapLibre";
import type { Spot, SpotGeoJSON } from "../lib/types";

export interface MapViewHandle {
  flyToSpot: (spot: Spot) => void;
}

interface Props {
  geojson: SpotGeoJSON | null;
  favorites: Set<string>;
  filters: MapFilters;
  onSelectSpot: (id: string) => void;
}

export const MapView = forwardRef<MapViewHandle, Props>(function MapView(
  { geojson, favorites, filters, onSelectSpot },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { flyToSpot, basemap, ready } = useMapLibre({
    container: containerRef,
    geojson,
    favorites,
    filters,
    onSelectSpot,
  });

  useImperativeHandle(ref, () => ({ flyToSpot }), [flyToSpot]);

  return (
    <div className="map">
      <div ref={containerRef} className="map__canvas" />
      {!ready && <div className="map__loading">Loading map…</div>}
      <div className="map__basemap" title="Active basemap">
        {basemap.label}
      </div>
    </div>
  );
});
