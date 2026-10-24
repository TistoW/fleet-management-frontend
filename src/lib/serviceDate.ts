const ny = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })

/** MBTA service date (YYYY-MM-DD, Boston time). Service days run until about 03:00, so before that it is still the previous day. */
export function serviceDate(now = Date.now()): string {
  return ny.format(new Date(now - 3 * 3600_000))
}
