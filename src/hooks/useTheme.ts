import { useCallback, useEffect, useState } from 'react'

export type ThemeStyle = 'achaemenid' | 'modern'
export type ThemeMode = 'light' | 'dark'

const STYLE_KEY = 'showcase-style'
const MODE_KEY = 'showcase-mode'

function readStyle(): ThemeStyle {
  try {
    return localStorage.getItem(STYLE_KEY) === 'achaemenid' ? 'achaemenid' : 'modern'
  } catch {
    return 'modern'
  }
}

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(MODE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* storage unavailable — fall through to the media query */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(style: ThemeStyle, mode: ThemeMode) {
  const root = document.documentElement
  root.dataset.style = style
  root.dataset.mode = mode
}

/** Reads the stored (or defaulted) theme — used by the pre-paint script in index.html too. */
export function initialTheme(): { style: ThemeStyle; mode: ThemeMode } {
  return { style: readStyle(), mode: readMode() }
}

export function useTheme() {
  const [style, setStyleState] = useState<ThemeStyle>(() => readStyle())
  const [mode, setModeState] = useState<ThemeMode>(() => readMode())

  useEffect(() => {
    apply(style, mode)
    try {
      localStorage.setItem(STYLE_KEY, style)
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [style, mode])

  const setStyle = useCallback((next: ThemeStyle) => setStyleState(next), [])
  const toggleMode = useCallback(
    () => setModeState((m) => (m === 'dark' ? 'light' : 'dark')),
    [],
  )

  return { style, mode, setStyle, toggleMode }
}
