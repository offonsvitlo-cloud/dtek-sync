import { CircleHelp, Zap, ZapOff } from 'lucide-react'
import type { QueueStatus } from '@/lib/address-status'
import { formatDuration, formatHours } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { useT } from '@/hooks/use-app-data'

const SPARKS = [
  { left: '6%', bottom: '10%', delay: '0s', dur: '4.2s', dx: '6px', size: 4 },
  { left: '14%', bottom: '55%', delay: '1.4s', dur: '3.6s', dx: '-8px', size: 3 },
  { left: '28%', bottom: '5%', delay: '2.2s', dur: '5s', dx: '10px', size: 3 },
  { left: '52%', bottom: '18%', delay: '0.8s', dur: '4.6s', dx: '-6px', size: 4 },
  { left: '71%', bottom: '8%', delay: '3s', dur: '3.8s', dx: '8px', size: 3 },
  { left: '86%', bottom: '40%', delay: '1.9s', dur: '4.4s', dx: '-10px', size: 5 },
  { left: '94%', bottom: '12%', delay: '2.7s', dur: '5.2s', dx: '4px', size: 3 },
]

export function StatusCard({ status }: { status: QueueStatus }) {
  const { t, lang } = useT()
  const { now, totals, clock } = status
  const off = now.state === 'off'
  const unknown = now.state === 'unknown'
  const glow = off ? 'var(--alert)' : unknown ? 'var(--muted-foreground)' : 'var(--on)'

  const tomorrowPublished = status.tomorrow.some((s) => s !== 'unknown')
  const title = off
    ? t('status.off')
    : unknown
      ? t('status.unknown')
      : now.maybe
        ? t('status.maybe')
        : t('status.on')
  const subtitle = unknown
    ? t('status.subUnknown')
    : now.nextChangeMin == null
      ? off
        ? t('status.subOffNoPlan')
        : tomorrowPublished
          ? t('status.subOnTomorrow')
          : t('status.subOnDay')
      : t(off ? 'status.onIn' : 'status.offIn', {
          d: formatDuration(now.nextChangeMin, lang),
          t: now.nextChangeLabel ?? '',
        })

  return (
    <section
      aria-live="polite"
      aria-label={t('status.aria')}
      className={cn('glow-card relative overflow-hidden rounded-3xl border bg-card p-4')}
      style={{ ['--glow' as string]: glow }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-10 size-48 rounded-full opacity-30 blur-3xl"
        style={{ background: glow }}
      />
      {!unknown && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {SPARKS.map((s, i) => (
            <span
              key={i}
              className="spark absolute rounded-full"
              style={{
                left: s.left,
                bottom: s.bottom,
                width: s.size,
                height: s.size,
                background: glow,
                boxShadow: `0 0 8px ${glow}`,
                ['--delay' as string]: s.delay,
                ['--dur' as string]: s.dur,
                ['--dx' as string]: s.dx,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex items-center gap-3.5">
        <div
          className={cn(
            'grid size-16 shrink-0 place-items-center rounded-2xl text-white',
            off
              ? 'bg-gradient-to-br from-alert to-off'
              : unknown
                ? 'bg-muted-foreground'
                : 'bg-gradient-to-br from-on to-[oklch(0.45_0.14_150)]',
          )}
          style={{ boxShadow: `0 0 22px -2px ${glow}, inset 0 1px 0 oklch(1 0 0 / 30%)` }}
        >
          {off ? (
            <ZapOff className="size-8" aria-hidden="true" />
          ) : unknown ? (
            <CircleHelp className="size-8" aria-hidden="true" />
          ) : (
            <Zap className="bolt-flicker size-8" fill="currentColor" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <h2
            className={cn(
              'font-display text-3xl leading-tight font-bold',
              off ? 'text-alert' : unknown ? 'text-foreground' : 'text-on',
            )}
          >
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <dl className="relative mt-3 grid grid-cols-3 gap-2 border-t pt-3">
        <div>
          <dt className="text-sm text-muted-foreground">{t('status.withLight')}</dt>
          <dd className="font-display text-3xl font-bold text-on tabular-nums">
            {totals ? `${formatHours(totals.onHours)} ${t('unit.h')}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t('status.withoutLight')}</dt>
          <dd className="font-display text-3xl font-bold text-destructive tabular-nums">
            {totals ? `${formatHours(totals.offHours)} ${t('unit.h')}` : '—'}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-sm text-muted-foreground">{t('status.now')}</dt>
          <dd className="font-display text-3xl font-bold tabular-nums">{clock.label}</dd>
        </div>
      </dl>
    </section>
  )
}
