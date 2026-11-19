import { LOCALE, translate, type Lang } from './i18n'

export type SlotValue = 'yes' | 'no' | 'first' | 'second' | 'maybe' | 'mfirst' | 'msecond' | string
export type DayGroups = Record<string, Record<string, SlotValue>>

export interface Snapshot {
  today: number
  update?: string
  fetchedAt?: string
  source?: string
  groups: string[]
  groupNames: Record<string, string>
  days: Record<string, DayGroups>
  historyDays?: Record<string, DayGroups>
}

export type HalfState = 'on' | 'off' | 'maybe' | 'unknown'
export type HourKind = 'on' | 'off' | 'off-first' | 'off-second' | 'maybe' | 'unknown'

export const KYIV_TZ = 'Europe/Kyiv'

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: KYIV_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: KYIV_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function kyivDate(ms: number) {
  return dateFmt.format(new Date(ms))
}

export function kyivClock(now: Date) {
  const [h, m] = timeFmt.format(now).split(':').map(Number)
  return { hour: h, minute: m, minutesOfDay: h * 60 + m, label: timeFmt.format(now) }
}

export function findDayKeys(snap: Snapshot, now: Date) {
  const keys = Object.keys(snap.days ?? {})
  const todayDate = kyivDate(now.getTime())
  const todayKey = keys.find((k) => kyivDate(Number(k) * 1000) === todayDate) ?? String(snap.today)
  const tomorrowDate = kyivDate(Number(todayKey) * 1000 + 36 * 3600 * 1000)
  const tomorrowKey = keys.find((k) => kyivDate(Number(k) * 1000) === tomorrowDate) ?? null
  return { todayKey, tomorrowKey }
}

export function hourKind(value: SlotValue | undefined): HourKind {
  switch (value) {
    case 'yes':
      return 'on'
    case 'no':
      return 'off'
    case 'first':
      return 'off-first'
    case 'second':
      return 'off-second'
    case 'maybe':
    case 'mfirst':
    case 'msecond':
      return 'maybe'
    default:
      return 'unknown'
  }
}

export function halfSlots(hours: Record<string, SlotValue> | undefined): HalfState[] {
  const out: HalfState[] = []
  for (let h = 1; h <= 24; h++) {
    const v = hours?.[String(h)]
    switch (v) {
      case 'yes':
        out.push('on', 'on')
        break
      case 'no':
        out.push('off', 'off')
        break
      case 'first':
        out.push('off', 'on')
        break
      case 'second':
        out.push('on', 'off')
        break
      case 'maybe':
        out.push('maybe', 'maybe')
        break
      case 'mfirst':
        out.push('maybe', 'on')
        break
      case 'msecond':
        out.push('on', 'maybe')
        break
      default:
        out.push('unknown', 'unknown')
    }
  }
  return out
}

const isOff = (s: HalfState) => s === 'off'

export interface NowStatus {
  state: 'on' | 'off' | 'unknown'
  maybe: boolean
  nextChangeMin: number | null
  nextChangeLabel: string | null
  progress: number
}

export function analyzeNow(today: HalfState[], tomorrow: HalfState[], minutesOfDay: number): NowStatus {
  const idx = Math.min(47, Math.floor(minutesOfDay / 30))
  const current = today[idx]
  if (current === 'unknown') {
    return { state: 'unknown', maybe: false, nextChangeMin: null, nextChangeLabel: null, progress: 0 }
  }
  const all = [...today, ...tomorrow]
  const curOff = isOff(current)
  let next = -1
  for (let i = idx + 1; i < all.length; i++) {
    if (all[i] === 'unknown') break
    if (isOff(all[i]) !== curOff) {
      next = i
      break
    }
  }
  let start = idx
  while (start > 0 && isOff(today[start - 1]) === curOff && today[start - 1] !== 'unknown') start--

  const nextChangeMin = next === -1 ? null : next * 30 - minutesOfDay
  const total = next === -1 ? null : (next - start) * 30
  const progress = total ? Math.min(1, Math.max(0, (minutesOfDay - start * 30) / total)) : curOff ? 0 : 1

  return {
    state: curOff ? 'off' : 'on',
    maybe: current === 'maybe',
    nextChangeMin,
    nextChangeLabel: next === -1 ? null : slotLabel(next % 48),
    progress,
  }
}

export function slotLabel(halfIndex: number) {
  const m = halfIndex * 30
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function dayTotals(slots: HalfState[]) {
  const known = slots.filter((s) => s !== 'unknown').length
  if (!known) return null
  const off = slots.filter(isOff).length / 2
  return { offHours: off, onHours: known / 2 - off }
}

export function offIntervals(slots: HalfState[]) {
  const out: string[] = []
  let start = -1
  for (let i = 0; i <= slots.length; i++) {
    const off = i < slots.length && isOff(slots[i])
    if (off && start === -1) start = i
    if (!off && start !== -1) {
      out.push(`${slotLabel(start)}–${i === 48 ? '24:00' : slotLabel(i)}`)
      start = -1
    }
  }
  return out
}

export function formatDuration(totalMin: number, lang: Lang = 'uk') {
  const min = Math.max(0, Math.round(totalMin))
  const h = Math.floor(min / 60)
  const m = min % 60
  const hu = translate(lang, 'unit.h')
  const mu = translate(lang, 'unit.m')
  if (h && m) return `${h} ${hu} ${m} ${mu}`
  if (h) return `${h} ${hu}`
  return `${m} ${mu}`
}

export function formatHours(h: number) {
  return Number.isInteger(h) ? `${h}` : h.toFixed(1)
}

const weekdayFmts: Partial<Record<Lang, Intl.DateTimeFormat>> = {}
const dayMonthFmts: Partial<Record<Lang, Intl.DateTimeFormat>> = {}

export function dayTitle(key: string, lang: Lang = 'uk') {
  const wdFmt = (weekdayFmts[lang] ??= new Intl.DateTimeFormat(LOCALE[lang], { timeZone: KYIV_TZ, weekday: 'long' }))
  const dmFmt = (dayMonthFmts[lang] ??= new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: KYIV_TZ,
    day: '2-digit',
    month: '2-digit',
  }))
  const d = new Date(Number(key) * 1000)
  const wd = wdFmt.format(d)
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)}, ${dmFmt.format(d)}`
}
