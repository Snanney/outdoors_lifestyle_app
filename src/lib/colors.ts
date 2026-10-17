/**
 * Shared design tokens for spot colors.
 *
 * Kept in `lib` (not `map`) because both the map layers and the trail list
 * legend need the same palette - see ADR-0008 (module public interfaces).
 * Parks are green; trails are colored by difficulty.
 */
export const COLORS = {
  park: "#2f8f5b",
  easy: "#3aa655",
  moderate: "#e0a500",
  hard: "#d1483c",
  favorite: "#ffd24a",
} as const;
