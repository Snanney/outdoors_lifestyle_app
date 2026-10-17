import type { Difficulty, FeatureType, Spot } from "../../lib";

export interface Filters {
  query: string;
  type: FeatureType | "all";
  difficulty: Difficulty | "all";
  favoritesOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  type: "all",
  difficulty: "all",
  favoritesOnly: false,
};

/** Applies the full set of list filters (search + type + difficulty + favorites). */
export function applyFilters(
  spots: Spot[],
  filters: Filters,
  isFavorite: (id: string) => boolean
): Spot[] {
  const q = filters.query.trim().toLowerCase();
  return spots.filter((s) => {
    if (filters.type !== "all" && s.type !== filters.type) return false;
    if (filters.difficulty !== "all" && s.difficulty !== filters.difficulty)
      return false;
    if (filters.favoritesOnly && !isFavorite(s.id)) return false;
    if (q) {
      const haystack = `${s.name} ${s.region} ${s.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
