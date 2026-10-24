const bar = 'rounded bg-line motion-safe:animate-pulse'

/** Same shape as VehicleCard so the layout does not jump when data arrives. */
export function VehicleCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5" aria-hidden>
      <div className="flex items-start justify-between">
        <div className={`${bar} h-7 w-16`} />
        <div className={`${bar} h-6 w-14`} />
      </div>
      <div className={`${bar} h-7 w-36`} />
      <div className="grid grid-cols-2 gap-2">
        <div className={`${bar} h-9`} />
        <div className={`${bar} h-9`} />
      </div>
      <div className="border-t border-line pt-3">
        <div className={`${bar} h-4 w-40`} />
      </div>
      <div className={`${bar} h-9 w-32`} />
    </div>
  )
}

export function OptionSkeleton() {
  return (
    <li className="flex items-center gap-3 px-3 py-2" aria-hidden>
      <div className={`${bar} size-4`} />
      <div className={`${bar} h-4 flex-1`} />
    </li>
  )
}

export function DetailRowSkeleton() {
  return (
    <div className="flex justify-between gap-4 py-2" aria-hidden>
      <div className={`${bar} h-4 w-20`} />
      <div className={`${bar} h-4 w-32`} />
    </div>
  )
}
