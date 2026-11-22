import { Landmark, Moon, Sparkles, Sun } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Switch } from './ui/switch'
import type { ThemeMode, ThemeStyle } from '../hooks/useTheme'

interface ThemeSwitcherProps {
  style: ThemeStyle
  mode: ThemeMode
  setStyle: (style: ThemeStyle) => void
  toggleMode: () => void
}

/**
 * The visible theme switcher (theme-spec §5): a segmented style control
 * (Achaemenid | Modern, shadcn ToggleGroup) and a light/dark mode toggle
 * (shadcn Switch + Sun/Moon). Persists via the useTheme hook.
 */
export function ThemeSwitcher({ style, mode, setStyle, toggleMode }: ThemeSwitcherProps) {
  const dark = mode === 'dark'
  return (
    <div className="flex items-center gap-2.5" role="group" aria-label="Theme">
      <ToggleGroup
        type="single"
        value={style}
        onValueChange={(value) => {
          if (value === 'achaemenid' || value === 'modern') setStyle(value)
        }}
        aria-label="Style"
      >
        <ToggleGroupItem value="achaemenid" aria-label="Achaemenid style">
          <Landmark size={14} strokeWidth={2} aria-hidden />
          Achaemenid
        </ToggleGroupItem>
        <ToggleGroupItem value="modern" aria-label="Modern style">
          <Sparkles size={14} strokeWidth={2} aria-hidden />
          Modern
        </ToggleGroupItem>
      </ToggleGroup>

      <span className="flex items-center gap-1.5">
        <Sun size={15} strokeWidth={2} className={dark ? 'text-muted' : 'text-accent-strong'} aria-hidden />
        <Switch
          checked={dark}
          onCheckedChange={toggleMode}
          aria-label="Toggle dark mode"
          aria-pressed={dark}
        />
        <Moon size={15} strokeWidth={2} className={dark ? 'text-accent-strong' : 'text-muted'} aria-hidden />
      </span>
    </div>
  )
}
