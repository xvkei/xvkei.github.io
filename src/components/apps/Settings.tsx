import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useId } from 'react';
import { THEME_OPTIONS, useTheme, type ThemePref } from '../../lib/theme';

const ICONS: Record<ThemePref, LucideIcon> = { system: Monitor, linen: Sun, night: Moon };

export function Settings() {
  const { pref, theme, setPref } = useTheme();
  const name = useId();

  return (
    <div className="app settings">
      <p className="app-intro">make the desktop yours. choices are saved on this device.</p>

      <fieldset className="theme-picker">
        <legend>theme</legend>
        {THEME_OPTIONS.map((opt) => {
          const Icon = ICONS[opt.id];
          return (
            <label key={opt.id} className="theme-option">
              <input type="radio" name={name} value={opt.id} checked={pref === opt.id} onChange={() => setPref(opt.id)} />
              <span className={`theme-swatch is-${opt.id}`} aria-hidden="true" />
              <span>
                <span className="theme-name">
                  <Icon size={15} aria-hidden="true" /> {opt.label}
                </span>
                <span className="theme-blurb">{opt.blurb}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <p className="state-line">showing: {theme}</p>
    </div>
  );
}