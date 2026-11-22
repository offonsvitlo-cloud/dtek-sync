'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, FlaskConical, Gift, LoaderCircle, Send, Users } from 'lucide-react'
import { api, ApiError, getTelegram, haptic, isTrialActive, json, REWARD_ADS_GOAL, REWARD_DAYS, type Subscriber } from '@/lib/api'
import { daysWord, LOCALE, translate, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useActions, useExtras, useT } from '@/hooks/use-app-data'

function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(LOCALE[lang], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function timeLeft(iso: string, now: Date, lang: Lang) {
  const ms = Math.max(0, new Date(iso).getTime() - now.getTime())
  const days = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms % 86_400_000) / 3_600_000)
  const d = translate(lang, 'unit.d')
  const h = translate(lang, 'unit.h')
  const m = translate(lang, 'unit.m')
  if (days > 0) return `${days} ${d} ${hours} ${h}`
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours} ${h} ${minutes} ${m}`
}

export function TrialCard({ subscriber, now, className }: { subscriber: Subscriber; now: Date; className?: string }) {
  const { watchRewardAd } = useActions()
  const { t, lang } = useT()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (subscriber.proActive || subscriber.adsDisabled) return null
  const goal = subscriber.rewardAdsGoal ?? REWARD_ADS_GOAL
  const days = Math.max(1, Math.round((subscriber.rewardHours ?? REWARD_DAYS * 24) / 24))
  const count = Math.min(subscriber.rewardAdCount ?? 0, goal)
  const active = isTrialActive(subscriber, now.getTime())

  const watch = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await watchRewardAd()
      haptic('medium')
      if (res.granted) setMessage(t('reward.granted', { n: days, days: daysWord(lang, days) }))
    } catch (e) {
      if (e instanceof ApiError && e.code === 'TOO_FAST') setError(t('reward.tooFast'))
      else setError(e instanceof Error ? e.message : t('reward.adFail'))
    } finally {
      setBusy(false)
    }
  }

  const progress = (
    <div className="mt-3">
      <p className="text-sm tabular-nums">{t('reward.progress', { n: count, goal })}</p>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={count}
      >
        <div className="h-full rounded-full bg-on transition-all" style={{ width: `${(count / goal) * 100}%` }} />
      </div>
      <button
        type="button"
        onClick={watch}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-on py-2.5 font-medium text-on-foreground shadow-[0_6px_20px_-8px_var(--on)] disabled:opacity-60"
      >
        {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {active ? t('reward.extend', { n: days, days: daysWord(lang, days) }) : t('reward.watch')}
      </button>
      {message && <p role="status" className="mt-2 text-center text-sm text-on">{message}</p>}
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )

  if (active && subscriber.rewardSlotExpiresAt) {
    const total = days * 86_400_000
    const left = Math.max(0, new Date(subscriber.rewardSlotExpiresAt).getTime() - now.getTime())
    return (
      <section className={cn('rounded-3xl border border-on/40 bg-on-soft p-4', className)} aria-label={t('perk.trialAria')}>
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-on text-on-foreground shadow-[0_0_14px_-3px_var(--on)]">
            <FlaskConical className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold">{t('perk.trialActive')}</p>
            <p className="text-sm text-muted-foreground">
              {t('perk.trialUntil', { d: formatDate(subscriber.rewardSlotExpiresAt, lang) })}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-medium tabular-nums text-on">
            {timeLeft(subscriber.rewardSlotExpiresAt, now, lang)}
          </span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-card"
          role="progressbar"
          aria-label={t('perk.trialLeft')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.round((left / total) * 100))}
        >
          <div className="h-full rounded-full bg-on" style={{ width: `${Math.min(100, (left / total) * 100)}%` }} />
        </div>
        {progress}
      </section>
    )
  }

  return (
    <section
      className={cn('glow-card relative overflow-hidden rounded-3xl border bg-card p-4', className)}
      style={{ ['--glow' as string]: 'var(--on)' }}
      aria-label={t('perk.trialAria')}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-on-soft text-on">
          <FlaskConical className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">{t('reward.title')}</p>
          <p className="text-sm text-muted-foreground">
            {t('reward.desc', { goal, n: days, days: daysWord(lang, days) })}
          </p>
        </div>
      </div>
      {progress}
    </section>
  )
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export function ReferralCard({ className }: { className?: string }) {
  const extras = useExtras()
  const { t, lang } = useT()
  const [toast, setToast] = useState<string | null>(null)
  const ref = extras.data?.referral

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const copy = async () => {
    if (!ref?.link) return
    const ok = await copyToClipboard(ref.link)
    haptic('light')
    flash(ok ? t('perk.copied') : t('perk.copyFail'))
  }

  // Сообщение «картинка + текст + кнопка» готовится на сервере заранее (Bot API 8.0, shareMessage)
  const prepared = useRef<{ id: string; exp: number } | null>(null)
  const canShareMessage = () => {
    const tg = getTelegram()
    return Boolean(tg?.initData && tg.shareMessage && tg.isVersionAtLeast?.('8.0'))
  }
  const prepare = async () => {
    if (!canShareMessage()) return null
    const cur = prepared.current
    if (cur && cur.exp * 1000 > Date.now() + 60_000) return cur.id
    try {
      const res = await api<{ id?: string | null; expiresAt?: number }>('/api/share/prepare', {
        method: 'POST',
        body: json({ lang }),
      })
      if (res.id) {
        prepared.current = { id: res.id, exp: res.expiresAt ?? Math.floor(Date.now() / 1000) + 600 }
        return res.id
      }
    } catch {}
    return null
  }

  useEffect(() => {
    if (ref?.link) prepare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.link, lang])

  const fallbackShare = () => {
    const text = t('perk.shareText')
    const url = `https://t.me/share/url?url=${encodeURIComponent(ref?.link ?? '')}&text=${encodeURIComponent(text)}`
    const tg = getTelegram()
    try {
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(url)
        return
      }
    } catch {}
    const nav = navigator as Navigator & { share?: (d: { url?: string; text?: string }) => Promise<void> }
    if (typeof nav.share === 'function') {
      nav.share({ url: ref?.link, text }).catch(() => {})
      return
    }
    const win = window.open(url, '_blank', 'noopener')
    if (!win && ref?.link) copyToClipboard(ref.link).then((ok) => flash(ok ? t('perk.sharedHint') : t('perk.copyFail')))
  }

  const share = async () => {
    if (!ref?.link) return
    haptic('light')
    const tg = getTelegram()
    const id = prepared.current && prepared.current.exp * 1000 > Date.now() + 60_000 ? prepared.current.id : await prepare()
    if (id && tg?.shareMessage) {
      // если Telegram отклонит отправку (не из-за отмены пользователем), открываем обычное окно «Поделиться»
      const onFail = (data?: unknown) => {
        tg.offEvent?.('shareMessageFailed', onFail)
        const err = (data as { error?: string } | undefined)?.error
        if (err !== 'USER_DECLINED') fallbackShare()
      }
      tg.onEvent?.('shareMessageFailed', onFail)
      setTimeout(() => tg.offEvent?.('shareMessageFailed', onFail), 30_000)
      try {
        tg.shareMessage(id)
        return
      } catch {
        tg.offEvent?.('shareMessageFailed', onFail)
      }
    }
    fallbackShare()
  }

  return (
    <section className={cn('rounded-3xl border bg-card p-4 shadow-sm', className)} aria-labelledby="ref-title">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-warn/15 text-warn">
          <Gift className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p id="ref-title" className="font-display text-lg font-bold">
            {t('perk.refTitle')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('perk.refDesc', {
              n: ref?.bonusDays ?? 3,
              days: daysWord(lang, ref?.bonusDays ?? 3),
              max: ref?.maxDays ?? 30,
              maxDays: daysWord(lang, ref?.maxDays ?? 30),
            })}
          </p>
        </div>
      </div>

      {extras.isLoading ? (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> {t('perk.loading')}
        </p>
      ) : ref?.link ? (
        <>
          <button
            type="button"
            onClick={copy}
            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed bg-muted/50 px-3 py-2.5 text-left text-sm"
            aria-label={t('perk.copyAria')}
          >
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{ref.link}</span>
            <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={share}
              className="flex items-center justify-center gap-1.5 rounded-full bg-on py-2.5 font-medium text-on-foreground"
            >
              <Send className="size-4" aria-hidden="true" />
              {t('perk.share')}
            </button>
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center gap-1.5 rounded-full border py-2.5 font-medium hover:bg-muted"
            >
              <Copy className="size-4" aria-hidden="true" />
              {t('perk.copy')}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
              <Users className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>
                {t('perk.invited')} <b className="tabular-nums">{ref.count}</b>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
              <Check className={cn('size-4', ref.bonusUntil ? 'text-on' : 'text-muted-foreground')} aria-hidden="true" />
              <span className="truncate">{ref.bonusUntil ? t('perk.bonusUntil', { d: formatDate(ref.bonusUntil, lang) }) : t('perk.noBonus')}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-xl bg-muted/60 p-3 text-center text-sm text-muted-foreground">
          {t('perk.onlyTg')}
        </p>
      )}

      {toast && (
        <p role="status" className="mt-2 text-center text-xs text-muted-foreground">
          {toast}
        </p>
      )}
    </section>
  )
}
