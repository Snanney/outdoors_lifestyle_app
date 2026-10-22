import { Icon, type IconName } from "../../lib";
import type { AppTab } from "./tabs";

interface Props {
  tab: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string; icon: IconName }[] = [
  { id: "explore", label: "Explore", icon: "map" },
  { id: "saved", label: "Saved", icon: "bookmark" },
  { id: "guide", label: "Guide", icon: "message" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export function TabBar({ tab, onChange }: Props) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((item) => {
        const on = item.id === tab;
        return (
          <button
            key={item.id}
            type="button"
            className={`tabbar__btn${on ? " is-on" : ""}`}
            aria-current={on ? "page" : undefined}
            onClick={() => onChange(item.id)}
          >
            <Icon name={item.icon} size={22} filled={on && item.icon === "bookmark"} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
