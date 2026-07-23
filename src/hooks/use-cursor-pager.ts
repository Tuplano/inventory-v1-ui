import { useState } from 'react'

/**
 * Prev/Next paging over a cursor-based API. The server only ever hands back a `nextCursor`, so
 * "Prev" isn't something the API can answer directly — this keeps a local stack of cursors seen
 * this session and pops off it. That means a hard refresh (or a shared link) mid-list loses the
 * ability to step back past the page it landed on; only forward navigation is fully reliable.
 */
export function useCursorPager(cursor: string | undefined, setCursor: (cursor: string | undefined) => void) {
  const [history, setHistory] = useState<string[]>(cursor ? [cursor] : [])

  function goNext(nextCursor: string | null) {
    if (!nextCursor) return
    setHistory((h) => [...h, nextCursor])
    setCursor(nextCursor)
  }

  function goPrev() {
    setHistory((h) => {
      if (h.length === 0) return h
      const next = h.slice(0, -1)
      setCursor(next[next.length - 1])
      return next
    })
  }

  function reset() {
    setHistory([])
    setCursor(undefined)
  }

  return { cursor, hasPrev: history.length > 0, goNext, goPrev, reset }
}
