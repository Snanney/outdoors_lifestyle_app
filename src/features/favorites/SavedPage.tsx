import { TrailList } from "../trails";
import type { Spot } from "../../lib";

interface Props {
  spots: Spot[];
  selectedId: string | null;
  isFavorite: (id: string) => boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function SavedPage({
  spots,
  selectedId,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: Props) {
  return (
    <div className="saved-page">
      <header className="saved-page__header">
        <h1 className="saved-page__title">Saved</h1>
        <p className="saved-page__hint">Trails and parks you starred on this device.</p>
      </header>
      {spots.length === 0 ? (
        <p className="saved-page__empty">
          Nothing saved yet. Open a trail in Explore and tap Save — it will
          show up here.
        </p>
      ) : (
        <TrailList
          spots={spots}
          selectedId={selectedId}
          isFavorite={isFavorite}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}
