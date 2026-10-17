import type { Spot } from "../../lib";

interface Props {
  spot: Spot;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onCenter: (spot: Spot) => void;
  onClose: () => void;
}

export function TrailDetail({
  spot,
  isFavorite,
  onToggleFavorite,
  onCenter,
  onClose,
}: Props) {
  const directionsUrl = `https://www.openstreetmap.org/?mlat=${spot.lat}&mlon=${spot.lng}#map=14/${spot.lat}/${spot.lng}`;

  return (
    <div className="detail" role="region" aria-label={`${spot.name} details`}>
      <div className="detail__header">
        <h2 className="detail__title">{spot.name}</h2>
        <button
          type="button"
          className="detail__close"
          onClick={onClose}
          aria-label="Close details"
        >
          {"\u2715"}
        </button>
      </div>

      <div className="detail__badges">
        <span className="badge">{spot.type === "park" ? "Park" : "Trail"}</span>
        {spot.difficulty && (
          <span className={`badge badge--${spot.difficulty}`}>
            {spot.difficulty}
          </span>
        )}
        {spot.length_mi != null && (
          <span className="badge">{spot.length_mi} mi</span>
        )}
        <span className="badge badge--muted">{spot.region}</span>
      </div>

      <p className="detail__desc">{spot.description}</p>

      <div className="detail__actions">
        <button
          type="button"
          className={`btn${isFavorite ? " btn--active" : ""}`}
          onClick={() => onToggleFavorite(spot.id)}
        >
          {isFavorite ? "\u2605 Saved" : "\u2606 Save"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onCenter(spot)}
        >
          Center on map
        </button>
        <a
          className="btn btn--link"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in maps
        </a>
      </div>
    </div>
  );
}
