import { clientPref, resolveLang, translate } from './i18n'

const ZONE = '12304298' // Telegram Mini App (Offonsvitlo_bot): rewarded, popup, in-app interstitial
const VIGNETTE_ZONE = '12304370' // баннер Vignette
const VIGNETTE_SRC = 'https://n6wxm.com/vignette.min.js'
const FN = `show_${ZONE}`
const DEBUG_KEY = 'offonsvitlo_adsdebug'

type OpenLink = (url: string, ...rest: unknown[]) => void
interface TgLike {
  openLink?: OpenLink
  onEvent?: (event: string, cb: () => void) => void
  initData?: string
}

function tg(): TgLike | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { Telegram?: { WebApp?: TgLike } }).Telegram?.WebApp ?? null
}

function lang() {
  return resolveLang(clientPref(), null)
}

/* ---------- отладка (включается пятью нажатиями на строку «Дані: ДТЕК…» в настройках) ---------- */

export function adsDebugEnabled() {
  try {
    return window.localStorage.getItem(DEBUG_KEY) === '1'
  } catch {
    return false
  }
}

const lines: string[] = []
function log(msg: string) {
  if (!adsDebugEnabled()) return
  try {
    let box = document.getElementById('__adDbg')
    if (!box) {
      box = document.createElement('div')
      box.id = '__adDbg'
      box.style.cssText =
        'position:fixed;left:4px;right:4px;top:4px;z-index:2147483647;pointer-events:none;font:11px/1.3 monospace;color:#0f0;background:rgba(0,0,0,.78);padding:4px 6px;border-radius:6px;white-space:pre-wrap;max-height:45vh;overflow:hidden'
      document.body.appendChild(box)
    }
    lines.push(`${new Date().toISOString().slice(14, 23)} ${msg}`)
    while (lines.length > 14) lines.shift()
    box.textContent = lines.join('\n')
  } catch {}
}

export function setAdsDebug(on: boolean) {
  try {
    window.localStorage.setItem(DEBUG_KEY, on ? '1' : '0')
  } catch {}
  if (!on) document.getElementById('__adDbg')?.remove()
  else log('ads debug on')
}

/* ---------- защита клика: Telegram иногда «проглатывает» openLink из рекламы ---------- */

let hiddenAt = 0
let guardOn = false

function openViaAnchor(url: string) {
  try {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => a.remove(), 1500)
  } catch {}
}

function showFallback(url: string) {
  try {
    document.getElementById('__adFb')?.remove()
    const l = lang()
    const box = document.createElement('div')
    box.id = '__adFb'
    box.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:84px;z-index:2147483646;display:flex;gap:10px;align-items:center;background:#111827;border:1px solid #f59e0b;border-radius:14px;padding:10px 12px;color:#fff;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.5)'
    const text = document.createElement('span')
    text.style.flex = '1'
    text.textContent = translate(l, 'ads.fallbackText')
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = translate(l, 'ads.fallbackOpen')
    link.style.cssText = 'background:#f59e0b;color:#111;padding:8px 14px;border-radius:10px;text-decoration:none;font-weight:700'
    link.onclick = () => setTimeout(() => box.remove(), 400)
    const close = document.createElement('span')
    close.textContent = '✕'
    close.style.cssText = 'padding:4px 6px;opacity:.7'
    close.onclick = () => box.remove()
    box.append(text, link, close)
    document.body.appendChild(box)
    setTimeout(() => box.remove(), 20000)
  } catch {}
}

/**
 * Реклама Monetag открывает ссылку через Telegram.WebApp.openLink из своего iframe. Если Telegram
 * не воспринимает это как нажатие пользователя, ссылка не открывается и реклама «некликабельна».
 * Мы проверяем, ушла ли страница в фон; если нет, открываем ссылку через <a> и показываем кнопку.
 */
export function installAdGuard() {
  if (guardOn || typeof window === 'undefined') return
  const w = tg()
  if (!w || typeof w.openLink !== 'function') return
  guardOn = true
  const orig = w.openLink
  w.openLink = function (url: string, ...rest: unknown[]) {
    log(`openLink ${String(url).slice(0, 90)}`)
    const result = (orig as OpenLink).apply(w, [url, ...rest] as [string])
    if (/^https?:/i.test(String(url))) {
      const started = Date.now()
      hiddenAt = 0
      setTimeout(() => {
        if (hiddenAt >= started) return
        log('openLink ignored -> opening via <a>')
        openViaAnchor(String(url))
      }, 700)
      setTimeout(() => {
        if (hiddenAt >= started) return
        log('still not opened -> fallback button')
        showFallback(String(url))
      }, 2800)
    }
    return result
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hiddenAt = Date.now()
  })
  w.onEvent?.('deactivated', () => {
    hiddenAt = Date.now()
  })
  window.addEventListener('error', (e) => log(`err: ${e.message}`))
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason as { message?: string } | string | undefined
    log(`rej: ${typeof r === 'string' ? r : (r?.message ?? '')}`)
  })
  log('ad guard installed')
}

