import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { SavedPage, useFavorites } from "./features/favorites";
import { useTheme } from "./features/theme";
import { SettingsPage } from "./features/settings";
import {
  TabBar,
  useSheetDetent,
  type AppTab,
} from "./features/shell";
import {
  Icon,
  loadBundledSpots,
  loadLiveSpots,
  type Spot,
  type SpotGeoJSON,
  type SpotSource,
} from "./lib";

function useIsCompact() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1024px)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return compact;
}

function filtersAreActive(filters: Filters): boolean {
  return (
    filters.type !== "all" ||
    filters.difficulty !== "all" ||
    filters.favoritesOnly
  );
}

export default function App() {
  const compact = useIsCompact();
  const [tab, setTab] = useState<AppTab>("explore");
  const [geojson, setGeojson] = useState<SpotGeoJSON | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [source, setSource] = useState<SpotSource>("bundled");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { detent, setDetent, dragY, consumeClick, handleProps } =
    useSheetDetent("half");

  const mapRef = useRef<MapViewHandle | null>(null);
  const { favoriteSet, favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
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

  useEffect(() => {
    const id = window.requestAnimationFrame(() => mapRef.current?.resize());
    return () => window.cancelAnimationFrame(id);
  }, [detent, tab, compact]);

  const visibleSpots = useMemo(
    () => applyFilters(spots, filters, isFavorite),
    [spots, filters, isFavorite]
  );

  const savedSpots = useMemo(
    () => spots.filter((s) => isFavorite(s.id)),
    [spots, isFavorite]
  );

  const selectedSpot = useMemo(
    () => spots.find((s) => s.id === selectedId) ?? null,
    [spots, selectedId]
  );

  function handleSelect(id: string) {
    setSelectedId(id);
    const spot = spots.find((s) => s.id === id);
    if (spot) mapRef.current?.flyToSpot(spot);
    setTab("explore");
    setDetent("peek");
  }

  function handleTab(next: AppTab) {
    setTab(next);
    if (next === "explore" && compact) setDetent("half");
  }

  const mapFilters = { type: filters.type, difficulty: filters.difficulty };
  const sheetStyle =
    compact && dragY !== 0
      ? ({ "--sheet-drag": `${dragY}px` } as CSSProperties)
      : undefined;

  return (
    <div
      className={`app app--${tab}${compact ? ` app--sheet-${detent}` : ""}`}
    >
      <header className="app__topbar">
        <button
          type="button"
          className="app__brand"
          onClick={() => handleTab("explore")}
        >
          <span className="app__logo" aria-hidden="true">
            <Icon name="mountain" size={18} filled />
          </span>
          <span className="app__name">Trailhead</span>
        </button>
        <nav className="app__actions" aria-label="App">
          <button
            type="button"
            className={`app__icon-btn${tab === "saved" ? " is-on" : ""}`}
            onClick={() => handleTab("saved")}
            aria-label="Saved trails"
            aria-current={tab === "saved" ? "page" : undefined}
          >
            <Icon name="bookmark" size={20} filled={tab === "saved"} />
          </button>
          <button
            type="button"
            className={`app__icon-btn${tab === "guide" ? " is-on" : ""}`}
            onClick={() => handleTab("guide")}
            aria-label="Trail guide"
            aria-current={tab === "guide" ? "page" : undefined}
          >
            <Icon name="message" size={20} />
          </button>
          <button
            type="button"
            className={`app__icon-btn${tab === "settings" ? " is-on" : ""}`}
            onClick={() => handleTab("settings")}
            aria-label="Settings"
            aria-current={tab === "settings" ? "page" : undefined}
          >
            <Icon name="settings" size={20} />
          </button>
        </nav>
      </header>

      <div
        className="app__body"
        hidden={tab !== "explore"}
        aria-hidden={tab !== "explore"}
      >
        <aside className="sidebar" style={sheetStyle}>
          <button
            type="button"
            className="sidebar__handle"
            aria-label={
              detent === "peek" ? "Expand trail list" : "Resize trail list"
            }
            {...handleProps}
            onClick={() => {
              if (consumeClick()) return;
              setDetent((d) =>
                d === "peek" ? "half" : d === "half" ? "full" : "peek"
              );
            }}
          >
            <span className="sidebar__grabber" aria-hidden="true" />
            {detent === "peek" && (
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
            {!compact && (
              <TrailFilters
                filters={filters}
                favoritesCount={favoriteIds.length}
                onChange={setFilters}
              />
            )}

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
                : `${visibleSpots.length} ${visibleSpots.length === 1 ? "place" : "places"}`}
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
          {compact && (
            <div className="map-chrome">
              <div className="map-search">
                <Icon name="search" size={18} />
                <input
                  type="search"
                  className="map-search__input"
                  placeholder="Search trails & parks"
                  value={filters.query}
                  onChange={(e) =>
                    setFilters({ ...filters, query: e.target.value })
                  }
                  onFocus={() => setDetent("half")}
                  aria-label="Search trails and parks"
                />
                <button
                  type="button"
                  className={`map-search__filter${filtersOpen || filtersAreActive(filters) ? " is-on" : ""}`}
                  aria-pressed={filtersOpen}
                  aria-label="Filters"
                  onClick={() => setFiltersOpen((o) => !o)}
                >
                  <Icon name="filter" size={18} />
                </button>
              </div>
              {filtersOpen && (
                <div className="map-chrome__filters">
                  <TrailFilters
                    filters={filters}
                    favoritesCount={favoriteIds.length}
                    onChange={setFilters}
                    showSearch={false}
                  />
                </div>
              )}
            </div>
          )}
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

      {tab === "saved" && (
        <SavedPage
          spots={savedSpots}
          selectedId={selectedId}
          isFavorite={isFavorite}
          onSelect={handleSelect}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {tab === "guide" && (
        <ChatWidget spots={spots} onSelectSpot={handleSelect} />
      )}

      {tab === "settings" && (
        <SettingsPage
          theme={theme}
          onThemeChange={setTheme}
          source={source}
        />
      )}

      <TabBar tab={tab} onChange={handleTab} />
    </div>
  );
}
