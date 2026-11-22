'use client'

import { useEffect, useState } from 'react'
import { BellPlus, LoaderCircle, Trash2, X } from 'lucide-react'
import { ApiError, haptic, type Address, type Reminder } from '@/lib/api'
import { queueLabel } from '@/lib/i18n'
import type { HourKind } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { useActions, useT } from '@/hooks/use-app-data'
import { KIND_LABEL } from './schedule-grid'

const LEADS = [0, 5, 10, 15, 30, 60]

interface ReminderSheetProps {
  onClose: () => void
  address: Address
  dayKey: string
  dayLabel: string
  hour: number
  kind: HourKind
  existing?: Reminder
}

const pad = (n: number) => String(n).padStart(2, '0')

export function ReminderSheet({ onClose, address, dayKey, dayLabel, hour, kind, existing }: ReminderSheetProps) {
  const { t, lang } = useT()
  const { addReminder, deleteReminder, demo } = useActions()
  const [lead, setLead] = useState(existing?.leadMin ?? 15)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.code === 'PAST') setError(t('rem.past'))
    else if (e instanceof ApiError && e.code === 'LIMIT_REACHED') setError(t('rem.limit'))
    else setError(e instanceof Error ? e.message : t('rem.fail'))
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await addReminder({ addressId: address.id, dayKey, hour, leadMin: lead })
      haptic('medium')
      onClose()
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!existing) return
    setBusy(true)
    setError(null)
    try {
      await deleteReminder(existing.id)
      haptic('light')
      onClose()
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  const from = `${pad(hour - 1)}:00`
  const to = `${pad(hour % 24)}:00`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <button
        type="button"
        aria-label={t('sheet.close')}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t bg-card p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 id="reminder-title" className="flex items-center gap-2 font-display text-2xl font-bold">
            <BellPlus className="size-6 text-on" aria-hidden="true" />
            {t('rem.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full hover:bg-muted"
            aria-label={t('sheet.close')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 rounded-2xl border bg-muted/40 p-3">
          <p className="font-medium">
            {address.label} · {queueLabel(lang, address.queue)}
          </p>
          <p className="text-sm text-muted-foreground">{t('rem.when', { day: dayLabel, from, to })}</p>
          <p className="text-sm text-muted-foreground">{t(KIND_LABEL[kind])}</p>
        </div>

        <fieldset className="mt-4">
          <legend className="mb-1.5 text-sm font-medium">{t('rem.lead')}</legend>
          <div className="flex flex-wrap gap-1.5">
            {LEADS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={lead === m}
                onClick={() => setLead(m)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm tabular-nums transition-colors',
                  lead === m ? 'border-on bg-on text-on-foreground' : 'bg-card hover:bg-muted',
                )}
              >
                {m === 0 ? t('rem.leadNow') : `${m} ${t('unit.m')}`}
              </button>
            ))}
          </div>
        </fieldset>

        {existing && <p className="mt-3 text-xs text-muted-foreground">{t('rem.exists')}</p>}
        {demo && <p className="mt-3 text-xs text-muted-foreground">{t('rem.demoNote')}</p>}
        <p className="mt-3 text-xs text-muted-foreground">{t('rem.tgHint')}</p>

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-on text-lg font-medium text-on-foreground shadow-[0_6px_20px_-8px_var(--on)] transition-opacity disabled:opacity-50"
        >
          {busy && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
          {t('rem.save')}
        </button>
        {existing && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-destructive/40 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('rem.delete')}
          </button>
        )}
      </div>
    </div>
  )
}
