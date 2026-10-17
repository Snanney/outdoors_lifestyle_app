import { type Spot, COLORS } from "../../lib";

interface Props {
  spots: Spot[];
  selectedId: string | null;
  isFavorite: (id: string) => boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function dotColor(spot: Spot): string {
  if (spot.type === "park") return COLORS.park;
  if (spot.difficulty === "easy") return COLORS.easy;
  if (spot.difficulty === "moderate") return COLORS.moderate;
  if (spot.difficulty === "hard") return COLORS.hard;
  return "#888888";
}

export function TrailList({
  spots,
  selectedId,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: Props) {
  if (spots.length === 0) {
    return <p className="list__empty">No spots match your filters.</p>;
  }

  return (
    <ul className="list">
      {spots.map((spot) => {
        const fav = isFavorite(spot.id);
        return (
          <li
            key={spot.id}
            className={`list__item${
              spot.id === selectedId ? " list__item--active" : ""
            }`}
          >
            <button
              type="button"
              className="list__main"
              onClick={() => onSelect(spot.id)}
            >
              <span
                className="list__dot"
                style={{ backgroundColor: dotColor(spot) }}
                aria-hidden="true"
              />
              <span className="list__text">
                <span className="list__name">{spot.name}</span>
                <span className="list__pills">
                  <span className={`pill pill--${spot.type}`}>
                    {spot.type === "park" ? "Park" : "Trail"}
                  </span>
                  {spot.difficulty && (
                    <span className={`pill pill--${spot.difficulty}`}>
                      {spot.difficulty}
                    </span>
                  )}
                  {spot.length_mi != null && (
                    <span className="pill pill--stat">{spot.length_mi} mi</span>
                  )}
                </span>
                <span className="list__meta">{spot.region}</span>
              </span>
            </button>
            <button
              type="button"
              className={`list__fav${fav ? " list__fav--on" : ""}`}
              aria-pressed={fav}
              aria-label={fav ? "Remove favorite" : "Add favorite"}
              title={fav ? "Remove favorite" : "Add favorite"}
              onClick={() => onToggleFavorite(spot.id)}
            >
              {fav ? "\u2605" : "\u2606"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
