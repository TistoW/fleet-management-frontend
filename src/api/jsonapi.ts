import type { Resource } from '../types/mbta'

export type IncludedIndex = Map<string, Resource<unknown>>

/** `included` is unique per type:id and not ordered like `data`, so index it. */
export function indexIncluded(included?: Resource<unknown>[]): IncludedIndex {
  return new Map((included ?? []).map((r) => [`${r.type}:${r.id}`, r]))
}

/** Id of a to-one relationship, or null when missing or `data: null`. */
export function relId(resource: Resource<unknown>, name: string): string | null {
  return resource.relationships?.[name]?.data?.id ?? null
}

export function pickIncluded<A>(
  index: IncludedIndex,
  type: string,
  id: string | null,
): Resource<A> | undefined {
  return id ? (index.get(`${type}:${id}`) as Resource<A> | undefined) : undefined
}

/** `page[offset]` from a links.next / links.last URL (encoded or not), null if absent. */
export function offsetFromLink(url?: string): number | null {
  if (!url) return null
  const raw = new URL(url, 'https://x').searchParams.get('page[offset]')
  const n = raw === null ? NaN : Number(raw)
  return Number.isInteger(n) ? n : null
}
