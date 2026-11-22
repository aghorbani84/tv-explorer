import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, ExternalLink, Heart, Star, TriangleAlert } from 'lucide-react'
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
    <div className="rounded-2xl bg-rose-500/10 p-phi-xl text-center ring-1 ring-rose-500/30">
      <TriangleAlert size={22} className="mx-auto text-rose-500 dark:text-rose-300" aria-hidden />
      <p className="mt-3 text-phi font-semibold text-rose-700 dark:text-rose-200">Couldn&apos;t load show details</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-rose-700 dark:text-rose-200/80">
        The TVMaze API appears to be unreachable right now. {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-ink transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        Try again
      </button>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-surface p-phi-lg ring-1 ring-line" aria-label="Loading show details">
      <div className="flex flex-col gap-phi-lg sm:flex-row">
        <div className="aspect-[210/295] w-40 shrink-0 rounded-2xl bg-raised sm:w-52" />
        <div className="min-w-0 flex-1">
          <div className="h-9 w-2/3 rounded-lg bg-raised" />
          <div className="mt-4 h-4 w-1/2 rounded bg-raised" />
          <div className="mt-6 h-4 w-full rounded bg-raised" />
          <div className="mt-2 h-4 w-5/6 rounded bg-raised" />
          <div className="mt-2 h-4 w-3/4 rounded bg-raised" />
        </div>
      </div>
      <p className="mt-phi-lg text-sm text-muted">Loading show details from TVMaze…</p>
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
        className="mb-phi flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink ring-1 ring-line transition hover:bg-raised hover:ring-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden />
        Back to results
      </button>

      {isLoading && <DetailSkeleton />}

      {error && !isLoading && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Please check your connection and try again.'}
          onRetry={() => void mutate()}
        />
      )}

      {!isLoading && !error && (
        <>
          <section className="animate-rise overflow-hidden rounded-3xl bg-surface ring-1 ring-line">
            <div className="flex flex-col gap-phi-lg p-phi-lg sm:flex-row">
              {show.image ? (
                <img
                  src={show.image.original}
                  alt={`${show.name} poster`}
                  className="w-40 self-start rounded-2xl object-cover shadow-2xl shadow-black/60 ring-1 ring-line sm:w-52"
                />
              ) : (
                <div className="flex h-80 w-40 items-center justify-center rounded-2xl bg-raised text-sm text-muted sm:w-52">
                  No poster available
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-phi-lg font-bold leading-tight tracking-tight text-ink">{show.name}</h1>

                {/* The one number that gets to be big. */}
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="flex items-center gap-1.5 text-phi font-bold leading-none text-accent-strong">
                    <Star size={18} strokeWidth={0} fill="currentColor" aria-hidden />
                    {formatRating(show.rating.average)}
                  </span>
                  <span className="text-sm text-muted">/ 10 · TVMaze rating</span>
                </p>

                <dl className="mt-phi grid grid-cols-2 gap-x-phi gap-y-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Status</dt>
                    <dd className="mt-0.5 font-medium text-ink">{show.status}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Network</dt>
                    <dd className="mt-0.5 font-medium text-ink">{networkName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Premiered</dt>
                    <dd className="mt-0.5 font-medium text-ink">{show.premiered ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Ended</dt>
                    <dd className="mt-0.5 font-medium text-ink">{show.ended ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Language</dt>
                    <dd className="mt-0.5 font-medium text-ink">{show.language ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Runtime</dt>
                    <dd className="mt-0.5 font-medium text-ink">{show.runtime ? `${show.runtime} min` : 'Unknown'}</dd>
                  </div>
                </dl>

                <div className="mt-phi flex flex-wrap gap-1.5">
                  {show.genres.map((genre) => (
                    <span key={genre} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong ring-1 ring-accent/25">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="mt-phi max-w-3xl text-[15px] leading-relaxed text-ink/85">{summary || 'No summary available.'}</p>

                <div className="mt-phi flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(show)}
                    aria-pressed={isFavorite}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isFavorite
                        ? 'bg-rose-500/15 text-rose-500 dark:text-rose-300 ring-rose-500/40 hover:bg-rose-500/25'
                        : 'bg-accent font-semibold text-accent-ink hover:bg-accent-deep'
                    }`}
                  >
                    <Heart size={16} strokeWidth={2} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                  {show.officialSite && (
                    <a
                      href={show.officialSite}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full bg-raised px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Official site
                      <ExternalLink size={14} strokeWidth={2} aria-hidden />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-phi-lg">
            <h2 className="text-phi font-bold tracking-tight text-ink">Cast</h2>
            {!detail || detail._embedded.cast.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No cast information available for this show.</p>
            ) : (
              <ul className="mt-phi grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {detail._embedded.cast.slice(0, 12).map((member) => (
                  <li key={member.person.id} className="flex items-center gap-3 rounded-2xl bg-surface p-phi-sm ring-1 ring-line transition hover:ring-accent/30">
                    {member.person.image ? (
                      <img src={member.person.image.medium} alt={member.person.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-line" />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-raised text-lg font-semibold text-ink/85">
                        {member.person.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{member.person.name}</p>
                      <p className="truncate text-xs text-muted">as {member.character.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-phi-lg">
            <h2 className="text-phi font-bold tracking-tight text-ink">
              Episodes {detail ? `(${detail._embedded.episodes.length})` : ''}
            </h2>
            {!detail || seasons.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No episode information available for this show.</p>
            ) : (
              <div className="mt-phi space-y-3">
                {seasons.map(([season, episodes]) => {
                  const open = openSeason === null ? season === seasons[0][0] : openSeason === season
                  return (
                    <div key={season} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
                      <button
                        type="button"
                        onClick={() => setOpenSeason(open ? -1 : season)}
                        className="flex w-full items-center justify-between gap-3 px-phi py-3.5 text-left text-sm font-semibold text-ink transition hover:bg-raised/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                        aria-expanded={open}
                      >
                        <span>
                          Season {season} · {episodes.length} episode{episodes.length === 1 ? '' : 's'}
                        </span>
                        <ChevronDown
                          size={16}
                          strokeWidth={2}
                          aria-hidden
                          className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {open && (
                        <ul className="divide-y divide-line border-t border-line">
                          {episodes.map((episode) => (
                            <li key={episode.id} className="px-phi py-3.5">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="text-sm font-medium text-ink">
                                  S{episode.season}E{episode.number ?? '?'} — {episode.name}
                                </p>
                                <span className="text-xs text-muted">
                                  {episode.airdate ?? 'Unaired'}
                                  {episode.runtime ? ` · ${episode.runtime} min` : ''}
                                  {episode.rating.average != null ? ` · ★ ${episode.rating.average.toFixed(1)}` : ''}
                                </span>
                              </div>
                              {episode.summary && (
                                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{stripHtml(episode.summary)}</p>
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
