import { useCallback, useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON } from "../../lib";

const STORAGE_KEY = "favorites";

/**
 * Manages the set of favorited spot ids, persisted to localStorage so a
 * user's picks survive reloads. No backend, no accounts - purely on-device.
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>(() =>
    readJSON<string[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    writeJSON(STORAGE_KEY, ids);
  }, [ids]);

  const favoriteSet = useMemo(() => new Set(ids), [ids]);

  const isFavorite = useCallback(
    (id: string) => favoriteSet.has(id),
    [favoriteSet]
  );

  const toggleFavorite = useCallback((id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { favoriteSet, favoriteIds: ids, isFavorite, toggleFavorite };
}
