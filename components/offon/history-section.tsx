'use client'

import { useState } from 'react'
import { CalendarDays, Clock, History, ZapOff } from 'lucide-react'
import type { AlertEvent } from '@/lib/api'
import { dayTitle, dayTotals, formatHours, halfSlots, offIntervals, type Snapshot } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { useT } from '@/hooks/use-app-data'
import { AlertItem } from './alert-item'

interface HistorySectionProps {
  snapshot: Snapshot
  queue: string
  todayKey: string
  tomorrowKey: string | null
  alerts: AlertEvent[]
}

export function HistorySection({ snapshot, queue, todayKey, tomorrowKey, alerts }: HistorySectionProps) {
  const { t, lang } = useT()
  const [mode, setMode] = useState<'days' | 'events'>('days')

  const merged = { ...(snapshot.historyDays ?? {}), ...(snapshot.days ?? {}) }
  const yesterdayKey = String(Number(todayKey) - 86400)
  const dayKeys = Object.keys(merged)
    .filter((k) => Number(k) <= Number(tomorrowKey ?? todayKey))
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, 8)

  const tagFor = (k: string) =>
    k === tomorrowKey
      ? { text: t('hist.tomorrow'), cls: 'text-sky-600 dark:text-sky-400' }
      : k === todayKey
        ? { text: t('hist.today'), cls: 'text-warn' }
        : Math.abs(Number(k) - Number(yesterdayKey)) < 7200
          ? { text: t('hist.yesterday'), cls: 'text-muted-foreground' }
          : null

  return (
    <section aria-labelledby="history-title" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="history-title" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <History className="size-4 text-warn" aria-hidden="true" />
          {t('hist.title')}
        </h2>
        <div role="tablist" aria-label={t('hist.viewAria')} className="flex rounded-xl bg-muted p-0.5 text-sm">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'days'}
            onClick={() => setMode('days')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors',
              mode === 'days' ? 'bg-card font-medium shadow-sm' : 'text-muted-foreground',
            )}
          >
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {t('hist.byDays')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'events'}
            onClick={() => setMode('events')}
            className={cn(
              'rounded-lg px-2.5 py-1 transition-colors',
              mode === 'events' ? 'bg-card font-medium shadow-sm' : 'text-muted-foreground',
            )}
          >
            {t('hist.events', { n: alerts.length })}
          </button>
        </div>
      </div>

      {mode === 'days' ? (
        <ul className="space-y-2">
          {dayKeys.map((k) => {
            const slots = halfSlots(merged[k]?.[queue])
            const totals = dayTotals(slots)
            const intervals = offIntervals(slots)
            const tag = tagFor(k)
            return (
              <li key={k} className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold">
                    {dayTitle(k, lang)}
                    {tag && <span className={cn('font-medium', tag.cls)}> · {tag.text}</span>}
                  </p>
                  <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                    {!totals
                      ? t('hist.notPublished')
                      : intervals.length
                        ? intervals.join(', ')
                        : t('hist.noOutages', { h: t('unit.h') })}
                  </p>
                </div>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1 font-display text-lg font-bold tabular-nums',
                    totals?.offHours ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  <ZapOff className="size-4" aria-hidden="true" />
                  {totals ? `${formatHours(totals.offHours)} ${t('unit.h')}` : '—'}
                </span>
              </li>
            )
          })}
        </ul>
      ) : alerts.length ? (
        <ul className="space-y-2">
          {alerts.slice(0, 20).map((a) => (
            <AlertItem key={a.id} alert={a} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t('hist.noEvents')}
        </p>
      )}
    </section>
  )
}
