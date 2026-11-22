import { useEffect, useState } from 'react'

interface ProofStripProps {
  /** Number of shows in the current view, from SWR data. */
  showCount: number | null
  /** ms epoch of the last successful SWR fetch, or null if none yet. */
  updatedAt: number | null
  /** Failed SWR requests this session (distinct error events). */
  failedRequests: number
  /** Current SWR error message, or null when the last request succeeded. */
  error: string | null
  isLoading: boolean
}

function agoText(updatedAt: number, now: number): string {
  const s = Math.max(0, Math.floor((now - updatedAt) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  return `${m}m ago`
}

/**
 * Honest audit strip rendered IN the UI (rank-1 lesson §A.2): every number
 * comes from the live SWR cache — show count, fetch freshness, failed
 * requests. When the API errors it says so instead of faking live data.
 * Format when healthy: "48 shows · TVMaze live · updated 12s ago ·
 * 0 failed requests". All colors are semantic tokens.
 */
export function ProofStrip({ showCount, updatedAt, failedRequests, error, isLoading }: ProofStripProps) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (error) {
    return (
      <p
        role="status"
        className="rounded-full bg-rose-500/10 px-4 py-2 text-xs font-medium leading-relaxed text-rose-700 ring-1 ring-rose-500/30 dark:text-rose-200"
      >
        TVMaze API error · {failedRequests} failed request{failedRequests === 1 ? '' : 's'}
        {updatedAt ? ` · last good data ${agoText(updatedAt, now)}` : ' · no live data yet'}
      </p>
    )
  }

  if (isLoading && updatedAt == null) {
    return (
      <p role="status" className="rounded-full bg-surface px-4 py-2 text-xs font-medium leading-relaxed text-muted ring-1 ring-line">
        Loading live data from TVMaze…
      </p>
    )
  }

  return (
    <p
      role="status"
      className="rounded-full bg-surface px-4 py-2 text-xs font-medium leading-relaxed text-muted ring-1 ring-line"
    >
      <span className="font-semibold text-ink">{showCount ?? '—'} shows</span>
      {' · TVMaze live · updated '}
      {updatedAt ? agoText(updatedAt, now) : '—'}
      {` · ${failedRequests} failed request${failedRequests === 1 ? '' : 's'}`}
    </p>
  )
}
