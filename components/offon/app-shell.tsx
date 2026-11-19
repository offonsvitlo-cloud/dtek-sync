'use client'

import { useCallback, useEffect, useState } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import { ApiError, getTelegram, haptic } from '@/lib/api'
import { useBootstrap, useNow, useT } from '@/hooks/use-app-data'
import { AddAddressSheet } from './add-address-sheet'
import { AddressesScreen } from './addresses-screen'
import { AppHeader } from './app-header'
import { BottomNav, type Tab } from './bottom-nav'
import { HomeScreen } from './home-screen'
import { NotificationsScreen } from './notifications-screen'
import { SettingsScreen } from './settings-screen'

const THEME_KEY = 'offonsvitlo_theme'
const AD_KEY = 'offonsvitlo_last_ad'

export function AppShell() {
  const { data, error, isLoading, mutate } = useBootstrap()
  const now = useNow()
  const { t, lang } = useT()
  const [tab, setTab] = useState<Tab>('home')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    const tg = getTelegram()
    tg?.ready?.()
    tg?.expand?.()
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('meta.title')
  }, [lang, t])

  useEffect(() => {
    const tg = getTelegram()
    const color = dark ? '#0b120e' : '#eef1ee'
    try {
      tg?.setHeaderColor?.(color)
      tg?.setBackgroundColor?.(color)
    } catch {}
  }, [dark])

  useEffect(() => {
    if (!data || data.demo || data.subscriber.adsDisabled || !getTelegram()?.initData) return
    const last = Number(localStorage.getItem(AD_KEY) ?? 0)
    if (Date.now() - last < 5 * 60 * 1000) return
    const show = (window as unknown as Record<string, unknown>).show_12267169 as undefined | (() => Promise<void>)
    if (typeof show !== 'function') return
    localStorage.setItem(AD_KEY, String(Date.now()))
    show().catch(() => {})
  }, [data])

  const toggleDark = useCallback((v: boolean) => {
    haptic('light')
    setDark(v)
    document.documentElement.classList.toggle('dark', v)
    localStorage.setItem(THEME_KEY, v ? 'dark' : 'light')
  }, [])

  const changeTab = (t: Tab) => {
    haptic('light')
    setTab(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <AppHeader demo={data?.demo} />
      <main className="px-4 pt-1 pb-28">
        {isLoading && !data ? (
          <div className="grid min-h-[60dvh] place-items-center text-muted-foreground" role="status">
            <span className="flex items-center gap-2">
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              {t('app.loading')}
            </span>
          </div>
        ) : error || !data ? (
          <div className="mt-10 rounded-3xl border bg-card p-6 text-center" role="alert">
            <p className="font-display text-xl font-bold">{t('app.errorTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{error instanceof ApiError && error.code === 'NOT_JSON' ? t('err.server') : (error?.message ?? t('app.errorRetryHint'))}</p>
            <button
              type="button"
              onClick={() => mutate()}
              className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-on px-5 py-2.5 font-medium text-on-foreground"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('app.retry')}
            </button>
          </div>
        ) : (
          <>
            {tab === 'home' && (
              <HomeScreen
                data={data}
                now={now}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAddAddress={() => setAddOpen(true)}
                dark={dark}
                onToggleDark={toggleDark}
              />
            )}
            {tab === 'addresses' && (
              <AddressesScreen
                data={data}
                now={now}
                onAdd={() => setAddOpen(true)}
                onOpen={(id) => {
                  setSelectedId(id)
                  changeTab('home')
                }}
              />
            )}
            {tab === 'alerts' && <NotificationsScreen data={data} />}
            {tab === 'settings' && <SettingsScreen data={data} dark={dark} onToggleDark={toggleDark} />}

            <AddAddressSheet
              open={addOpen}
              onClose={() => setAddOpen(false)}
              snapshot={data.snapshot}
              onAdded={(id) => {
                setSelectedId(id)
                setTab('home')
              }}
            />
          </>
        )}
      </main>
      <BottomNav tab={tab} onChange={changeTab} badge={tab === 'alerts' ? 0 : Math.min(data?.alerts.length ?? 0, 9)} />
    </div>
  )
}
