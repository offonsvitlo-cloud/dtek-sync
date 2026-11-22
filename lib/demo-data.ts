import type { Bootstrap } from './api'
import type { DayGroups, SlotValue, Snapshot } from './schedule'
import { kyivDate } from './schedule'

const GROUPS = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2'].map((q) => `GPV${q}`)

export const DEMO_CITIES = ['м. Дніпро', "м. Кам'янське", 'м. Павлоград', 'м. Новомосковськ', 'м. Нікополь']
export const DEMO_STREETS = ['вул. Шевченка', 'просп. Яворницького', 'вул. Робоча', 'вул. Титова', 'вул. Калинова']

function kyivMidnightKey(dayOffset: number) {
  const target = kyivDate(Date.now() + dayOffset * 86400000)
  let ts = Math.floor(Date.now() / 1000) + dayOffset * 86400
  ts -= ts % 3600
  while (kyivDate(ts * 1000) === target) ts -= 3600
  return String(ts + 3600)
}

function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function dayFor(dayIdx: number): DayGroups {
  const out: DayGroups = {}
  GROUPS.forEach((g, gi) => {
    const hours: Record<string, SlotValue> = {}
    for (let h = 1; h <= 24; h++) hours[String(h)] = 'yes'
    if (seeded(dayIdx * 31 + gi) > 0.15) {
      const blocks = 1 + Math.floor(seeded(dayIdx * 7 + gi * 3) * 2.5)
      for (let b = 0; b < blocks; b++) {
        const start = 1 + Math.floor(seeded(dayIdx * 13 + gi * 5 + b * 17) * 20)
        const len = 2 + Math.floor(seeded(dayIdx * 3 + gi + b * 11) * 3)
        for (let h = start; h < start + len && h <= 24; h++) hours[String(h)] = 'no'
        if (start > 1) hours[String(start - 1)] = 'second'
        if (start + len <= 24 && seeded(gi + b + dayIdx) > 0.5) hours[String(start + len)] = 'first'
      }
    }
    out[g] = hours
  })
  return out
}

export function buildDemoBootstrap(): Bootstrap {
  const days: Snapshot['days'] = {}
  const historyDays: NonNullable<Snapshot['historyDays']> = {}
  for (let i = -5; i <= 1; i++) {
    const key = kyivMidnightKey(i)
    const day = dayFor(i + Number(key.slice(-4)))
    if (i >= 0) days[key] = day
    historyDays[key] = day
  }
  const todayKey = kyivMidnightKey(0)
  const groupNames = Object.fromEntries(GROUPS.map((g) => [g, `Черга ${g.slice(3)}`]))
  const now = new Date()
  const update = `${now.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kyiv' })} ${now.toLocaleTimeString('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit' })}`

  const addr = (id: string, label: string, queue: string, street: string, houseNum: string) => ({
    id,
    label,
    city: 'м. Дніпро',
    street,
    houseNum,
    queue,
    queueDisplay: groupNames[queue],
    enabled: true,
    notifyBeforeOffMin: 15,
    notifyBeforeOnMin: 15,
    notifyScheduleChange: true,
    notifyEmergency: true,
  })

  return {
    demo: true,
    subscriber: {
      id: 'web:demo',
      telegramChatId: null,
      quietHoursEnabled: false,
      quietStart: '23:00',
      quietEnd: '07:00',
      language: 'uk',
      addresses: [
        addr('demo_home', 'Дім', 'GPV6.2', 'вул. Калинова', '12'),
        addr('demo_ternivskyi', 'Тернівський район', 'GPV3.1', 'вул. Шевченка', '4'),
      ],
      extraAddressSlots: 0,
      rewardSlotExpiresAt: null,
      rewardUsed: false,
      adsDisabled: true,
    },
    snapshot: { today: Number(todayKey), update, groups: GROUPS, groupNames, days, historyDays },
    alerts: [
      {
        id: 'demo_evt_1',
        type: 'power_on',
        addressId: 'demo_home',
        queue: 'GPV6.2',
        addressLabel: 'Дім',
        title: 'Світло повернулося · Дім',
        message: 'Черга 6.2 · за графіком',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        deliveredTelegram: true,
      },
      {
        id: 'demo_evt_2',
        type: 'power_off_soon',
        addressId: 'demo_ternivskyi',
        queue: 'GPV3.1',
        addressLabel: 'Тернівський район',
        title: 'Відключення через 15 хв · Тернівський район',
        message: 'Черга 3.1',
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        deliveredTelegram: true,
      },
      {
        id: 'demo_evt_3',
        type: 'schedule_change',
        addressId: 'demo_home',
        queue: 'GPV6.2',
        addressLabel: 'Дім',
        title: 'Змінено графік ДТЕК',
        message: '14:00–16:00: світло є → відключення',
        createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
        deliveredTelegram: true,
      },
    ],
    botStatus: { botUsername: null },
    monetization: { freeAddressLimit: 2, extraSlotStars: 50 },
  }
}
