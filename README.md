# TV Explorer

A TV show browser powered by the free [TVMaze API](https://www.tvmaze.com/api) — no API key
or sign-up required. Search for shows, browse the highest-rated trending titles, filter by
genre, open a detail page with cast and episodes, and keep a favorites list that persists
in your browser.

## Features

- **Search by title** — live results from `GET /search/shows?q=...` (debounced, 400 ms)
- **Trending on the home page** — the TVMaze catalog (`GET /shows?page=0`) ranked by
  average rating, top 24 with posters
- **Genre filter** — built from the genres of the shows currently listed
- **Show detail view** — summary, genres, rating, network, status, premiered/ended dates,
  runtime, plus cast and a season-by-season episode list via
  `GET /shows/:id?embed[]=cast&embed[]=episodes`
- **Favorites** — saved in `localStorage`, so the list survives reloads and works even
  when the API is temporarily unreachable
- **Loading & error states** — skeleton cards while loading, and a clear message with a
  retry button when the TVMaze API is unreachable. No fake or placeholder show data:
  every title, poster, rating and episode comes from the live API.

## Tech used

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) +
  [Vite](https://vite.dev/)
- [SWR](https://swr.vercel.app/) for data fetching (caching, revalidation, error handling)
- Native `fetch` as the SWR fetcher — no extra HTTP client
- [Tailwind CSS v4](https://tailwindcss.com/) (via the `@tailwindcss/vite` plugin) for styling
- [TVMaze API](https://www.tvmaze.com/api) for all show data (free, no key)

## How to run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

```bash
npm run build    # typecheck (tsc) + production build
npm run preview  # serve the production build locally
```

## Project structure

```
src/
  lib/api.ts            # TVMaze types, endpoints, native-fetch SWR fetcher
  hooks/useFavorites.ts # favorites persisted in localStorage
  components/ShowCard.tsx
  components/ShowDetail.tsx
  App.tsx               # search, trending, genre filter, favorites view
  main.tsx
  index.css             # Tailwind CSS v4 import
```

## Notes

- The app never invents show data: if the TVMaze API cannot be reached, it says so
  instead of showing made-up titles.
- Favorites store full show objects in localStorage under the key
  `tv-explorer:favorites`.
