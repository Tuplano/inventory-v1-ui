import { apiClient } from '@/lib/api-client'

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}

/** Matches the API's "reference" pagination default — one page is usually the whole list. */
export const REFERENCE_PAGE_SIZE = 200

/** Fetches one cursor page of a list endpoint. Tolerates endpoints that don't (yet) paginate and
 * return a bare array — those are treated as a single complete page, so hooks built on this stay
 * correct regardless of which endpoints have pagination support deployed. */
export async function fetchPage<T>(
  url: string,
  cursor: string,
  limit: number = REFERENCE_PAGE_SIZE,
): Promise<CursorPage<T>> {
  const { data } = await apiClient.get<CursorPage<T> | T[]>(url, {
    params: { limit, cursor: cursor || undefined },
  })
  return Array.isArray(data) ? { items: data, nextCursor: null } : data
}
