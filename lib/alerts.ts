import type { AlertEvent, Subscriber } from './api'

export const ALERT_TTL_MS = 2 * 86_400_000

/**
 * Показываем только события, связанные с адресами пользователя, и не старше 2 суток.
 * (То же правило применяет сервер; здесь оно подстраховывает старую версию сервера.)
 */
export function filterAlerts(alerts: AlertEvent[], sub: Subscriber | undefined, now = Date.now()): AlertEvent[] {
  if (!sub) return []
  const ids = new Set(sub.addresses.map((a) => a.id))
  const queues = new Set(sub.addresses.map((a) => a.queue))
  return alerts.filter((a) => {
    const created = Date.parse(a.createdAt)
    if (Number.isFinite(created) && now - created > ALERT_TTL_MS) return false
    if (a.type === 'channel_broadcast') return false
    if (a.subscriberId) return a.subscriberId === sub.id
    if (a.addressId) return ids.has(a.addressId)
    return Boolean(a.queue && a.queue !== 'ALL' && queues.has(a.queue))
  })
}
