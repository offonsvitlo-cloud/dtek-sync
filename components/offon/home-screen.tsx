'use client'

import { useState } from 'react'
import { MapPinPlus, RefreshCw } from 'lucide-react'
import type { Bootstrap } from '@/lib/api'
import { haptic } from '@/lib/api'
import { hourKind } from '@/lib/schedule'
import { queueStatus } from '@/lib/address-status'
import { queueLabel } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useActions, useT, useVisibleAlerts } from '@/hooks/use-app-data'
import { AddressStrip } from './address-strip'
import { HistorySection } from './history-section'
import { ReminderSheet } from './reminder-sheet'
import { ScheduleGrid } from './schedule-grid'
import { StatusCard } from './status-card'

interface HomeScreenProps {
  data: Bootstrap
  now: Date
  selectedId: string | null
  onSelect: (id: string) => void
  onAddAddress: () => void
  dark: boolean
  onToggleDark: (v: boolean) => void
}

export function HomeScreen({ data, now, selectedId, onSelect, onAddAddress, dark, onToggleDark }: HomeScreenProps) {
  const { refreshDtek } = useActions()
  const { t, lang } = useT()
  const [refreshing, setRefreshing] = useState(false)
  const [showTomorrow, setShowTomorrow] = useState(false)
  const [picked, setPicked] = useState<{ hour: number; dayKey: string; tomorrow: boolean } | null>(null)
  const visibleAlerts = useVisibleAlerts()

  const { snapshot, subscriber } = data
  const addresses = subscriber.addresses
  const selected = addresses.find((a) => a.id === selectedId) ?? addresses[0] ?? null

  const handleRefresh = async () => {
    haptic('light')
    setRefreshing(true)
    try {
      await refreshDtek()
    } finally {
      setRefreshing(false)
    }
  }

  const refreshButton = (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={refreshing}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/20 bg-card px-3.5 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:opacity-70"
    >
      <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} aria-hidden="true" />
      {t('home.refresh')}
    </button>
  )

  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t('home.updated', { v: snapshot.update ?? '—' })}</p>
          {refreshButton}
        </div>
        <section
          className="glow-card relative overflow-hidden rounded-3xl border bg-card p-6 text-center"
          style={{ ['--glow' as string]: 'var(--on)' }}
        >
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-on text-on-foreground shadow-[0_0_24px_-2px_var(--on)]">
            <MapPinPlus className="size-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold">{t('home.addTitle')}</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {t('home.addDesc')}
          </p>
          <button
            type="button"
            onClick={onAddAddress}
            className="mt-5 w-full rounded-full bg-on py-3 text-lg font-medium text-on-foreground shadow-[0_4px_20px_-6px_var(--on)]"
          >
            {t('home.addBtn')}
          </button>
        </section>
      </div>
    )
  }

  const status = queueStatus(snapshot, selected.queue, now)
  const dayKey = showTomorrow ? status.tomorrowKey : status.todayKey
  const hours = dayKey ? snapshot.days?.[dayKey]?.[selected.queue] : undefined
  const alerts = visibleAlerts.filter((a) =>
    a.addressId ? a.addressId === selected.id : !a.queue || a.queue === 'ALL' || a.queue === selected.queue,
  )
  const reminders = (subscriber.reminders ?? []).filter((r) => r.addressId === selected.id && !r.sent)
  const reminderHours = reminders.filter((r) => r.dayKey === dayKey).map((r) => r.hour)
  const pickedReminder = picked
    ? reminders.find((r) => r.dayKey === picked.dayKey && r.hour === picked.hour)
    : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-sm leading-snug text-muted-foreground">
          <p className="truncate text-foreground/80">
            {selected.label} · {queueLabel(lang, selected.queue)} · {selected.city}
          </p>
          <p>{t('home.updated', { v: snapshot.update ?? '—' })}</p>
        </div>
        {refreshButton}
      </div>

      <AddressStrip
        addresses={addresses}
        snapshot={snapshot}
        now={now}
        selectedId={selected.id}
        onSelect={(id) => {
          haptic('light')
          onSelect(id)
        }}
      />

      <StatusCard status={status} />

      <button
        type="button"
        onClick={onAddAddress}
        className="w-full rounded-full border-2 border-foreground/25 bg-card/60 py-3 font-display text-xl font-medium shadow-sm transition-colors hover:border-on hover:text-on"
      >
        {t('home.addBtn')}
      </button>

      <ScheduleGrid
        hours={hours}
        queueName={queueLabel(lang, selected.queue)}
        showTomorrow={showTomorrow}
        onToggleTomorrow={(v) => {
          haptic('light')
          setShowTomorrow(v)
        }}
        clockLabel={status.clock.label}
        minutesOfDay={status.clock.minutesOfDay}
        dark={dark}
        onToggleDark={onToggleDark}
        reminderHours={reminderHours}
        onPickHour={(hour) => {
          if (!dayKey) return
          haptic('light')
          setPicked({ hour, dayKey, tomorrow: showTomorrow })
        }}
      />

      {picked && (
        <ReminderSheet
          key={`${picked.dayKey}-${picked.hour}`}
          onClose={() => setPicked(null)}
          address={selected}
          dayKey={picked.dayKey}
          dayLabel={picked.tomorrow ? t('hist.tomorrow') : t('hist.today')}
          hour={picked.hour}
          kind={hourKind(snapshot.days?.[picked.dayKey]?.[selected.queue]?.[String(picked.hour)])}
          existing={pickedReminder}
        />
      )}

      <HistorySection
        snapshot={snapshot}
        queue={selected.queue}
        todayKey={status.todayKey}
        tomorrowKey={status.tomorrowKey}
        alerts={alerts}
      />
    </div>
  )
}
