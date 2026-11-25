# TV Explorer

**Search, browse, and favorite TV shows using live data from the free TVMaze API.**

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f)](https://aghorbani84.github.io/tv-explorer/)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
[![GitHub stars](https://img.shields.io/github/stars/aghorbani84/tv-explorer?style=flat)](https://github.com/aghorbani84/tv-explorer/stargazers)

**Live demo:** https://aghorbani84.github.io/tv-explorer/

## Overview

TV Explorer is a React app for finding TV shows. It reads everything from the public
[TVMaze API](https://www.tvmaze.com/api), which needs no API key, and keeps your favorites in
`localStorage`. If the API can't be reached, the app says so instead of showing placeholder data.

## Features

- **Search by title** with debounced live results (`/search/shows`).
- **Top-rated browse view**: the TVMaze catalog ranked by rating, led by a spotlight card for the #1 show.
- **Genre filter** built from the shows currently listed.
- **Show details**: summary, genres, rating, network, status, dates, runtime, cast, and episodes by season.
- **Favorites** saved in `localStorage`, available even when the API is down.
- **Loading and error states**: skeleton cards, a status strip, and a retry button on failure.
- **Themes**: Achaemenid and Modern styles, each in light and dark.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Data fetching | SWR with native `fetch` |
| Styling | Tailwind CSS 4, Radix UI primitives, class-variance-authority |
| Icons | lucide-react, Tabler Icons |
| Data | TVMaze public API |
| Deploy | GitHub Actions → GitHub Pages |

## Getting started

Requires Node.js 20 or newer and npm. No API key needed.

```bash
git clone https://github.com/aghorbani84/tv-explorer.git
cd tv-explorer
npm install
npm run dev        # http://localhost:5173/tv-explorer/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Project structure

```
src/
  App.tsx            browse, search, genre filter, favorites view
  lib/api.ts         TVMaze types, endpoints, SWR fetcher
  hooks/             useFavorites, useTheme
  components/        ShowCard, ShowDetail, Spotlight, ProofStrip, PosterImage, ThemeSwitcher, ui/
.github/workflows/   GitHub Pages deploy
```

## Author

Built by [Abolfazl Ghorbani](https://github.com/aghorbani84). Show data from [TVMaze](https://www.tvmaze.com/).
