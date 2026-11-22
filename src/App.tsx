import { useEffect, useMemo, useState } from 'react'
import { Heart, Search, SearchX, TriangleAlert, Tv, X } from 'lucide-react'
import useSWR from 'swr'
import { ShowCard } from './components/ShowCard'
import { ShowDetailView } from './components/ShowDetail'
import { Spotlight } from './components/Spotlight'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useFavorites } from './hooks/useFavorites'
import { useTheme } from './hooks/useTheme'
import {
  fetcher,
  searchShowsUrl,
  showsPageUrl,
} from './lib/api'
import type { SearchResult, Show } from './lib/api'

type View = 'home' | 'favorites'

const TRENDING_COUNT = 24

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-phi sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading shows">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
          <div className="aspect-[210/295] bg-raised" />
          <div className="space-y-2.5 p-phi-sm">
            <div className="h-4 w-3/4 rounded bg-raised" />
            <div className="h-3 w-1/2 rounded bg-raised" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ApiError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl bg-rose-500/10 p-phi-xl text-center ring-1 ring-rose-500/30">
      <TriangleAlert size={22} className="mx-auto text-rose-500 dark:text-rose-300" aria-hidden />
      <p className="mt-3 text-phi font-semibold text-rose-700 dark:text-rose-200">Couldn&apos;t reach the TVMaze API</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-rose-700/80 dark:text-rose-200/80">
        The show catalog could not be loaded. Please check your internet connection and try again.
      </p>
      <p className="mt-2 font-mono text-xs text-rose-700/60 dark:text-rose-200/60">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        Try again
      </button>
    </div>
  )
}

