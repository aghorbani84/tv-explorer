import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { fetcher, formatRating, showDetailUrl, stripHtml } from '../lib/api'
import type { Show, ShowDetail } from '../lib/api'

interface ShowDetailProps {
  show: Show
  isFavorite: boolean
  onToggleFavorite: (show: Show) => void
  onBack: () => void
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-rose-500/10 p-6 text-center ring-1 ring-rose-500/30">
      <p className="text-lg font-semibold text-rose-200">Couldn&apos;t load show details</p>
      <p className="mt-2 text-sm text-rose-200/80">
        The TVMaze API appears to be unreachable right now. {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400"
      >
        Try again
      </button>
    </div>
  )
}

export function ShowDetailView({ show, isFavorite, onToggleFavorite, onBack }: ShowDetailProps) {
  const { data, error, isLoading, mutate } = useSWR<ShowDetail>(showDetailUrl(show.id), fetcher, {
    revalidateOnFocus: false,
  })
  const [openSeason, setOpenSeason] = useState<number | null>(null)

  const seasons = useMemo(() => {
    if (!data) return []
    const bySeason = new Map<number, ShowDetail['_embedded']['episodes']>()
    for (const episode of data._embedded.episodes) {
      const list = bySeason.get(episode.season) ?? []
      list.push(episode)
      bySeason.set(episode.season, list)
    }
    return [...bySeason.entries()].sort((a, b) => a[0] - b[0])
  }, [data])

  const detail = data ?? null
  const networkName = show.network?.name ?? show.webChannel?.name ?? 'Unknown network'
  const summary = stripHtml(detail?.summary ?? show.summary)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
      >
        ← Back to results
      </button>

      {isLoading && (
        <div className="animate-pulse rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-800">
          <div className="h-8 w-2/3 rounded bg-slate-800" />
          <div className="mt-4 h-4 w-full rounded bg-slate-800" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-800" />
          <div className="mt-2 h-4 w-3/4 rounded bg-slate-800" />
          <p className="mt-6 text-sm text-slate-400">Loading show details from TVMaze…</p>
        </div>
      )}

      {error && !isLoading && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Please check your connection and try again.'}
          onRetry={() => void mutate()}
        />
      )}

      {!isLoading && !error && (
        <>
          <section className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
            <div className="flex flex-col gap-6 p-6 sm:flex-row">
              {show.image ? (
                <img
                  src={show.image.original}
                  alt={`${show.name} poster`}
                  className="w-full max-w-60 self-start rounded-xl object-cover sm:w-60"
                />
              ) : (
                <div className="flex h-80 w-full max-w-60 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-400 sm:w-60">
                  No poster available
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h1 className="text-3xl font-bold text-slate-50">{show.name}</h1>
                  <span className="rounded-md bg-slate-800 px-3 py-1 text-base font-semibold text-amber-300">
                    ★ {formatRating(show.rating.average)}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-medium text-slate-200">{show.status}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Network</dt>
                    <dd className="font-medium text-slate-200">{networkName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Premiered</dt>
                    <dd className="font-medium text-slate-200">{show.premiered ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Ended</dt>
                    <dd className="font-medium text-slate-200">{show.ended ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Language</dt>
                    <dd className="font-medium text-slate-200">{show.language ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Runtime</dt>
                    <dd className="font-medium text-slate-200">{show.runtime ? `${show.runtime} min` : 'Unknown'}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-1">
                  {show.genres.map((genre) => (
                    <span key={genre} className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="mt-4 leading-relaxed text-slate-300">{summary || 'No summary available.'}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(show)}
                    aria-pressed={isFavorite}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isFavorite
                        ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-500/25'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {isFavorite ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
                  </button>
                  {show.officialSite && (
                    <a
                      href={show.officialSite}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
                    >
                      Official site ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-50">Cast</h2>
            {!detail || detail._embedded.cast.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No cast information available for this show.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {detail._embedded.cast.slice(0, 12).map((member) => (
                  <li key={member.person.id} className="flex items-center gap-3 rounded-xl bg-slate-900 p-3 ring-1 ring-slate-800">
                    {member.person.image ? (
                      <img src={member.person.image.medium} alt={member.person.name} loading="lazy" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg text-slate-400">
                        {member.person.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">{member.person.name}</p>
                      <p className="truncate text-xs text-slate-400">as {member.character.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-50">
              Episodes {detail ? `(${detail._embedded.episodes.length})` : ''}
            </h2>
            {!detail || seasons.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No episode information available for this show.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {seasons.map(([season, episodes]) => {
                  const open = openSeason === null ? season === seasons[0][0] : openSeason === season
                  return (
                    <div key={season} className="overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800">
                      <button
                        type="button"
                        onClick={() => setOpenSeason(open ? -1 : season)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-100 hover:bg-slate-800/60"
                        aria-expanded={open}
                      >
                        <span>
                          Season {season} · {episodes.length} episode{episodes.length === 1 ? '' : 's'}
                        </span>
                        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <ul className="divide-y divide-slate-800 border-t border-slate-800">
                          {episodes.map((episode) => (
                            <li key={episode.id} className="px-4 py-3">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="text-sm font-medium text-slate-100">
                                  S{episode.season}E{episode.number ?? '?'} — {episode.name}
                                </p>
                                <span className="text-xs text-slate-400">
                                  {episode.airdate ?? 'Unaired'}
                                  {episode.runtime ? ` · ${episode.runtime} min` : ''}
                                  {episode.rating.average != null ? ` · ★ ${episode.rating.average.toFixed(1)}` : ''}
                                </span>
                              </div>
                              {episode.summary && (
                                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{stripHtml(episode.summary)}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
