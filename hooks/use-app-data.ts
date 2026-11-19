'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import useSWR from 'swr'
import {
  api,
  ApiError,
  json,
  maxAddresses,
  showRewardedAd,
  TRIAL_DAYS,
  type Address,
  type AlertEvent,
  type Bootstrap,
  type ExtrasStatus,
  type Subscriber,
} from '@/lib/api'
import { buildDemoBootstrap } from '@/lib/demo-data'
import {
  clientPref,
  resolveLang,
  setUiLang,
  subscribeLang,
  translate,
  type Key,
  type Lang,
} from '@/lib/i18n'
import type { Snapshot } from '@/lib/schedule'

async function loadBootstrap(): Promise<Bootstrap> {
  try {
    return await api<Bootstrap>('/api/bootstrap')
  } catch (err) {
    if (err instanceof ApiError && err.code !== 'NOT_JSON' && err.status !== 404) throw err
    return buildDemoBootstrap()
  }
}

export function useBootstrap() {
  return useSWR<Bootstrap>('bootstrap', loadBootstrap, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: true,
  })
}

export function useLang(): Lang {
  const pref = useSyncExternalStore(subscribeLang, clientPref, () => '')
  const { data } = useBootstrap()
  return resolveLang(pref, data?.subscriber.language)
}

export function useT() {
  const lang = useLang()
  const t = useCallback((key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])
  return { t, lang }
}

function demoExtras(data: Bootstrap): ExtrasStatus {
  return {
    pro: { active: false, until: null, price: 100, addresses: 5, periodDays: 30 },
    donate: { amounts: [10, 50, 100], total: 0 },
    referral: {
      link: `https://t.me/${data.botStatus.botUsername ?? 'offonsvitlo_bot'}?startapp=ref_demo2026`,
      count: 0,
      bonusUntil: null,
      bonusDays: 3,
      maxDays: 30,
    },
    isTelegram: false,
    maxAddresses: maxAddresses(data),
  }
}

export function useExtras() {
  const { data } = useBootstrap()
  const demo = Boolean(data?.demo)
  return useSWR<ExtrasStatus>(data ? ['extras', demo] : null, () =>
    demo && data ? demoExtras(data) : api<ExtrasStatus>('/api/extras/status'),
  )
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export type NewAddress = Pick<Address, 'label' | 'city' | 'street' | 'houseNum' | 'queue' | 'queueDisplay'>

export function useActions() {
  const { data, mutate } = useBootstrap()
  const demo = Boolean(data?.demo)
  const lang = useLang()

  const setSubscriber = (subscriber: Subscriber) =>
    mutate((prev) => (prev ? { ...prev, subscriber } : prev), { revalidate: false })

  const patchLocal = (fn: (s: Subscriber) => Subscriber) =>
    mutate((prev) => (prev ? { ...prev, subscriber: fn(prev.subscriber) } : prev), { revalidate: false })

  const pushAlert = (evt: AlertEvent) =>
    mutate((prev) => (prev ? { ...prev, alerts: [evt, ...prev.alerts] } : prev), { revalidate: false })

  return {
    demo,
    async unlockTrial() {
      if (demo) {
        await patchLocal((s) => ({
          ...s,
          rewardSlotExpiresAt: new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString(),
          rewardUsed: true,
        }))
        return
      }
      if (!data?.subscriber.adsDisabled) await showRewardedAd()
      const res = await api<{ subscriber: Subscriber }>('/api/billing/unlock-reward-slot', { method: 'POST' })
      await setSubscriber(res.subscriber)
    },
    async addAddress(body: NewAddress) {
      if (demo) {
        if (data && data.subscriber.addresses.length >= maxAddresses(data)) {
          throw new ApiError(translate(lang, 'addrs.limitReached'), 403, 'LIMIT_REACHED')
        }
        const addr: Address = {
          ...body,
          id: `demo_${Math.random().toString(36).slice(2, 8)}`,
          enabled: true,
          notifyBeforeOffMin: 15,
          notifyBeforeOnMin: 15,
          notifyScheduleChange: true,
          notifyEmergency: true,
        }
        await patchLocal((s) => ({ ...s, addresses: [...s.addresses, addr] }))
        return addr
      }
      const res = await api<{ address: Address; subscriber: Subscriber }>('/api/subscriber/addresses', {
        method: 'POST',
        body: json(body),
      })
      await setSubscriber(res.subscriber)
      return res.address
    },
    async updateAddress(id: string, patch: Partial<Address>) {
      if (demo) {
        await patchLocal((s) => ({
          ...s,
          addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }))
        return
      }
      await patchLocal((s) => ({
        ...s,
        addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }))
      const res = await api<{ subscriber: Subscriber }>(`/api/subscriber/addresses/${id}`, {
        method: 'PATCH',
        body: json(patch),
      })
      await setSubscriber(res.subscriber)
    },
    async deleteAddress(id: string) {
      if (demo) {
        await patchLocal((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) }))
        return
      }
      const res = await api<{ subscriber: Subscriber }>(`/api/subscriber/addresses/${id}`, { method: 'DELETE' })
      await setSubscriber(res.subscriber)
    },
    async updateSettings(patch: Partial<Pick<Subscriber, 'quietHoursEnabled' | 'quietStart' | 'quietEnd' | 'language'>>) {
      await patchLocal((s) => ({ ...s, ...patch }))
      if (demo) return
      const res = await api<{ subscriber: Subscriber }>('/api/subscriber/settings', {
        method: 'PATCH',
        body: json(patch),
      })
      await setSubscriber(res.subscriber)
    },
    async setLanguage(l: Lang) {
      setUiLang(l)
      await patchLocal((s) => ({ ...s, language: l }))
      if (demo) return
      const res = await api<{ subscriber: Subscriber }>('/api/subscriber/settings', {
        method: 'PATCH',
        body: json({ language: l }),
      })
      await setSubscriber(res.subscriber)
    },
    async refreshDtek() {
      if (demo) {
        await mutate()
        return
      }
      const res = await api<{ snapshot: Snapshot }>('/api/dtek/refresh', { method: 'POST' })
      await mutate((prev) => (prev ? { ...prev, snapshot: res.snapshot } : prev), { revalidate: false })
    },
    async testAlert() {
      if (demo) {
        const evt: AlertEvent = {
          id: `demo_${Date.now()}`,
          type: 'bot_message',
          title: translate(lang, 'alerts.demoTitle'),
          message: translate(lang, 'alerts.demoMsg'),
          createdAt: new Date().toISOString(),
        }
        await pushAlert(evt)
        return { deliveredTelegram: false }
      }
      const res = await api<{ event: AlertEvent; deliveredTelegram: boolean }>('/api/alerts/test', { method: 'POST' })
      await pushAlert(res.event)
      return res
    },
  }
}
