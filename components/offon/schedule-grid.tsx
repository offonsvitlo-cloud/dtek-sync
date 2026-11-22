'use client'

import { Bell, CircleHelp, Clock, Zap, ZapOff } from 'lucide-react'
import { hourKind, type HourKind, type SlotValue } from '@/lib/schedule'
import type { Key } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useT } from '@/hooks/use-app-data'
import { Switch } from './switch'

interface ScheduleGridProps {
  hours: Record<string, SlotValue> | undefined
  queueName: string
  showTomorrow: boolean
  onToggleTomorrow: (v: boolean) => void
  clockLabel: string
  minutesOfDay: number
  dark: boolean
  onToggleDark: (v: boolean) => void
  onPickHour?: (hour: number) => void
  reminderHours?: number[]
}

const KIND_STYLE: Record<HourKind, string> = {
  on: 'bg-on text-on-foreground border-on shadow-[inset_0_1px_0_oklch(1_0_0/25%),0_2px_6px_-2px_var(--on)]',
  off: 'bg-off text-off-foreground border-off shadow-[inset_0_1px_0_oklch(1_0_0/12%)]',
  'off-first': 'bg-warn text-warn-foreground border-warn',
  'off-second': 'bg-warn text-warn-foreground border-warn',
  maybe: 'bg-warn/10 text-warn-foreground dark:text-warn border-warn',
  unknown: 'bg-muted text-muted-foreground border-border',
}

const KIND_TEXT: Record<HourKind, Key> = {
  on: 'kind.on',
  off: 'kind.off',
  'off-first': 'kind.offFirst',
  'off-second': 'kind.offSecond',
  maybe: 'kind.maybe',
  unknown: 'kind.unknown',
}

export const KIND_LABEL: Record<HourKind, Key> = {
  on: 'kindLabel.on',
  off: 'kindLabel.off',
  'off-first': 'kindLabel.offFirst',
  'off-second': 'kindLabel.offSecond',
  maybe: 'kindLabel.maybe',
  unknown: 'kindLabel.unknown',
}

function KindIcon({ kind }: { kind: HourKind }) {
  const cls = 'size-3.5 shrink-0'
  if (kind === 'on') return <Zap className={cls} fill="currentColor" aria-hidden="true" />
  if (kind === 'off') return <ZapOff className={cn(cls, 'opacity-70')} aria-hidden="true" />
  if (kind === 'unknown') return <CircleHelp className={cls} aria-hidden="true" />
  if (kind === 'maybe') return <Zap className={cls} aria-hidden="true" />
  return <Clock className={cls} aria-hidden="true" />
}

export function ScheduleGrid({
  hours,
  queueName,
  showTomorrow,
  onToggleTomorrow,
  clockLabel,
  minutesOfDay,
  dark,
  onToggleDark,
  onPickHour,
  reminderHours = [],
}: ScheduleGridProps) {
  const { t } = useT()
  const currentHour = Math.floor(minutesOfDay / 60)
  const hasData = hours && Object.keys(hours).length > 0
  const dayProgress = (minutesOfDay / 1440) * 100

  return (
    <section aria-labelledby="schedule-title" className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 id="schedule-title" className="font-display text-xl font-medium tracking-wide uppercase">
          {t('grid.title')}
        </h2>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn(showTomorrow && 'font-medium text-foreground')}>{t('grid.tomorrow')}</span>
          <Switch checked={showTomorrow} onCheckedChange={onToggleTomorrow} label={t('grid.tomorrowAria')} />
        </label>
      </div>

      <div className="mt-1 flex items-end justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {t('grid.scale', { q: queueName })}
          {showTomorrow ? t('grid.scaleTomorrow') : ''}
        </span>
        {!showTomorrow && <span className="font-medium text-foreground tabular-nums">{clockLabel}</span>}
      </div>
      {!showTomorrow && (
        <div className="relative mt-1.5 h-1 rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-foreground/50" style={{ width: `${dayProgress}%` }} />
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow"
            style={{ left: `${dayProgress}%` }}
          />
        </div>
      )}

      {hasData ? (
        <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label={t('grid.listAria', { q: queueName })}>
          {Array.from({ length: 24 }, (_, h) => {
            const kind = hourKind(hours?.[String(h + 1)])
            const isNow = !showTomorrow && h === currentHour
            const time = `${String(h).padStart(2, '0')}:00`
            const canRemind = Boolean(onPickHour) && (showTomorrow || h > currentHour)
            const hasReminder = reminderHours.includes(h + 1)
            return (
              <li key={h}>
                <button
                  type="button"
                  disabled={!canRemind}
                  onClick={() => onPickHour?.(h + 1)}
                  aria-label={`${time} — ${t(KIND_LABEL[kind])}${isNow ? t('grid.nowAria') : ''}${hasReminder ? t('rem.cellSet') : canRemind ? t('rem.cellTap') : ''}`}
                  aria-current={isNow ? 'time' : undefined}
                  className={cn(
                    'relative flex min-h-14 w-full flex-col justify-between rounded-[10px] border px-1.5 py-1.5 text-left text-[11px] leading-tight transition-transform',
                    KIND_STYLE[kind],
                    isNow && 'now-ring z-10 scale-[1.04]',
                    !showTomorrow && h < currentHour && 'opacity-55',
                    canRemind && 'active:scale-95',
                    !canRemind && 'cursor-default',
                  )}
                >
                  <span className="flex items-center justify-between gap-0.5 font-medium tabular-nums">
                    {time}
                    <KindIcon kind={kind} />
                  </span>
                  <span className="flex items-center justify-between gap-0.5">
                    <span className="truncate text-xs font-medium">{t(KIND_TEXT[kind])}</span>
                    {hasReminder && <Bell className="size-3 shrink-0" fill="currentColor" aria-hidden="true" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          {showTomorrow ? t('grid.emptyTomorrow') : t('grid.emptyToday')}
        </p>
      )}

      {hasData && onPickHour && <p className="mt-2 text-xs text-muted-foreground">{t('rem.tapHint')}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-label={t('grid.legend')}>
          <li className="flex items-center gap-1">
            <span className="size-2.5 rounded-sm bg-on" aria-hidden="true" />
            {t('grid.legendOn')}
          </li>
          <li className="flex items-center gap-1">
            <span className="size-2.5 rounded-sm bg-off" aria-hidden="true" />
            {t('grid.legendOff')}
          </li>
          <li className="flex items-center gap-1">
            <span className="size-2.5 rounded-sm bg-warn" aria-hidden="true" />
            {t('grid.legendHalf')}
          </li>
        </ul>
        <label className="flex items-center gap-2 text-sm">
          {t('grid.theme')}
          <Switch checked={dark} onCheckedChange={onToggleDark} label={t('grid.darkAria')} />
        </label>
      </div>
    </section>
  )
}
