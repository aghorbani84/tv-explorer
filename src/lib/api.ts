/**
 * TVMaze API layer.
 *
 * All data comes from the free TVMaze API — no API key required.
 * HTTP is done with the native `fetch`; caching / revalidation is
 * handled by SWR in the components (see useShows / useShowDetail).
 */

export const TVMAZE_API = 'https://api.tvmaze.com'

export interface ShowImage {
  medium: string
  original: string
}

export interface ShowRating {
  average: number | null
}

export interface ShowNetwork {
  name: string
  country?: { name: string; code: string; timezone: string }
}

export interface Show {
  id: number
  url: string
  name: string
  type: string
  language: string | null
  genres: string[]
  status: string
  runtime: number | null
  premiered: string | null
  ended: string | null
  officialSite: string | null
  rating: ShowRating
  network: ShowNetwork | null
  webChannel: ShowNetwork | null
  image: ShowImage | null
  summary: string | null
}

export interface SearchResult {
  score: number
  show: Show
}

export interface CastPerson {
  id: number
  name: string
  image: ShowImage | null
}

export interface CastMember {
  person: CastPerson
  character: { id: number; name: string; image: ShowImage | null }
}

export interface Episode {
  id: number
  name: string
  season: number
  number: number | null
  airdate: string | null
  airtime: string
  runtime: number | null
  rating: ShowRating
  summary: string | null
  image: ShowImage | null
}

export interface ShowDetail extends Show {
  _embedded: {
    cast: CastMember[]
    episodes: Episode[]
  }
}

/** Native-fetch based SWR fetcher. Throws on any non-2xx response so SWR surfaces it as an error. */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`TVMaze request failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export function searchShowsUrl(query: string): string {
  return `${TVMAZE_API}/search/shows?q=${encodeURIComponent(query)}`
}

export function showsPageUrl(page = 0): string {
  return `${TVMAZE_API}/shows?page=${page}`
}

export function showDetailUrl(id: number): string {
  return `${TVMAZE_API}/shows/${id}?embed[]=cast&embed[]=episodes`
}

/** Strip the HTML tags TVMaze includes in show/episode summaries. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatRating(rating: number | null | undefined): string {
  return rating == null ? 'N/A' : rating.toFixed(1)
}
