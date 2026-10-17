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
import { SettingsPage } from "./features/settings";
import {
  loadBundledSpots,
  loadLiveSpots,
  readJSON,
  writeJSON,
  type Spot,
  type SpotGeoJSON,
  type SpotSource,
} from "./lib";

type AppView = "explore" | "settings";

export default function App() {
  const [view, setView] = useState<AppView>("explore");
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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    // Progressive load: show the bundled sample instantly, then upgrade to
    // live OpenStreetMap data if it's reachable (ADR-0010).
    loadBundledSpots()
      .then((bundled) => {
        if (cancelled) return;
        setGeojson(bundled.geojson);
        setSpots(bundled.spots);
        return loadLiveSpots((partial) => {
          if (cancelled) return;
          setGeojson(partial.geojson);
          setSpots(partial.spots);
          setSource(partial.source);
        });
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

  function collapseList() {
    setPanelOpen(false);
    // Let the sheet animation start, then tell MapLibre the visible map grew.
    window.requestAnimationFrame(() => mapRef.current?.resize());
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    const spot = spots.find((s) => s.id === id);
    if (spot) mapRef.current?.flyToSpot(spot);
    // Drop the list so the pin and callout are unobstructed. The "^" handle
    // stays visible so the user can pull the list back up.
    collapseList();
  }

  const mapFilters = { type: filters.type, difficulty: filters.difficulty };

  if (view === "settings") {
    return (
      <SettingsPage
        theme={theme}
        onThemeChange={setTheme}
        onBack={() => setView("explore")}
      />
    );
  }

  return (
    <div className={`app${panelOpen ? "" : " app--sheet-collapsed"}`}>
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
            onClick={() => setView("settings")}
            aria-label="Open settings"
            title="Settings"
          >
            {"\u2699\uFE0E"}
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
          <button
            type="button"
            className="sidebar__handle"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-label={panelOpen ? "Collapse trail list" : "Expand trail list"}
            title={panelOpen ? "Collapse list" : "Expand list"}
          >
            <span className="sidebar__grabber" aria-hidden="true" />
            <span className="sidebar__caret" aria-hidden="true">
              {panelOpen ? "v" : "^"}
            </span>
            {!panelOpen && (
              <span className="sidebar__peek">
                <span className="sidebar__peek-name">
                  {selectedSpot ? selectedSpot.name : "Trail list"}
                </span>
                {selectedSpot && (
                  <span className="sidebar__peek-meta">
                    {selectedSpot.type === "park"
                      ? "Park"
                      : selectedSpot.difficulty
                        ? selectedSpot.difficulty
                        : "Trail"}
                    {selectedSpot.length_mi != null
                      ? ` \u00B7 ${selectedSpot.length_mi} mi`
                      : ""}
                  </span>
                )}
              </span>
            )}
          </button>

          <div className="sidebar__scroll">
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
          </div>
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
