import { clientPref, resolveLang, translate } from './i18n'
import type { Snapshot } from './schedule'

export interface Address {
  id: string
  label: string
  city: string
  street: string
  houseNum: string
  queue: string
  queueDisplay: string
  enabled: boolean
  notifyBeforeOffMin: number
  notifyBeforeOnMin: number
  notifyScheduleChange: boolean
  notifyEmergency: boolean
  emergencyInfo?: { type?: string; start?: string; end?: string } | null
  createdAt?: string
}

export interface Subscriber {
  id: string
  telegramChatId: string | null
  firstName?: string | null
  quietHoursEnabled: boolean
  quietStart: string
  quietEnd: string
  language: 'ru' | 'uk' | string
  addresses: Address[]
  extraAddressSlots: number
  adsDisabled: boolean
  proActive?: boolean
  rewardSlotExpiresAt?: string | null
  rewardUsed?: boolean
}

export const TRIAL_DAYS = 3

export function isTrialActive(s: Subscriber, now = Date.now()) {
  return Boolean(s.rewardSlotExpiresAt) && new Date(s.rewardSlotExpiresAt as string).getTime() > now
}

export function maxAddresses(d: Pick<Bootstrap, 'subscriber' | 'monetization'>) {
  return (
    (d.monetization?.freeAddressLimit ?? 2) + (d.subscriber.extraAddressSlots ?? 0) + (isTrialActive(d.subscriber) ? 1 : 0)
  )
}

export async function showRewardedAd() {
  const show = (window as unknown as Record<string, unknown>).show_12267169 as undefined | (() => Promise<void>)
  if (typeof show !== 'function') return false
  try {
    await show()
    return true
  } catch {
    return false
  }
}

export interface AlertEvent {
  id: string
  type: string
  queue?: string
  addressId?: string | null
  addressLabel?: string
  title: string
  message: string
  createdAt: string
  deliveredTelegram?: boolean
  deliveredChannel?: boolean
}

export interface Bootstrap {
  subscriber: Subscriber
  snapshot: Snapshot
  alerts: AlertEvent[]
  botStatus: { botUsername: string | null; lastError?: string | null }
  monetization: { freeAddressLimit: number; extraSlotStars: number }
  demo?: boolean
}

export interface ExtrasStatus {
  pro: { active: boolean; until: string | null; price: number; addresses: number; periodDays: number }
  donate: { amounts: number[]; total: number }
  referral: { link: string; count: number; bonusUntil: string | null; bonusDays: number; maxDays?: number }
  isTelegram: boolean
  maxAddresses: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''
const CLIENT_ID_KEY = 'dtek_monitor_client_id'

interface TelegramWebApp {
  initData?: string
  colorScheme?: 'light' | 'dark'
  ready?: () => void
  expand?: () => void
  openInvoice?: (url: string, cb?: (status: string) => void) => void
  openTelegramLink?: (url: string) => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  HapticFeedback?: { impactOccurred: (s: string) => void; notificationOccurred: (s: string) => void }
}

export function getTelegram(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp
  return tg ?? null
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    getTelegram()?.HapticFeedback?.impactOccurred(style)
  } catch {}
}

function clientId() {
  let id = window.localStorage.getItem(CLIENT_ID_KEY)
  if (!id) {
    id = `web:${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(CLIENT_ID_KEY, id)
  }
  return id
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'x-subscriber-id': clientId() }
  const init = getTelegram()?.initData
  if (init) h['x-telegram-init-data'] = init
  return h
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...authHeaders(), ...init?.headers },
  })
  const type = res.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) {
    throw new ApiError(translate(resolveLang(clientPref(), null), 'err.server'), res.status, 'NOT_JSON')
  }
  const data = await res.json()
  if (!res.ok) throw new ApiError(data?.error ?? res.statusText, res.status, data?.code)
  return data as T
}

export const json = (body: unknown) => JSON.stringify(body)
