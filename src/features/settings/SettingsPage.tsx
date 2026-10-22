import { Icon, type SpotSource } from "../../lib";
import type { Theme } from "../theme";

interface Props {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  source: SpotSource;
}

/**
 * Full-page settings view. Replaces the map/list chrome so the user has a
 * dedicated place to change appearance and read about the data.
 */
export function SettingsPage({ theme, onThemeChange, source }: Props) {
  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <h1 className="settings-page__title">Settings</h1>
      </header>

      <div className="settings-page__body">
        <section className="settings-page__section">
          <h2 className="settings-page__section-title">Appearance</h2>
          <div className="settings-page__card">
            <div className="settings-page__row-text">
              <span className="settings-page__label">Theme</span>
              <span className="settings-page__hint">
                Saved on this device. Does not follow the system after you pick
                one.
              </span>
            </div>
            <div className="segmented" role="group" aria-label="Theme mode">
              <button
                type="button"
                className={`segmented__btn${theme === "light" ? " is-active" : ""}`}
                aria-pressed={theme === "light"}
                onClick={() => onThemeChange("light")}
              >
                <Icon name="sun" size={16} />
                Light
              </button>
              <button
                type="button"
                className={`segmented__btn${theme === "dark" ? " is-active" : ""}`}
                aria-pressed={theme === "dark"}
                onClick={() => onThemeChange("dark")}
              >
                <Icon name="moon" size={16} />
                Dark
              </button>
            </div>
          </div>
        </section>

        <section className="settings-page__section">
          <h2 className="settings-page__section-title">About</h2>
          <div className="settings-page__card settings-page__card--rows">
            <div className="settings-page__row">
              <span className="settings-page__label">Trail data</span>
              <span className="settings-page__value">
                {source === "live"
                  ? "OpenStreetMap (live)"
                  : "Offline sample"}
              </span>
            </div>
            <p className="settings-page__hint settings-page__hint--block">
              Trail locations are approximate and meant for discovery only —
              do not rely on them for navigation, planning, or safety.
            </p>
            <div className="settings-page__row">
              <span className="settings-page__label">Saved trails</span>
              <span className="settings-page__value">On this device</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
