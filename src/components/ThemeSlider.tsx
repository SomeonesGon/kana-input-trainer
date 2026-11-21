import { THEMES } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

/** Emoji label shown below each theme tick on the slider. */
const THEME_LABELS: Record<string, string> = {
  light: '☀️',
  dark:  '🌙',
  pink:  '🌸',
};

/**
 * ThemeSlider
 *
 * A compact range input that lets the user slide between Light → Dark → Pink themes.
 * The current theme index is derived from the global ThemeContext, so it stays in sync
 * with any other theme-change triggers (e.g. initial load from localStorage).
 *
 * Renders as a small self-contained group intended for use inside the top toolbar.
 */
export default function ThemeSlider() {
  const { theme, setTheme } = useTheme();
  const currentIndex = THEMES.indexOf(theme);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const idx = Number(e.target.value);
    const chosen = THEMES[idx];
    if (chosen) setTheme(chosen);
  }

  return (
    <div
      className="d-flex align-items-center gap-1"
      title={`Theme: ${theme}`}
      style={{ userSelect: 'none' }}
    >
      {/* Emoji ticks above the slider */}
      <div className="d-flex justify-content-between" style={{ width: '72px', fontSize: '0.85rem', lineHeight: 1 }}>
        {THEMES.map((t) => (
          <span
            key={t}
            style={{ opacity: theme === t ? 1 : 0.4, transition: 'opacity 0.2s', cursor: 'pointer' }}
            onClick={() => setTheme(t)}
            title={t.charAt(0).toUpperCase() + t.slice(1) + ' mode'}
          >
            {THEME_LABELS[t]}
          </span>
        ))}
      </div>

      {/* Range slider: 0 = light, 1 = dark, 2 = pink */}
      <input
        type="range"
        className="form-range"
        min={0}
        max={THEMES.length - 1}
        step={1}
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={handleChange}
        aria-label="Theme selector"
        style={{ width: '72px', cursor: 'pointer' }}
      />
    </div>
  );
}
