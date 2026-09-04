import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      onClick={() => toggleTheme?.()}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === "dark" ? <Moon size={15} strokeWidth={1.6} /> : <Sun size={15} strokeWidth={1.6} />}
      </span>
      <span>{theme === "dark" ? "Night" : "Day"}</span>
    </button>
  );
}
