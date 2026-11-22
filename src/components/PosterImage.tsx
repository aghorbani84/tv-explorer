import { useState } from 'react'
import type { ShowImage } from '../lib/api'

interface PosterImageProps {
  /** Show name — its initial is the fallback tile. */
  name: string
  image: ShowImage | null | undefined
  /** Container classes (aspect ratio, width, rounding). */
  className?: string
  /** Classes applied to the <img> itself. */
  imgClassName?: string
  /** Which TVMaze size to use. */
  size?: 'medium' | 'original'
}

/**
 * Poster with a themed fallback: TVMaze sometimes returns no image, and a
 * remote poster can 404 after the fact. Either way the card shows a themed
 * initial tile (accent-soft background, display-font initial) — never a
 * broken <img> and never an empty box. All colors are semantic tokens, so
 * the tile recolors in all four theme combinations.
 */
export function PosterImage({ name, image, className = '', imgClassName = '', size = 'medium' }: PosterImageProps) {
  const [broken, setBroken] = useState(false)
  const url = size === 'original' ? image?.original : image?.medium
  const initial = (name.trim().charAt(0) || '?').toUpperCase()

  if (!url || broken) {
    return (
      <div
        role="img"
        aria-label={`${name} poster unavailable`}
        className={`flex items-center justify-center bg-accent-soft ring-1 ring-inset ring-accent/25 ${className}`}
      >
        <span className="font-display text-4xl font-bold text-accent-strong" aria-hidden>
          {initial}
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`${name} poster`}
      loading="lazy"
      onError={() => setBroken(true)}
      className={imgClassName || className}
    />
  )
}
