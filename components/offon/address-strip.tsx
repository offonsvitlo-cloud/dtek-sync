'use client'

import { ChevronRight, CircleHelp, TriangleAlert } from 'lucide-react'
import type { Address } from '@/lib/api'
import { queueStatus } from '@/lib/address-status'
import { formatDuration, type Snapshot } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { useT } from '@/hooks/use-app-data'

interface AddressStripProps {
  addresses: Address[]
  snapshot: Snapshot
  now: Date
  selectedId: string | null
  onSelect: (id: string) => void
}

export function AddressStrip({ addresses, snapshot, now, selectedId, onSelect }: AddressStripProps) {
  const { t, lang } = useT()
  if (addresses.length < 2) return null
  return (
    <div
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      role="list"
      aria-label={t('strip.aria')}
    >
      {addresses.map((a) => {
        const st = queueStatus(snapshot, a.queue, now).now
        const off = st.state === 'off'
        const unknown = st.state === 'unknown'
        const selected = a.id === selectedId
        return (
          <button
            key={a.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(a.id)}
            aria-pressed={selected}
            className={cn(
              'relative w-[78%] max-w-72 shrink-0 snap-start overflow-hidden rounded-2xl border bg-card p-3.5 text-left shadow-sm transition-all',
              selected ? 'border-on/60 ring-2 ring-on/40' : 'hover:border-foreground/20',
              !a.enabled && 'opacity-60',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-display text-base font-medium tracking-wide uppercase">{a.label}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
            <div
              className={cn(
                'mt-0.5 flex items-center gap-1.5 font-display text-xl font-bold tracking-wide uppercase',
                off ? 'text-alert' : unknown ? 'text-muted-foreground' : 'text-on',
              )}
            >
              {off ? (
                <TriangleAlert className="size-5" fill="currentColor" stroke="var(--card)" aria-hidden="true" />
              ) : unknown ? (
                <CircleHelp className="size-5" aria-hidden="true" />
              ) : (
                <span className="size-4 rounded-full bg-on shadow-[0_0_8px_var(--on)]" aria-hidden="true" />
              )}
              {off ? t('strip.off') : unknown ? t('strip.unknown') : t('strip.on')}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {st.nextChangeMin == null
                ? unknown
                  ? t('strip.notPublished')
                  : t('strip.noChange')
                : `${off ? t('strip.untilOn') : t('strip.untilOff')}: ${formatDuration(st.nextChangeMin, lang)}`}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className={cn('relative h-full rounded-full', off ? 'bg-alert' : 'bg-on')}
                style={{ width: `${Math.round(st.progress * 100)}%` }}
              >
                <span className="shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
