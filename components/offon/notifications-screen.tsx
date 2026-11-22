'use client'

import { useState } from 'react'
import { BellRing, LoaderCircle, Send } from 'lucide-react'
import type { Bootstrap } from '@/lib/api'
import { getTelegram, haptic } from '@/lib/api'
import { useActions, useT, useVisibleAlerts } from '@/hooks/use-app-data'
import { AlertItem } from './alert-item'

export function NotificationsScreen({ data }: { data: Bootstrap }) {
  const { testAlert } = useActions()
  const { t } = useT()
  const alerts = useVisibleAlerts()
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const linked = Boolean(data.subscriber.telegramChatId)
  const bot = data.botStatus?.botUsername

  const onTest = async () => {
    setSending(true)
    setResult(null)
    try {
      const res = await testAlert()
      haptic('medium')
      setResult(res.deliveredTelegram ? t('alerts.testSent') : t('alerts.testNotDelivered'))
    } catch (e) {
      setResult(e instanceof Error ? e.message : t('err.generic'))
    } finally {
      setSending(false)
    }
  }

  const openBot = () => {
    if (!bot) return
    const url = `https://t.me/${bot}?start=app`
    const tg = getTelegram()
    if (tg?.openTelegramLink) tg.openTelegramLink(url)
    else window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">{t('alerts.title')}</h1>

      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-on/15 text-on">
            <BellRing className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-medium">{linked ? t('alerts.linked') : t('alerts.notLinked')}</p>
            <p className="text-sm text-muted-foreground">
              {linked ? t('alerts.linkedDesc') : t('alerts.notLinkedDesc')}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onTest}
            disabled={sending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-on py-2.5 font-medium text-on-foreground disabled:opacity-60"
          >
            {sending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
            {t('alerts.test')}
          </button>
          {!linked && bot && (
            <button type="button" onClick={openBot} className="flex-1 rounded-full border py-2.5 font-medium">
              {t('alerts.openBot')}
            </button>
          )}
        </div>
        {result && (
          <p role="status" className="mt-2 text-sm text-muted-foreground">
            {result}
          </p>
        )}
      </section>

      <section aria-labelledby="events-title">
        <h2 id="events-title" className="mb-2 text-sm text-muted-foreground">
          {t('alerts.recent', { n: alerts.length })}
        </h2>
        {alerts.length ? (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <AlertItem key={a.id} alert={a} />
            ))}
          </ul>
        ) : (
          <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">{t('alerts.none')}</p>
        )}
      </section>
    </div>
  )
}