/* ---------- показ рекламы ---------- */

type ShowFn = (arg?: unknown) => Promise<void>

function sdkFn(): ShowFn | null {
  const f = (window as unknown as Record<string, unknown>)[FN]
  return typeof f === 'function' ? (f as ShowFn) : null
}

function waitForSdk(timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (sdkFn()) return resolve(true)
    const started = Date.now()
    const id = setInterval(() => {
      if (sdkFn()) {
        clearInterval(id)
        resolve(true)
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(id)
        resolve(false)
      }
    }, 150)
  })
}

let busyAt = 0

/** Показывает рекламу Monetag. Возвращает true, если пользователь досмотрел до конца. */
export async function showAd(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (busyAt && Date.now() - busyAt < 60_000) {
    log('skip: another ad is on screen')
    return false
  }
  busyAt = Date.now()
  installAdGuard()
  try {
    if (!(await waitForSdk())) {
      log('SDK not ready')
      return false
    }
    const show = sdkFn()
    if (!show) return false
    const t0 = Date.now()
    log(`${FN}()`)
    await show()
    log(`resolved after ${Date.now() - t0} ms`)
    return true
  } catch (e) {
    log(`rejected: ${e instanceof Error ? e.message : JSON.stringify(e)}`)
    return false
  } finally {
    busyAt = 0
  }
}

/* ---------- автоматическая реклама ---------- */

/*
 * Чтобы реклама не накладывалась и не раздражала, автоматически показывается ОДИН формат —
 * баннер Vignette: не сразу при открытии, не чаще раза в 20 минут. Rewarded-реклама идёт только по
 * нажатию пользователя («Дивитись рекламу»). In-App Interstitial выключен: включите ENABLE_IN_APP,
 * если нужен ещё один формат (но он будет перекрываться с Vignette).
 */
const ENABLE_IN_APP = false
const IN_APP = { frequency: 1, capping: 0.5, interval: 60, timeout: 30, everyPage: false }
let inAppStarted = false

export function startInAppAds() {
  if (!ENABLE_IN_APP || inAppStarted || typeof window === 'undefined') return
  inAppStarted = true
  installAdGuard()
  waitForSdk().then((ok) => {
    const show = ok ? sdkFn() : null
    if (!show) {
      log('inApp: SDK not ready')
      inAppStarted = false
      return
    }
    try {
      log('inApp start')
      Promise.resolve(show({ type: 'inApp', inAppSettings: IN_APP })).catch((e: unknown) =>
        log(`inApp rejected: ${e instanceof Error ? e.message : JSON.stringify(e)}`),
      )
    } catch (e) {
      log(`inApp error: ${e instanceof Error ? e.message : String(e)}`)
    }
  })
}

const VIGNETTE_KEY = 'offonsvitlo_vignette_at'
const VIGNETTE_DELAY_MS = 12_000 // пауза после открытия приложения
const VIGNETTE_MIN_GAP_MS = 20 * 60_000 // не чаще раза в 20 минут
let vignetteTimer: ReturnType<typeof setTimeout> | null = null

/** Баннер Vignette (зона 12304370): один раз за сессию, с паузой и ограничением по времени. */
export function loadVignette() {
  if (typeof document === 'undefined' || vignetteTimer || document.getElementById('__vignette')) return
  let last = 0
  try {
    last = Number(window.localStorage.getItem(VIGNETTE_KEY) ?? 0)
  } catch {}
  if (Date.now() - last < VIGNETTE_MIN_GAP_MS) {
    log('vignette skipped (cooldown)')
    return
  }
  let tries = 0
  const attempt = () => {
    // если на экране реклама за награду, подождём, чтобы баннеры не накладывались
    if (busyAt && Date.now() - busyAt < 60_000 && tries++ < 6) {
      vignetteTimer = setTimeout(attempt, 15_000)
      return
    }
    try {
      const s = document.createElement('script')
      s.id = '__vignette'
      s.dataset.zone = VIGNETTE_ZONE
      s.src = VIGNETTE_SRC
      s.onerror = () => log('vignette failed to load')
      ;(document.body ?? document.documentElement).appendChild(s)
      window.localStorage.setItem(VIGNETTE_KEY, String(Date.now()))
      log('vignette loaded')
    } catch {}
  }
  vignetteTimer = setTimeout(attempt, VIGNETTE_DELAY_MS)
}
