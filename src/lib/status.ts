export interface StatusInfo {
  label: string
  icon: string
  /** Tailwind classes for the badge. */
  tone: string
}

const STATUS: Record<string, StatusInfo> = {
  IN_TRANSIT_TO: { label: 'Menuju halte', icon: 'solar:routing-2-bold', tone: 'bg-moving-soft text-moving' },
  INCOMING_AT: { label: 'Segera tiba', icon: 'solar:map-arrow-right-bold', tone: 'bg-arriving-soft text-arriving' },
  STOPPED_AT: { label: 'Berhenti di halte', icon: 'solar:stop-circle-bold', tone: 'bg-stopped-soft text-stopped' },
}

const UNKNOWN: StatusInfo = {
  label: 'Status tidak diketahui',
  icon: 'solar:question-circle-bold',
  tone: 'bg-canvas text-ink-muted',
}

export function statusInfo(raw: string | null | undefined): StatusInfo {
  return (raw && STATUS[raw]) || UNKNOWN
}
