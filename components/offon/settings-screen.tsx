'use client'

import { useRef, useState } from 'react'
import { Heart, Moon, MoonStar, Star } from 'lucide-react'
import { api, getTelegram, haptic, json, type Bootstrap } from '@/lib/api'
import { adsDebugEnabled, setAdsDebug } from '@/lib/ads'
import { addressesWord, daysWord, LANGS, LOCALE } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useActions, useExtras, useNow, useT } from '@/hooks/use-app-data'
import { ReferralCard, TrialCard } from './perks'
import { Switch } from './switch'

interface SettingsScreenProps {
  data: Bootstrap
  dark: boolean
  onToggleDark: (v: boolean) => void
}

export function SettingsScreen({ data, dark, onToggleDark }: SettingsScreenProps) {
  const { updateSettings, setLanguage, demo } = useActions()
  const { t, lang } = useT()
  const now = useNow()
  const taps = useRef({ n: 0, at: 0 })
  const tapFooter = () => {
    const now = Date.now()
    taps.current = { n: now - taps.current.at < 2500 ? taps.current.n + 1 : 1, at: now }
    if (taps.current.n >= 5) {
      taps.current.n = 0
      const on = !adsDebugEnabled()
      setAdsDebug(on)
      setMessage(t(on ? 'set.adsDebugOn' : 'set.adsDebugOff'))
    }
  }
  const extras = useExtras()
  const [message, setMessage] = useState<string | null>(null)
  const s = data.subscriber

  const openInvoice = async (path: string, body?: unknown) => {
    setMessage(null)
    if (demo) {
      setMessage(t('set.starsOnlyTg'))
      return
    }
    try {
      const res = await api<{ invoiceUrl: string }>(path, { method: 'POST', body: body ? json(body) : undefined })
      const tg = getTelegram()
      if (tg?.openInvoice) {
        tg.openInvoice(res.invoiceUrl, (status) => {
          if (status === 'paid') {
            haptic('heavy')
            setMessage(t('set.paid'))
            extras.mutate()
          }
        })
      } else window.open(res.invoiceUrl, '_blank', 'noopener')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('sheet.invoiceFail'))
    }
  }

  const pro = extras.data?.pro

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">{t('set.title')}</h1>

      <section className="divide-y rounded-3xl border bg-card shadow-sm">
        <Row icon={<Moon className="size-5" aria-hidden="true" />} title={t('set.dark')}>
          <Switch checked={dark} onCheckedChange={onToggleDark} label={t('set.dark')} />
        </Row>
        <Row
          icon={<MoonStar className="size-5" aria-hidden="true" />}
          title={t('set.quiet')}
          subtitle={t('set.quietDesc')}
        >
          <Switch
            checked={s.quietHoursEnabled}
            onCheckedChange={(v) => updateSettings({ quietHoursEnabled: v })}
            label={t('set.quiet')}
          />
        </Row>
        {s.quietHoursEnabled && (
          <div className="flex items-center gap-3 px-4 py-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-muted-foreground">
              {t('set.from')}
              <input
                type="time"
                value={s.quietStart}
                onChange={(e) => updateSettings({ quietStart: e.target.value })}
                className="h-10 rounded-xl border border-input bg-background px-3 text-foreground"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-muted-foreground">
              {t('set.to')}
              <input
                type="time"
                value={s.quietEnd}
                onChange={(e) => updateSettings({ quietEnd: e.target.value })}
                className="h-10 rounded-xl border border-input bg-background px-3 text-foreground"
              />
            </label>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm">{t('lang.ui')}</span>
          <div className="flex rounded-xl bg-muted p-0.5 text-sm" role="radiogroup" aria-label={t('lang.label')}>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lang === l}
                onClick={() => {
                  haptic('light')
                  setLanguage(l).catch(() => {})
                }}
                className={cn('rounded-lg px-3 py-1', lang === l ? 'bg-card font-medium shadow-sm' : 'text-muted-foreground')}
              >
                {t(l === 'uk' ? 'lang.uk' : 'lang.ru')}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="glow-card relative overflow-hidden rounded-3xl border bg-card p-4"
        style={{ ['--glow' as string]: 'var(--warn)' }}
      >
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-warn text-warn-foreground">
            <Star className="size-5" fill="currentColor" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-xl font-bold">{pro?.active ? t('set.proActive') : t('set.proTitle')}</p>
            <p className="text-sm text-muted-foreground">
              {pro?.active && pro.until
                ? t('set.proUntil', { d: new Date(pro.until).toLocaleDateString(LOCALE[lang]) })
                : t('set.proDesc', {
                    n: pro?.addresses ?? 5,
                    addr: addressesWord(lang, pro?.addresses ?? 5),
                    p: pro?.price ?? 100,
                    days: `${pro?.periodDays ?? 30} ${daysWord(lang, pro?.periodDays ?? 30)}`,
                  })}
            </p>
          </div>
        </div>
        {!pro?.active && (
          <button
            type="button"
            onClick={() => openInvoice('/api/billing/create-pro-invoice')}
            className="mt-3 w-full rounded-full bg-warn py-2.5 font-medium text-warn-foreground"
          >
            {t('set.proBuy')}
          </button>
        )}
      </section>

      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <p className="flex items-center gap-2 font-medium">
          <Heart className="size-4 text-destructive" fill="currentColor" aria-hidden="true" />
          {t('set.donate')}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(extras.data?.donate.amounts ?? [10, 50, 100]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => openInvoice('/api/billing/create-donate-invoice', { stars: n })}
              className="rounded-xl border py-2 font-medium tabular-nums hover:bg-muted"
            >
              {n} ⭐
            </button>
          ))}
        </div>
        {extras.data?.donate.total ? (
          <p className="mt-2 text-xs text-muted-foreground">{t('set.donated', { n: extras.data.donate.total })}</p>
        ) : null}
      </section>

      <TrialCard subscriber={data.subscriber} now={now} />
      <ReferralCard />

      {message && (
        <p role="status" className="rounded-2xl bg-muted p-3 text-center text-sm">
          {message}
        </p>
      )}

      <p className="pb-2 text-center text-xs text-muted-foreground select-none" onClick={tapFooter}>
        {t('set.footer', { v: data.snapshot.update ?? '—' })}
      </p>
    </div>
  )
}

function Row({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