/** The one Faravahar accent (theme-spec §3): small gold inline SVG, footer only. */
function Faravahar() {
  return (
    <svg
      className="faravahar mx-auto mb-2 h-7 w-16 text-accent"
      viewBox="0 0 64 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <circle cx="32" cy="11" r="4.5" />
      <circle cx="32" cy="11" r="1.6" fill="currentColor" stroke="none" />
      <path d="M32 6.5 V3 M32 15.5 V19" />
      <path d="M27.5 11 C20 6 12 5 5 7 M27.5 11 C21 9 14 9 8 11 M27.5 11 C22 12 16 13 11 15" />
      <path d="M36.5 11 C44 6 52 5 59 7 M36.5 11 C43 9 50 9 56 11 M36.5 11 C42 12 48 13 53 15" />
      <path d="M29 19 L32 25 L35 19" />
    </svg>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All genres')
  const [view, setView] = useState<View>('home')
  const [selected, setSelected] = useState<Show | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim(), 400)
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const theme = useTheme()

  // Trending: the first page of the TVMaze catalog, ranked by average rating.
  const {
    data: allShows,
    error: trendingError,
    isLoading: trendingLoading,
    mutate: retryTrending,
  } = useSWR<Show[]>(view === 'home' && !debouncedQuery ? showsPageUrl(0) : null, fetcher, {
    revalidateOnFocus: false,
  })

  const {
    data: searchResults,
    error: searchError,
    isLoading: searchLoading,
    mutate: retrySearch,
  } = useSWR<SearchResult[]>(
    debouncedQuery ? searchShowsUrl(debouncedQuery) : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const trending = useMemo(() => {
    if (!allShows) return []
    return [...allShows]
      .filter((show) => show.rating.average != null && show.image)
      .sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0))
      .slice(0, TRENDING_COUNT)
  }, [allShows])

  const genres = useMemo(() => {
    const source = debouncedQuery ? (searchResults ?? []).map((r) => r.show) : trending
    const set = new Set<string>()
    for (const show of source) for (const g of show.genres) set.add(g)
    return ['All genres', ...[...set].sort()]
  }, [debouncedQuery, searchResults, trending])

  const baseShows = useMemo(() => {
    if (debouncedQuery) return (searchResults ?? []).map((r) => r.show)
    return trending
  }, [debouncedQuery, searchResults, trending])

  const visibleShows = useMemo(() => {
    if (genre === 'All genres') return baseShows
    return baseShows.filter((show) => show.genres.includes(genre))
  }, [baseShows, genre])

  const isLoading = debouncedQuery ? searchLoading : trendingLoading
  const error = debouncedQuery ? searchError : trendingError
  const retry = debouncedQuery ? () => void retrySearch() : () => void retryTrending()

  // The focused tile: the #1 trending show, lifted out of the grid only on
  // the unfiltered home view. The grid below it shows the rest.
  const spotlightShow =
    !debouncedQuery && genre === 'All genres' && view === 'home' && !selected
      ? trending[0]
      : undefined
  const gridShows = spotlightShow
    ? visibleShows.filter((show) => show.id !== spotlightShow.id)
    : visibleShows

  function handleSelect(show: Show) {
    setSelected(show)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <header className="lotus-pattern sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-phi gap-y-3 px-4 py-3.5">
          <button
            type="button"
            onClick={() => {
              setSelected(null)
              setView('home')
            }}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="TV Explorer — back to Browse"
          >
            <Tv size={20} strokeWidth={2} className="text-accent" aria-hidden />
            <span className="font-display text-lg font-bold tracking-tight text-ink">TV Explorer</span>
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <ThemeSwitcher {...theme} />
            <nav className="flex rounded-full bg-surface p-1 ring-1 ring-line" aria-label="Views">
              <button
                type="button"
                onClick={() => {
                  setView('home')
                  setSelected(null)
                }}
                aria-pressed={view === 'home'}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  view === 'home' ? 'bg-accent font-semibold text-accent-ink' : 'text-muted hover:text-ink'
                }`}
              >
                Browse
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('favorites')
                  setSelected(null)
                }}
                aria-pressed={view === 'favorites'}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  view === 'favorites' ? 'bg-accent font-semibold text-accent-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <Heart size={14} strokeWidth={2} fill={view === 'favorites' ? 'currentColor' : 'none'} aria-hidden />
                Favorites ({favorites.length})
              </button>
            </nav>
          </div>
        </div>
        <div className="double-rule mx-auto max-w-7xl" aria-hidden />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16">
        {selected ? (
          <div className="pt-8">
            <ShowDetailView
              show={selected}
              isFavorite={isFavorite(selected.id)}
              onToggleFavorite={toggleFavorite}
              onBack={() => setSelected(null)}
            />
          </div>
        ) : view === 'favorites' ? (
          <section className="pt-8">
            <h1 className="font-display text-phi font-bold tracking-tight text-ink">Your Favorites</h1>
            <p className="mt-1 text-sm text-muted">
              Saved in this browser with localStorage — they stay here even if the API goes down.
            </p>
            {favorites.length === 0 ? (
              <div className="mt-phi-lg rounded-3xl bg-surface p-phi-xl text-center ring-1 ring-line">
                <Heart size={22} className="mx-auto text-muted" aria-hidden />
                <p className="mt-3 text-phi font-semibold text-ink">No favorites yet</p>
                <p className="mt-2 text-sm text-muted">
                  Browse shows and tap the heart on a poster to build your list.
                </p>
                <button
                  type="button"
                  onClick={() => setView('home')}
                  className="mt-5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Browse shows
                </button>
              </div>
            ) : (
              <div className="mt-phi grid grid-cols-2 gap-phi sm:grid-cols-3 lg:grid-cols-4">
                {favorites.map((show, i) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    isFavorite
                    onSelect={handleSelect}
                    onToggleFavorite={toggleFavorite}
                    riseDelayMs={Math.min(i, 11) * 30}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            {/* Hero: the search is the focal object. Quiet when a query is active. */}
            <div className={debouncedQuery ? 'pt-8' : 'pt-phi-lg'}>
              {!debouncedQuery && (
                <p className="mb-phi-sm text-phi-sm font-medium tracking-wide text-muted">
                  Live from TVMaze — no sign-up, no API key
                </p>
              )}
              <div className="relative mx-auto max-w-2xl">
                <label htmlFor="show-search" className="sr-only">
                  Search TV shows
                </label>
                <Search
                  size={18}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  id="show-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelected(null)
                    setView('home')
                  }}
                  placeholder="Search shows — try “Breaking Bad”…"
                  className="h-phi-xl w-full rounded-2xl border border-line bg-surface pl-12 pr-12 text-[15px] text-ink shadow-lg shadow-black/10 placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:shadow-black/30"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-raised hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <X size={16} strokeWidth={2} aria-hidden />
                  </button>
                )}
              </div>

              {spotlightShow && (
                <div className="mt-phi-lg">
                  <Spotlight
                    show={spotlightShow}
                    isFavorite={isFavorite(spotlightShow.id)}
                    onSelect={handleSelect}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              )}
            </div>

            <div className="mt-phi-lg flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-phi font-bold tracking-tight text-ink">
                  {debouncedQuery ? `Results for “${debouncedQuery}”` : 'Trending Shows'}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {debouncedQuery
                    ? 'Live results from the TVMaze search API.'
                    : 'The highest-rated shows on TVMaze right now.'}
                </p>
              </div>
            </div>

            <div className="mt-phi flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  aria-pressed={genre === g}
                  className={`rounded-full px-3.5 py-1.5 text-phi-sm font-medium ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    genre === g
                      ? 'bg-accent font-semibold text-accent-ink ring-accent'
                      : 'bg-surface text-muted ring-line hover:ring-muted'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="mt-phi">
              {isLoading && <LoadingGrid />}

              {!isLoading && error && (
                <ApiError
                  message={error instanceof Error ? error.message : 'Unknown error'}
                  onRetry={retry}
                />
              )}

              {!isLoading && !error && debouncedQuery && visibleShows.length === 0 && (
                <div className="rounded-3xl bg-surface p-phi-xl text-center ring-1 ring-line">
                  <SearchX size={22} className="mx-auto text-muted" aria-hidden />
                  <p className="mt-3 text-phi font-semibold text-ink">No shows found</p>
                  <p className="mt-2 text-sm text-muted">
                    Nothing on TVMaze matches “{debouncedQuery}”. Try a different title or spelling.
                  </p>
                </div>
              )}

              {!isLoading && !error && visibleShows.length > 0 && (
                <>
                  <p className="mb-4 text-sm text-muted">
                    {visibleShows.length} show{visibleShows.length === 1 ? '' : 's'}
                    {genre !== 'All genres' ? ` in ${genre}` : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-phi sm:grid-cols-3 lg:grid-cols-4">
                    {gridShows.map((show, i) => (
                      <ShowCard
                        key={show.id}
                        show={show}
                        isFavorite={isFavorite(show.id)}
                        onSelect={handleSelect}
                        onToggleFavorite={toggleFavorite}
                        riseDelayMs={Math.min(i, 11) * 30}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-line py-phi text-center text-xs text-muted">
        <Faravahar />
        <p>
          Data from the{' '}
          <a href="https://www.tvmaze.com/api" target="_blank" rel="noreferrer" className="text-secondary hover:underline">
            TVMaze API
          </a>{' '}
          — free, no API key required. Built with React, TypeScript, SWR and Tailwind CSS.
        </p>
      </footer>
    </div>
  )
}
