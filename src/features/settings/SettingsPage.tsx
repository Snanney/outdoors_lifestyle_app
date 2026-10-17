import type { Theme } from "../theme";

interface Props {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onBack: () => void;
}

/**
 * Full-page settings view. Replaces the map/list chrome so the user has a
 * dedicated place to change appearance (and later, other preferences).
 */
export function SettingsPage({ theme, onThemeChange, onBack }: Props) {
  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <button
          type="button"
          className="settings-page__back"
          onClick={onBack}
          aria-label="Back to map"
        >
          <span aria-hidden="true">{"\u2039"}</span>
          Back
        </button>
        <h1 className="settings-page__title">Settings</h1>
      </header>

      <div className="settings-page__body">
        <section className="settings-page__section">
          <h2 className="settings-page__section-title">Appearance</h2>
          <div className="settings-page__card">
            <div className="settings-page__row-text">
              <span className="settings-page__label">Theme</span>
              <span className="settings-page__hint">
                Switch between light and dark mode. Your choice is saved on this
                device.
              </span>
            </div>
            <div className="segmented" role="group" aria-label="Theme mode">
              <button
                type="button"
                className={`segmented__btn${theme === "light" ? " is-active" : ""}`}
                aria-pressed={theme === "light"}
                onClick={() => onThemeChange("light")}
              >
                {"\u2600\uFE0E"} Light
              </button>
              <button
                type="button"
                className={`segmented__btn${theme === "dark" ? " is-active" : ""}`}
                aria-pressed={theme === "dark"}
                onClick={() => onThemeChange("dark")}
              >
                {"\u263D"} Dark
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
