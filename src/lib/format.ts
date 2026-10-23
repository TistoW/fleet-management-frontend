const clock = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
})
const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })

/** "23:14:52" in WIB, whatever offset the API used. */
export function formatClockWib(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '-' : clock.format(d).replace(/\./g, ':')
}

/** "2 menit lalu", "baru saja". */
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = Math.round((new Date(iso).getTime() - now) / 1000)
  if (Number.isNaN(diff)) return '-'
  const abs = Math.abs(diff)
  if (abs < 10) return 'baru saja'
  if (abs < 60) return rtf.format(diff, 'second')
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export function formatCoord(n: number | null): string {
  return n === null ? '-' : n.toFixed(5)
}
