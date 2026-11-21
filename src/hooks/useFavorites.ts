import { useCallback, useEffect, useState } from 'react'
import type { Show } from '../lib/api'

const STORAGE_KEY = 'tv-explorer:favorites'

function readStored(): Show[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Show[]) : []
  } catch {
    return []
  }
}

/**
 * Favorites persisted in localStorage.
 * Full show objects are stored so the Favorites view works even
 * when the TVMaze API is temporarily unreachable.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Show[]>(() => readStored())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // Storage full or unavailable — favorites stay in memory only.
    }
  }, [favorites])

  const isFavorite = useCallback(
    (id: number) => favorites.some((show) => show.id === id),
    [favorites],
  )

  const toggleFavorite = useCallback((show: Show) => {
    setFavorites((prev) =>
      prev.some((item) => item.id === show.id)
        ? prev.filter((item) => item.id !== show.id)
        : [...prev, show],
    )
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}
