'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, Plus, Trash2, Zap, ZapOff } from 'lucide-react'
import type { Address, Bootstrap } from '@/lib/api'
import { haptic, maxAddresses } from '@/lib/api'
import { queueStatus } from '@/lib/address-status'
import { queueLabel } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useActions, useT } from '@/hooks/use-app-data'
import { ReferralCard, TrialCard } from './perks'
import { Switch } from './switch'

const LEAD_OPTIONS = [0, 5, 10, 15, 30, 60]

interface AddressesScreenProps {
  data: Bootstrap
  now: Date
  onAdd: () => void
  onOpen: (id: string) => void
}

export function AddressesScreen({ data, now, onAdd, onOpen }: AddressesScreenProps) {
  const { t } = useT()
  const { subscriber, snapshot } = data
  const max = maxAddresses(data)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{t('addrs.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('addrs.used', { n: subscriber.addresses.length, max })}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-full bg-on px-4 py-2 font-medium text-on-foreground shadow-[0_4px_16px_-6px_var(--on)]"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('addrs.add')}
        </button>
      </div>

      {subscriber.addresses.length === 0 ? (
        <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">
          {t('addrs.empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {subscriber.addresses.map((a) => (
            <AddressCard key={a.id} address={a} state={queueStatus(snapshot, a.queue, now).now.state} onOpen={onOpen} />
          ))}
        </ul>
      )}

      <TrialCard subscriber={subscriber} now={now} />
      <ReferralCard />
    </div>
  )
}

function AddressCard({
  address: a,
  state,
  onOpen,
}: {
  address: Address
  state: 'on' | 'off' | 'unknown'
  onOpen: (id: string) => void
}) {
  const { updateAddress, deleteAddress } = useActions()
  const { t, lang } = useT()
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <li className={cn('overflow-hidden rounded-3xl border bg-card shadow-sm', !a.enabled && 'opacity-70')}>
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => onOpen(a.id)}
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-2xl text-white',
            state === 'off' ? 'bg-off' : state === 'on' ? 'bg-on shadow-[0_0_14px_-3px_var(--on)]' : 'bg-muted-foreground',
          )}
          aria-label={t('addrs.openAria', { label: a.label })}
        >
          {state === 'off' ? (
            <ZapOff className="size-6" aria-hidden="true" />
          ) : (
            <Zap className="size-6" fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{a.label}</p>
          <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {[a.city, a.street !== '—' ? a.street : null, a.houseNum !== '—' ? a.houseNum : null].filter(Boolean).join(', ')}
          </p>
          <p className="text-sm font-medium text-on">{queueLabel(lang, a.queue)}</p>
        </div>
        <Switch
          checked={a.enabled}
          onCheckedChange={(v) => {
            haptic('light')
            updateAddress(a.id, { enabled: v })
          }}
          label={t('addrs.notifyFor', { label: a.label })}
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between border-t px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50"
      >
        {t('addrs.notifySettings')}
        <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="space-y-4 border-t bg-muted/30 p-4">
          <LeadSelect
            label={t('addrs.beforeOff')}
            value={a.notifyBeforeOffMin}
            onChange={(v) => updateAddress(a.id, { notifyBeforeOffMin: v })}
          />
          <LeadSelect
            label={t('addrs.beforeOn')}
            value={a.notifyBeforeOnMin}
            onChange={(v) => updateAddress(a.id, { notifyBeforeOnMin: v })}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{t('addrs.scheduleChange')}</span>
            <Switch
              checked={a.notifyScheduleChange}
              onCheckedChange={(v) => updateAddress(a.id, { notifyScheduleChange: v })}
              label={t('addrs.scheduleChange')}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{t('addrs.emergency')}</span>
            <Switch
              checked={a.notifyEmergency}
              onCheckedChange={(v) => updateAddress(a.id, { notifyEmergency: v })}
              label={t('addrs.emergency')}
            />
          </div>
          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => deleteAddress(a.id)}
                className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-white"
              >
                {t('addrs.confirmDelete')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
              >
                {t('addrs.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/40 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t('addrs.delete')}
            </button>
          )}
        </div>
      )}
    </li>
  )
}

function LeadSelect({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const { t } = useT()
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {LEAD_OPTIONS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={value === m}
            onClick={() => onChange(m)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm tabular-nums transition-colors',
              value === m ? 'border-on bg-on text-on-foreground' : 'bg-card hover:bg-muted',
            )}
          >
            {m === 0 ? t('addrs.leadOff') : `${m} ${t('unit.m')}`}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
