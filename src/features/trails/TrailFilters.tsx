import type { Filters } from "./filters";
import type { Difficulty, FeatureType } from "../../lib";

interface Props {
  filters: Filters;
  favoritesCount: number;
  onChange: (next: Filters) => void;
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

export function TrailFilters({ filters, favoritesCount, onChange }: Props) {
  return (
    <div className="filters">
      <input
        type="search"
        className="filters__search"
        placeholder="Search trails & parks..."
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        aria-label="Search trails and parks"
      />

      <div className="filters__row">
        <label className="filters__field">
          <span>Type</span>
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({ ...filters, type: e.target.value as Filters["type"] })
            }
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span>Difficulty</span>
          <select
            value={filters.difficulty}
            disabled={filters.type === "park"}
            onChange={(e) =>
              onChange({
                ...filters,
                difficulty: e.target.value as Filters["difficulty"],
              })
            }
          >
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="filters__fav">
        <input
          type="checkbox"
          checked={filters.favoritesOnly}
          onChange={(e) =>
            onChange({ ...filters, favoritesOnly: e.target.checked })
          }
        />
        <span>Favorites only ({favoritesCount})</span>
      </label>
    </div>
  );
}
