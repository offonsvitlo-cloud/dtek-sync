'use client'

import { Zap } from 'lucide-react'
import { haptic } from '@/lib/api'
import { LANGS } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useActions, useT } from '@/hooks/use-app-data'

export function LanguageSwitch({ className }: { className?: string }) {
  const { t, lang } = useT()
  const { setLanguage } = useActions()
  return (
    <div
      role="radiogroup"
      aria-label={t('lang.label')}
      className={cn('flex rounded-full border bg-card/70 p-0.5 text-xs font-semibold', className)}
    >
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
          className={cn(
            'rounded-full px-2.5 py-1 uppercase transition-colors',
            lang === l ? 'bg-on text-on-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export function AppHeader({ title, demo }: { title?: string; demo?: boolean }) {
  const { t } = useT()
  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-on text-on-foreground shadow-[0_0_14px_-2px_var(--on)]">
          <Zap className="size-4" fill="currentColor" aria-hidden="true" />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight">{title ?? 'offonsvitlo'}</span>
      </div>
      <div className="flex items-center gap-2">
        {demo ? (
          <span className="rounded-full border border-warn/50 bg-warn/15 px-2.5 py-1 text-[11px] font-semibold text-warn-foreground dark:text-warn">
            {t('header.demo')}
          </span>
        ) : null}
        <LanguageSwitch />
      </div>
    </header>
  )
}
