import type { Filters } from "./filters";
import type { Difficulty, FeatureType } from "../../lib";

interface Props {
  filters: Filters;
  favoritesCount: number;
  onChange: (next: Filters) => void;
  showSearch?: boolean;
}

const TYPE_OPTIONS: { value: FeatureType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "park", label: "Parks" },
  { value: "trail", label: "Trails" },
];

const DIFFICULTY_OPTIONS: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
];

export function TrailFilters({
  filters,
  favoritesCount,
  onChange,
  showSearch = true,
}: Props) {
  return (
    <div className="filters">
      {showSearch && (
        <input
          type="search"
          className="filters__search"
          placeholder="Search trails & parks"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          aria-label="Search trails and parks"
        />
      )}

      <div className="filters__group" role="group" aria-label="Type">
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`filters__chip${filters.type === o.value ? " is-on" : ""}`}
            aria-pressed={filters.type === o.value}
            onClick={() =>
              onChange({
                ...filters,
                type: o.value,
                difficulty: o.value === "park" ? "all" : filters.difficulty,
              })
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="filters__group" role="group" aria-label="Difficulty">
        {DIFFICULTY_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`filters__chip${filters.difficulty === o.value ? " is-on" : ""}`}
            aria-pressed={filters.difficulty === o.value}
            disabled={filters.type === "park" && o.value !== "all"}
            onClick={() =>
              onChange({
                ...filters,
                difficulty: o.value,
              })
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`filters__chip filters__chip--fav${filters.favoritesOnly ? " is-on" : ""}`}
        aria-pressed={filters.favoritesOnly}
        onClick={() =>
          onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
        }
      >
        Saved only ({favoritesCount})
      </button>
    </div>
  );
}
