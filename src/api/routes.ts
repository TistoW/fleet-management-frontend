import type { Route } from '../types/mbta'
import { apiGet } from './client'
import { offsetFromLink } from './jsonapi'

export interface RouteView {
  id: string
  name: string
  longName: string
  description: string
  color: string
  textColor: string
  type: number
  directionNames: string[]
}

export interface Page<T> {
  items: T[]
  /** Offset for the next page, null when this was the last one. */
  nextOffset: number | null
}

export const ROUTE_PAGE_SIZE = 30

export function toRouteView(r: Pick<Route, 'id'> & { attributes: Partial<Route['attributes']> }): RouteView {
  const a = r.attributes
  return {
    id: r.id,
    name: a.short_name || a.long_name || r.id,
    longName: a.long_name ?? '',
    description: a.description ?? '',
    color: `#${a.color || '5B6863'}`,
    textColor: `#${a.text_color || 'FFFFFF'}`,
    type: a.type ?? 3,
    directionNames: a.direction_names ?? [],
  }
}

export async function fetchRoutesPage(offset: number, signal?: AbortSignal): Promise<Page<RouteView>> {
  const doc = await apiGet<Route[]>(
    '/routes',
    {
      'page[limit]': ROUTE_PAGE_SIZE,
      'page[offset]': offset,
      sort: 'sort_order',
      'fields[route]': 'short_name,long_name,color,text_color,type,description,direction_names',
    },
    signal,
  )
  return { items: doc.data.map(toRouteView), nextOffset: offsetFromLink(doc.links?.next) }
}
