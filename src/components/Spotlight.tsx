import { Heart, Star } from 'lucide-react'
import { PosterImage } from './PosterImage'
import { formatRating, stripHtml } from '../lib/api'
import type { Show } from '../lib/api'

interface SpotlightProps {
  show: Show
  isFavorite: boolean
  onSelect: (show: Show) => void
  onToggleFavorite: (show: Show) => void
}

/**
 * The focused tile (Stageshow `many-of-one`): the #1 trending show, the only
 * tile in the grid with words — a big rating, a summary, actions — lifted by
 * depth (raised surface, a poster's shadow, a soft accent glow) rather than an
 * outline. The rest of the grid stays quiet beside it.
 */
export function Spotlight({ show, isFavorite, onSelect, onToggleFavorite }: SpotlightProps) {
  const summary = stripHtml(show.summary)
  const network = show.network?.name ?? show.webChannel?.name

  return (
    <section
      aria-label={`Top rated show: ${show.name}`}
      className="animate-rise relative overflow-hidden rounded-3xl bg-surface ring-1 ring-line"
    >
      {/* Soft accent glow, top right — the light serves the focal tile, then stops. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-phi-lg p-phi-lg sm:flex-row">
        <button
          type="button"
          onClick={() => onSelect(show)}
          className="shrink-0 self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`View details for ${show.name}`}
        >
          <PosterImage
            name={show.name}
            image={show.image}
            size="original"
            className="aspect-[210/295] w-40 rounded-2xl sm:w-52"
            imgClassName="aspect-[210/295] w-40 rounded-2xl object-cover shadow-2xl shadow-black/20 ring-1 ring-line transition hover:opacity-95 sm:w-52 dark:shadow-black/60"
          />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-phi-sm font-semibold uppercase tracking-[0.14em] text-accent-strong">
            Top rated right now
          </p>

          <h2 className="font-display mt-2 text-phi-lg font-bold leading-tight tracking-tight text-ink">
            {show.name}
          </h2>

          <p className="mt-2 text-sm text-muted">
            {show.premiered ? show.premiered.slice(0, 4) : 'Year unknown'}
            {network ? ` · ${network}` : ''}
            {show.runtime ? ` · ${show.runtime} min` : ''}
            {` · ${show.status}`}
          </p>

          {/* The one number that gets to be big. */}
          <p className="mt-phi-sm flex items-baseline gap-2">
            <span className="flex items-center gap-1.5 text-phi-lg font-bold leading-none text-accent-strong">
              <Star size={22} strokeWidth={0} fill="currentColor" aria-hidden />
              {formatRating(show.rating.average)}
            </span>
            <span className="text-sm text-muted">/ 10 · TVMaze rating</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {show.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong ring-1 ring-accent/25"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="mt-phi-sm line-clamp-3 max-w-2xl text-[15px] leading-relaxed text-ink/85">
            {summary || 'No summary available.'}
          </p>

          <div className="mt-phi flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSelect(show)}
              className="min-h-11 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              View details
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(show)}
              aria-pressed={isFavorite}
              className={`flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isFavorite
                  ? 'bg-rose-500/15 text-rose-600 ring-rose-500/40 hover:bg-rose-500/25 dark:text-rose-300'
                  : 'bg-raised text-ink ring-line hover:ring-muted'
              }`}
            >
              <Heart
                size={16}
                strokeWidth={2}
                fill={isFavorite ? 'currentColor' : 'none'}
                aria-hidden
              />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
