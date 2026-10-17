import { useEffect, useMemo, useRef, useState } from "react";
import { MapView, type MapViewHandle } from "./map";
import {
  TrailFilters,
  TrailList,
  TrailDetail,
  applyFilters,
  DEFAULT_FILTERS,
  type Filters,
} from "./features/trails";
import { ChatWidget } from "./chat";
import { useFavorites } from "./features/favorites";
import { loadSpots, type Spot, type SpotGeoJSON } from "./lib";

export default function App() {
  const [geojson, setGeojson] = useState<SpotGeoJSON | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const mapRef = useRef<MapViewHandle | null>(null);
  const { favoriteSet, favoriteIds, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    loadSpots()
      .then(({ geojson, spots }) => {
        if (cancelled) return;
        setGeojson(geojson);
        setSpots(spots);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleSpots = useMemo(
    () => applyFilters(spots, filters, isFavorite),
    [spots, filters, isFavorite]
  );

  const selectedSpot = useMemo(
    () => spots.find((s) => s.id === selectedId) ?? null,
    [spots, selectedId]
  );

  function handleSelect(id: string) {
    setSelectedId(id);
    const spot = spots.find((s) => s.id === id);
    if (spot) mapRef.current?.flyToSpot(spot);
  }

  const mapFilters = { type: filters.type, difficulty: filters.difficulty };

  return (
    <div className="app">
      <header className="app__topbar">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">
            {"\u26F0"}
          </span>
          <span className="app__name">Trailhead</span>
          <span className="app__tag">Utah outdoors</span>
        </div>
        <button
          type="button"
          className="app__panel-toggle"
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
        >
          {panelOpen ? "Hide list" : "Show list"}
        </button>
      </header>

      <div className="app__body">
        <aside className={`sidebar${panelOpen ? "" : " sidebar--collapsed"}`}>
          <TrailFilters
            filters={filters}
            favoritesCount={favoriteIds.length}
            onChange={setFilters}
          />

          {selectedSpot && (
            <TrailDetail
              spot={selectedSpot}
              isFavorite={isFavorite(selectedSpot.id)}
              onToggleFavorite={toggleFavorite}
              onCenter={(s) => mapRef.current?.flyToSpot(s)}
              onClose={() => setSelectedId(null)}
            />
          )}

          <div className="sidebar__count">
            {loadError
              ? "Could not load data."
              : `${visibleSpots.length} of ${spots.length} spots`}
          </div>

          <TrailList
            spots={visibleSpots}
            selectedId={selectedId}
            isFavorite={isFavorite}
            onSelect={handleSelect}
            onToggleFavorite={toggleFavorite}
          />
        </aside>

        <main className="app__map">
          <MapView
            ref={mapRef}
            geojson={geojson}
            favorites={favoriteSet}
            filters={mapFilters}
            onSelectSpot={handleSelect}
          />
        </main>
      </div>

      <ChatWidget spots={spots} onSelectSpot={handleSelect} />
    </div>
  );
}
