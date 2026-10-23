import { Icon } from '@iconify/react'

export default function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <span role="status" className="inline-flex">
      <Icon icon="solar:refresh-bold" className={`${className} motion-safe:animate-spin`} aria-hidden />
      <span className="sr-only">Memuat</span>
    </span>
  )
}
