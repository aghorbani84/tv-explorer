import { Heart, Star } from 'lucide-react'
import { Badge, type BadgeVariant } from './wensity/badge'
import { formatRating } from '../lib/api'
import type { Show } from '../lib/api'

interface ShowCardProps {
  show: Show
  isFavorite: boolean
  onSelect: (show: Show) => void
  onToggleFavorite: (show: Show) => void
  /** Stagger for the quiet rise-in; 0 when the grid must appear at once. */
  riseDelayMs?: number
}

function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Running':
      return 'success'
    case 'Ended':
      return 'neutral'
    case 'To Be Determined':
      return 'warning'
    default:
      return 'info'
  }
}

/**
 * A quiet tile (Stageshow `many-of-one`): poster, title, one meta line,
 * rating, at most two genre chips. The summary lives in the detail view —
 * a card is one line of words, not a paragraph. Depth on hover only:
 * a small lift and an accent-tinted ring.
 */
export function ShowCard({ show, isFavorite, onSelect, onToggleFavorite, riseDelayMs = 0 }: ShowCardProps) {
  const network = show.network?.name ?? show.webChannel?.name

  return (
    <article
      style={{ animationDelay: `${riseDelayMs}ms` }}
      className="group animate-rise flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 hover:ring-accent/40 dark:hover:shadow-black/40"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onSelect(show)}
          className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          aria-label={`View details for ${show.name}`}
        >
          {show.image ? (
            <img
              src={show.image.medium}
              alt={`${show.name} poster`}
              loading="lazy"
              className="aspect-[210/295] w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-95"
            />
          ) : (
            <div className="flex aspect-[210/295] w-full items-center justify-center bg-raised px-4 text-center text-sm text-muted">
              No poster available
            </div>
          )}
        </button>

        <Badge
          variant={statusBadgeVariant(show.status)}
          size="sm"
          dot={show.status === 'Running'}
          pulseDot={show.status === 'Running'}
          className="pointer-events-none absolute left-2 top-2 backdrop-blur"
        >
          {show.status}
        </Badge>

        <button
          type="button"
          onClick={() => onToggleFavorite(show)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${show.name} from Favorites` : `Add ${show.name} to Favorites`}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isFavorite
              ? 'opacity-100'
              : 'opacity-0 hover:bg-black/75 group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        >
          <Heart
            size={15}
            strokeWidth={2}
            fill={isFavorite ? '#fb7185' : 'none'}
            className={isFavorite ? 'text-rose-400' : undefined}
            aria-hidden
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-phi-sm">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelect(show)}
            className="text-left text-[15px] font-semibold leading-snug text-ink hover:text-accent-strong"
          >
            {show.name}
          </button>
          <span className="flex shrink-0 items-center gap-1 pt-0.5 text-sm font-semibold text-accent-strong">
            <Star size={13} strokeWidth={0} fill="currentColor" aria-hidden />
            {formatRating(show.rating.average)}
          </span>
        </div>

        <p className="text-phi-sm text-muted">
          {show.premiered ? show.premiered.slice(0, 4) : 'Year unknown'}
          {network ? ` · ${network}` : ''}
          {show.runtime ? ` · ${show.runtime} min` : ''}
        </p>

        {show.genres.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {show.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="rounded-full bg-raised px-2 py-0.5 text-[11px] text-muted">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
