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
import { useTheme } from "./features/theme";
import {
  loadBundledSpots,
  loadLiveSpots,
  readJSON,
  writeJSON,
  type Spot,
  type SpotGeoJSON,
  type SpotSource,
} from "./lib";

export default function App() {
  const [geojson, setGeojson] = useState<SpotGeoJSON | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [source, setSource] = useState<SpotSource>("bundled");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [noticeDismissed, setNoticeDismissed] = useState<boolean>(() =>
    readJSON<boolean>("noticeDismissed", false)
  );

  function dismissNotice() {
    setNoticeDismissed(true);
    writeJSON("noticeDismissed", true);
  }

  const mapRef = useRef<MapViewHandle | null>(null);
  const { favoriteSet, favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    // Progressive load: show the bundled sample instantly, then upgrade to
    // live OpenStreetMap data if it's reachable (ADR-0010).
    loadBundledSpots()
      .then((bundled) => {
        if (cancelled) return;
        setGeojson(bundled.geojson);
        setSpots(bundled.spots);
        return loadLiveSpots();
      })
      .then((live) => {
        if (cancelled || !live) return;
        setGeojson(live.geojson);
        setSpots(live.spots);
        setSource(live.source);
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
          <span className="app__demo-badge" title="Demonstration app">
            Demo
          </span>
          <span className="app__tag">Utah outdoors</span>
        </div>
        <div className="app__actions">
          <button
            type="button"
            className="app__icon-btn"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? "\u2600" : "\u263D"}
          </button>
          <button
            type="button"
            className="app__panel-toggle"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
          >
            {panelOpen ? "Hide list" : "Show list"}
          </button>
        </div>
      </header>

      {!noticeDismissed && (
        <div className="app__notice" role="note">
          <span className="app__notice-icon" aria-hidden="true">
            {"\u26A0"}
          </span>
          <span className="app__notice-text">
            <strong>Demo app.</strong> Trail data is approximate and provided for
            demonstration only &mdash; don&apos;t rely on it for navigation,
            planning, or safety.
          </span>
          <button
            type="button"
            className="app__notice-close"
            onClick={dismissNotice}
            aria-label="Dismiss notice"
          >
            {"\u2715"}
          </button>
        </div>
      )}

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
            {loadError ? (
              "Could not load data."
            ) : (
              <>
                {`${visibleSpots.length} of ${spots.length} spots`}
                <span
                  className={`sidebar__source sidebar__source--${source}`}
                  title={
                    source === "live"
                      ? "Live trail data from OpenStreetMap"
                      : "Offline sample data"
                  }
                >
                  {source === "live" ? "Live OSM" : "Offline sample"}
                </span>
              </>
            )}
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
            theme={theme}
            selectedId={selectedId}
            onSelectSpot={handleSelect}
          />
        </main>
      </div>

      <ChatWidget spots={spots} onSelectSpot={handleSelect} />
    </div>
  );
}
