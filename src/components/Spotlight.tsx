import { Heart, Star } from 'lucide-react'
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
 * depth (raised surface, a poster's shadow, a soft gold glow) rather than an
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
      {/* Soft gold glow, top right — the light serves the focal tile, then stops. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-phi-lg p-phi-lg sm:flex-row">
        {show.image ? (
          <button
            type="button"
            onClick={() => onSelect(show)}
            className="shrink-0 self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={`View details for ${show.name}`}
          >
            <img
              src={show.image.original}
              alt={`${show.name} poster`}
              className="w-40 rounded-2xl object-cover shadow-2xl shadow-black/60 ring-1 ring-white/10 transition hover:opacity-95 sm:w-52"
            />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-phi-sm font-semibold uppercase tracking-[0.14em] text-gold">
            Top rated right now
          </p>

          <h2 className="mt-2 text-phi-lg font-bold leading-tight tracking-tight text-white">
            {show.name}
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {show.premiered ? show.premiered.slice(0, 4) : 'Year unknown'}
            {network ? ` · ${network}` : ''}
            {show.runtime ? ` · ${show.runtime} min` : ''}
            {` · ${show.status}`}
          </p>

          {/* The one number that gets to be big. */}
          <p className="mt-phi-sm flex items-baseline gap-2">
            <span className="flex items-center gap-1.5 text-phi-lg font-bold leading-none text-gold">
              <Star size={22} strokeWidth={0} fill="currentColor" aria-hidden />
              {formatRating(show.rating.average)}
            </span>
            <span className="text-sm text-zinc-500">/ 10 · TVMaze rating</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {show.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold ring-1 ring-gold/25"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="mt-phi-sm line-clamp-3 max-w-2xl text-[15px] leading-relaxed text-zinc-300">
            {summary || 'No summary available.'}
          </p>

          <div className="mt-phi flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSelect(show)}
              className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              View details
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(show)}
              aria-pressed={isFavorite}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                isFavorite
                  ? 'bg-rose-500/15 text-rose-300 ring-rose-500/40 hover:bg-rose-500/25'
                  : 'bg-raised text-zinc-100 ring-line hover:ring-zinc-500'
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
