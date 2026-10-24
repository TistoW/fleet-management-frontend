export interface StatusInfo {
  label: string
  /** Which stat card / quick filter this status belongs to. */
  group: 'berjalan' | 'berhenti' | null
  icon: string
  /** Tailwind classes for the badge. */
  tone: string
}

const STATUS: Record<string, StatusInfo> = {
  IN_TRANSIT_TO: { label: 'Menuju halte', group: 'berjalan', icon: 'solar:routing-2-linear', tone: 'bg-moving-soft text-moving' },
  INCOMING_AT: { label: 'Segera tiba', group: 'berjalan', icon: 'solar:map-arrow-right-linear', tone: 'bg-arriving-soft text-arriving' },
  STOPPED_AT: { label: 'Berhenti di halte', group: 'berhenti', icon: 'solar:stop-circle-linear', tone: 'bg-stopped-soft text-stopped' },
}

const UNKNOWN: StatusInfo = {
  label: 'Status tidak diketahui',
  group: null,
  icon: 'solar:question-circle-linear',
  tone: 'bg-canvas text-ink-muted',
}

export function statusInfo(raw: string | null | undefined): StatusInfo {
  return (raw && STATUS[raw]) || UNKNOWN
}

const OCCUPANCY: Record<string, string> = {
  EMPTY: 'Kosong',
  MANY_SEATS_AVAILABLE: 'Banyak kursi kosong',
  FEW_SEATS_AVAILABLE: 'Sisa sedikit kursi',
  STANDING_ROOM_ONLY: 'Hanya tempat berdiri',
  CRUSHED_STANDING_ROOM_ONLY: 'Berdiri berdesakan',
  FULL: 'Penuh',
  NOT_ACCEPTING_PASSENGERS: 'Tidak menerima penumpang',
}

export function occupancyLabel(raw: string | null | undefined): string {
  return (raw && OCCUPANCY[raw]) || 'Tidak ada data'
}

const ROUTE_TYPE = ['Kereta ringan', 'Kereta bawah tanah', 'Kereta komuter', 'Bus', 'Feri']

export const routeTypeLabel = (t: number) => ROUTE_TYPE[t] ?? 'Lainnya'
