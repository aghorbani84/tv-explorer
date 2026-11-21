import { formatRating, stripHtml } from '../lib/api'
import type { Show } from '../lib/api'

interface ShowCardProps {
  show: Show
  isFavorite: boolean
  onSelect: (show: Show) => void
  onToggleFavorite: (show: Show) => void
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Running':
      return 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
    case 'Ended':
      return 'bg-slate-500/15 text-slate-300 ring-slate-500/30'
    case 'To Be Determined':
      return 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
    default:
      return 'bg-sky-500/15 text-sky-300 ring-sky-500/30'
  }
}

export function ShowCard({ show, isFavorite, onSelect, onToggleFavorite }: ShowCardProps) {
  const summary = stripHtml(show.summary)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800 transition hover:ring-indigo-500/60">
      <button
        type="button"
        onClick={() => onSelect(show)}
        className="relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label={`View details for ${show.name}`}
      >
        {show.image ? (
          <img
            src={show.image.medium}
            alt={`${show.name} poster`}
            loading="lazy"
            className="aspect-[210/295] w-full object-cover transition group-hover:opacity-90"
          />
        ) : (
          <div className="flex aspect-[210/295] w-full items-center justify-center bg-slate-800 px-4 text-center text-sm text-slate-400">
            No poster available
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusBadgeClass(show.status)}`}
        >
          {show.status}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelect(show)}
            className="text-left text-base font-semibold leading-snug text-slate-100 hover:text-indigo-300"
          >
            {show.name}
          </button>
          <span className="shrink-0 rounded-md bg-slate-800 px-2 py-0.5 text-sm font-semibold text-amber-300">
            ★ {formatRating(show.rating.average)}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          {show.premiered ? show.premiered.slice(0, 4) : 'Year unknown'}
          {show.network ? ` · ${show.network.name}` : show.webChannel ? ` · ${show.webChannel.name}` : ''}
          {show.runtime ? ` · ${show.runtime} min` : ''}
        </p>

        <div className="flex flex-wrap gap-1">
          {show.genres.slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {genre}
            </span>
          ))}
        </div>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">{summary || 'No summary available.'}</p>

        <button
          type="button"
          onClick={() => onToggleFavorite(show)}
          aria-pressed={isFavorite}
          className={`mt-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isFavorite
              ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-500/25'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          {isFavorite ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
        </button>
      </div>
    </article>
  )
}
