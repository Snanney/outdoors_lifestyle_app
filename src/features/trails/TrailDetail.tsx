import { Icon, type Spot } from "../../lib";

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
          <Icon name="close" size={18} />
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
          <Icon name="star" size={16} filled={isFavorite} />
          {isFavorite ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onCenter(spot)}
        >
          <Icon name="locate" size={16} />
          Center
        </button>
        <a
          className="btn btn--link"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="external" size={16} />
          Maps
        </a>
      </div>
    </div>
  );
}
