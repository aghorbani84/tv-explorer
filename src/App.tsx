import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ShowCard } from './components/ShowCard'
import { ShowDetailView } from './components/ShowDetail'
import { useFavorites } from './hooks/useFavorites'
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading shows">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
          <div className="aspect-[210/295] bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 rounded bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-5/6 rounded bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ApiError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-rose-500/10 p-8 text-center ring-1 ring-rose-500/30">
      <p className="text-lg font-semibold text-rose-200">Couldn&apos;t reach the TVMaze API</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-rose-200/80">
        The show catalog could not be loaded. Please check your internet connection and try again.
      </p>
      <p className="mt-2 font-mono text-xs text-rose-200/60">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400"
      >
        Try again
      </button>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All genres')
  const [view, setView] = useState<View>('home')
  const [selected, setSelected] = useState<Show | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim(), 400)
  const { favorites, isFavorite, toggleFavorite } = useFavorites()

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

  function handleSelect(show: Show) {
    setSelected(show)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] font-sans text-slate-200">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#0b0f17]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4">
          <button
            type="button"
            onClick={() => {
              setSelected(null)
              setView('home')
            }}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
              TV
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-50">TV Explorer</span>
          </button>

          <div className="min-w-52 flex-1">
            <label htmlFor="show-search" className="sr-only">
              Search TV shows
            </label>
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
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <nav className="flex gap-2" aria-label="Views">
            <button
              type="button"
              onClick={() => {
                setView('home')
                setSelected(null)
              }}
              aria-pressed={view === 'home'}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                view === 'home' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
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
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                view === 'favorites' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              ♥ Favorites ({favorites.length})
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        {selected ? (
          <ShowDetailView
            show={selected}
            isFavorite={isFavorite(selected.id)}
            onToggleFavorite={toggleFavorite}
            onBack={() => setSelected(null)}
          />
        ) : view === 'favorites' ? (
          <section>
            <h1 className="text-2xl font-bold text-slate-50">Your Favorites</h1>
            <p className="mt-1 text-sm text-slate-400">
              Saved in this browser with localStorage — they stay here even if the API goes down.
            </p>
            {favorites.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-slate-900 p-10 text-center ring-1 ring-slate-800">
                <p className="text-lg font-semibold text-slate-100">No favorites yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Browse shows and tap “Add to Favorites” to build your list.
                </p>
                <button
                  type="button"
                  onClick={() => setView('home')}
                  className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Browse shows
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favorites.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    isFavorite
                    onSelect={handleSelect}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-50">
                  {debouncedQuery ? `Results for “${debouncedQuery}”` : 'Trending Shows'}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {debouncedQuery
                    ? 'Live results from the TVMaze search API.'
                    : 'The highest-rated shows on TVMaze right now — live data, no sign-up needed.'}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-400">
                Genre
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6">
              {isLoading && <LoadingGrid />}

              {!isLoading && error && (
                <ApiError
                  message={error instanceof Error ? error.message : 'Unknown error'}
                  onRetry={retry}
                />
              )}

              {!isLoading && !error && debouncedQuery && visibleShows.length === 0 && (
                <div className="rounded-2xl bg-slate-900 p-10 text-center ring-1 ring-slate-800">
                  <p className="text-lg font-semibold text-slate-100">No shows found</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Nothing on TVMaze matches “{debouncedQuery}”. Try a different title or spelling.
                  </p>
                </div>
              )}

              {!isLoading && !error && visibleShows.length > 0 && (
                <>
                  <p className="mb-4 text-sm text-slate-400">
                    {visibleShows.length} show{visibleShows.length === 1 ? '' : 's'}
                    {genre !== 'All genres' ? ` in ${genre}` : ''}
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleShows.map((show) => (
                      <ShowCard
                        key={show.id}
                        show={show}
                        isFavorite={isFavorite(show.id)}
                        onSelect={handleSelect}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Data from the{' '}
        <a href="https://www.tvmaze.com/api" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
          TVMaze API
        </a>{' '}
        — free, no API key required. Built with React, TypeScript, SWR and Tailwind CSS.
      </footer>
    </div>
  )
}
