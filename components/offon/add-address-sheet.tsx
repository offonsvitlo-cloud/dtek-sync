'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Check, LoaderCircle, Search, Star, X } from 'lucide-react'
import { api, ApiError, getTelegram, haptic, isTrialActive } from '@/lib/api'
import { DEMO_CITIES, DEMO_STREETS } from '@/lib/demo-data'
import type { Snapshot } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { TrialCard } from './perks'
import { useActions, useBootstrap, useT } from '@/hooks/use-app-data'

interface AddAddressSheetProps {
  open: boolean
  onClose: () => void
  snapshot: Snapshot
  onAdded: (id: string) => void
}

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

type HouseInfo = { queue?: string } & Record<string, unknown>

export function AddAddressSheet({ open, onClose, snapshot, onAdded }: AddAddressSheetProps) {
  const { addAddress, demo } = useActions()
  const { t, lang } = useT()
  const { data: boot } = useBootstrap()
  const sub = boot?.subscriber
  const [label, setLabel] = useState('')
  const [cityQ, setCityQ] = useState('')
  const [city, setCity] = useState('')
  const [streetQ, setStreetQ] = useState('')
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [queue, setQueue] = useState('')
  const [queueAuto, setQueueAuto] = useState(false)
  const [houseQ, setHouseQ] = useState('')
  const queueRef = useRef<HTMLFieldSetElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [saving, setSaving] = useState(false)

  const dCity = useDebounced(cityQ)
  const dStreet = useDebounced(streetQ)

  const cities = useSWR(open && !city ? ['cities', dCity, demo] : null, async () =>
    demo
      ? DEMO_CITIES.filter((c) => c.toLowerCase().includes(dCity.toLowerCase()))
      : (await api<{ cities: string[] }>(`/api/dtek/cities?q=${encodeURIComponent(dCity)}`)).cities,
  )
  const streets = useSWR(open && city && !street ? ['streets', city, dStreet, demo] : null, async () =>
    demo
      ? DEMO_STREETS.filter((s) => s.toLowerCase().includes(dStreet.toLowerCase()))
      : (
          await api<{ streets: string[] }>(
            `/api/dtek/streets?city=${encodeURIComponent(city)}&q=${encodeURIComponent(dStreet)}`,
          )
        ).streets,
  )
  const houses = useSWR(open && city && street && !demo ? ['houses', city, street] : null, async () => {
    try {
      return await api<{ houses: Record<string, HouseInfo>; error?: string }>(
        `/api/dtek/houses?city=${encodeURIComponent(city)}&street=${encodeURIComponent(street)}`,
      )
    } catch (e) {
      return { houses: {}, error: e instanceof Error ? e.message : t('err.generic') }
    }
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) return
    setCity('')
    setCityQ('')
    setStreet('')
    setStreetQ('')
    setHouse('')
    setHouseQ('')
    setQueue('')
    setQueueAuto(false)
    setError(null)
    setLimitReached(false)
  }, [open])

  useEffect(() => {
    if (queueAuto) queueRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [queueAuto, queue])

  useEffect(() => {
    if (limitReached && sub && isTrialActive(sub)) {
      setLimitReached(false)
      setError(null)
    }
  }, [limitReached, sub])

  if (!open) return null

  const houseEntries = Object.entries(houses.data?.houses ?? {})
  const groups = snapshot.groups?.length ? snapshot.groups : Object.keys(snapshot.groupNames)
  const hq = houseQ.trim().toLowerCase()
  const shownHouses = hq ? houseEntries.filter(([num]) => num.toLowerCase().includes(hq)) : houseEntries
  const pickedHouse = house ? houses.data?.houses?.[house] : undefined
  const noQueueForHouse = Boolean(pickedHouse && !(pickedHouse.queue && groups.includes(pickedHouse.queue)))

  const submit = async () => {
    if (!city || !queue) {
      setError(t('sheet.needCityQueue'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const addr = await addAddress({
        label: label.trim() || t('sheet.defaultName'),
        city,
        street: street || '—',
        houseNum: house || '—',
        queue,
        queueDisplay: snapshot.groupNames[queue] ?? queue,
      })
      haptic('medium')
      onAdded(addr.id)
      onClose()
    } catch (e) {
      if (e instanceof ApiError && e.code === 'LIMIT_REACHED') {
        setLimitReached(true)
        setError(t('sheet.limit'))
      } else {
        setError(e instanceof Error ? e.message : t('sheet.saveFail'))
      }
    } finally {
      setSaving(false)
    }
  }

  const buySlot = async () => {
    try {
      const res = await api<{ invoiceUrl?: string; invoice_url?: string; url?: string }>(
        '/api/billing/create-slot-invoice',
        { method: 'POST' },
      )
      const url = res.invoiceUrl ?? res.invoice_url ?? res.url
      if (!url) return
      const tg = getTelegram()
      if (tg?.openInvoice) tg.openInvoice(url, () => setLimitReached(false))
      else window.open(url, '_blank', 'noopener')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('sheet.invoiceFail'))
    }
  }

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
        aria-labelledby="add-address-title"
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t bg-card p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 id="add-address-title" className="font-display text-2xl font-bold">
            {t('sheet.title')}
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

        <div className="mt-4 space-y-4">
          <Field label={t('sheet.name')} htmlFor="addr-label">
            <input
              id="addr-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t('sheet.defaultName')}
              maxLength={40}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-on focus:ring-2 focus:ring-on/30"
            />
          </Field>

          <Field label={t('sheet.city')} htmlFor="addr-city">
            {city ? (
              <Chosen
                value={city}
                onClear={() => {
                  setCity('')
                  setStreet('')
                  setHouse('')
                  setHouseQ('')
                  setQueue('')
                  setQueueAuto(false)
                }}
              />
            ) : (
              <Combo
                id="addr-city"
                value={cityQ}
                onChange={setCityQ}
                placeholder={t('sheet.cityPh')}
                options={cities.data ?? []}
                loading={cities.isLoading}
                onPick={(c) => setCity(c)}
              />
            )}
          </Field>

          {city && (
            <Field label={t('sheet.street')} htmlFor="addr-street">
              {street ? (
                <Chosen
                  value={street}
                  onClear={() => {
                    setStreet('')
                    setHouse('')
                    setHouseQ('')
                    if (queueAuto) {
                      setQueue('')
                      setQueueAuto(false)
                    }
                  }}
                />
              ) : (
                <Combo
                  id="addr-street"
                  value={streetQ}
                  onChange={setStreetQ}
                  placeholder={t('sheet.streetPh')}
                  options={streets.data ?? []}
                  loading={streets.isLoading}
                  onPick={(s) => setStreet(s)}
                />
              )}
            </Field>
          )}

          {city && street && (
            <Field label={t('sheet.house')} htmlFor="addr-house">
              {houses.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> {t('sheet.housesLoading')}
                </p>
              ) : houseEntries.length ? (
                <div className="space-y-2">
                  {houseEntries.length > 8 && (
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <input
                        id="addr-house"
                        value={houseQ}
                        onChange={(e) => setHouseQ(e.target.value)}
                        placeholder={t('sheet.houseFilter')}
                        autoComplete="off"
                        className="h-10 w-full rounded-xl border border-input bg-background pr-3 pl-9 text-sm outline-none focus:border-on focus:ring-2 focus:ring-on/30"
                      />
                    </div>
                  )}
                  <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                  {shownHouses.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('sheet.houseNone')}</p>
                  )}
                  {shownHouses.map(([num, info]) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setHouse(num)
                        if (info?.queue && groups.includes(info.queue)) {
                          setQueue(info.queue)
                          setQueueAuto(true)
                        } else if (queueAuto) {
                          setQueue('')
                          setQueueAuto(false)
                        }
                      }}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-sm',
                        house === num ? 'border-on bg-on text-on-foreground' : 'hover:bg-muted',
                      )}
                    >
                      {num}
                    </button>
                  ))}
                  </div>
                </div>
              ) : (
                <>
                  <input
                    id="addr-house"
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    placeholder={t('sheet.housePh')}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-on focus:ring-2 focus:ring-on/30"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {houses.data?.error ? t('sheet.dtekDown') : t('sheet.pickQueue')}
                  </p>
                </>
              )}
            </Field>
          )}

          <fieldset ref={queueRef}>
            <legend className="mb-1.5 text-sm font-medium">{t('sheet.queue')}</legend>
            <div className="grid grid-cols-4 gap-1.5">
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={queue === g}
                  onClick={() => {
                    setQueue(g)
                    setQueueAuto(false)
                  }}
                  className={cn(
                    'flex h-10 items-center justify-center gap-1 rounded-xl border text-sm font-medium tabular-nums transition-colors',
                    queue === g ? 'border-on bg-on text-on-foreground shadow-[0_0_12px_-3px_var(--on)]' : 'hover:bg-muted',
                  )}
                >
                  {queue === g && <Check className="size-3.5" aria-hidden="true" />}
                  {g.replace(/^GPV/, '')}
                </button>
              ))}
            </div>
            {queueAuto && queue && <p className="mt-1.5 text-xs text-on">{t('sheet.queueAuto')}</p>}
            {noQueueForHouse && !queueAuto && (
              <p className="mt-1.5 text-xs text-muted-foreground">{t('sheet.noQueueForHouse')}</p>
            )}
          </fieldset>

          {error && (
            <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
              {limitReached && (
                <button
                  type="button"
                  onClick={buySlot}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-warn py-2 font-medium text-warn-foreground"
                >
                  <Star className="size-4" fill="currentColor" aria-hidden="true" />
                  {t('sheet.buySlot', { n: boot?.monetization?.extraSlotStars ?? 50 })}
                </button>
              )}
            </div>
          )}

          {limitReached && sub && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">{t('sheet.rewardHint')}</p>
              <TrialCard subscriber={sub} now={new Date()} />
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={saving || !city || !queue}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-on text-lg font-medium text-on-foreground shadow-[0_6px_20px_-8px_var(--on)] transition-opacity disabled:opacity-50"
          >
            {saving && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
            {t('sheet.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}

function Chosen({ value, onClear }: { value: string; onClear: () => void }) {
  const { t } = useT()
  return (
    <div className="flex h-11 items-center justify-between rounded-xl border border-on/50 bg-on-soft px-3">
      <span className="flex items-center gap-2 font-medium">
        <Check className="size-4 text-on" aria-hidden="true" />
        {value}
      </span>
      <button type="button" onClick={onClear} className="text-sm text-muted-foreground underline-offset-2 hover:underline">
        {t('sheet.change')}
      </button>
    </div>
  )
}

interface ComboProps {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: string[]
  loading: boolean
  onPick: (v: string) => void
}

function Combo({ id, value, onChange, placeholder, options, loading, onPick }: ComboProps) {
  const { t } = useT()
  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-input bg-background pr-9 pl-9 outline-none focus:border-on focus:ring-2 focus:ring-on/30"
        />
        {loading && (
          <LoaderCircle className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      {options.length > 0 && (
        <ul className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border bg-background p-1" aria-label={t('sheet.options')}>
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                onClick={() => onPick(o)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
