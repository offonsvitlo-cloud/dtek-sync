'use client'

import { House, Mail, MapPin, Settings } from 'lucide-react'
import type { Key } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useT } from '@/hooks/use-app-data'

export type Tab = 'home' | 'addresses' | 'alerts' | 'settings'

const TABS: { id: Tab; label: Key; icon: typeof House }[] = [
  { id: 'home', label: 'nav.home', icon: House },
  { id: 'addresses', label: 'nav.addresses', icon: MapPin },
  { id: 'alerts', label: 'nav.alerts', icon: Mail },
  { id: 'settings', label: 'nav.settings', icon: Settings },
]

export function BottomNav({ tab, onChange, badge }: { tab: Tab; onChange: (t: Tab) => void; badge?: number }) {
  const { t } = useT()
  return (
    <nav
      aria-label={t('nav.aria')}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-xs font-medium transition-colors',
                  active ? 'text-on' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn('size-6 transition-transform', active && 'scale-110 drop-shadow-[0_0_8px_var(--on)]')}
                    fill={active ? 'currentColor' : 'none'}
                    strokeWidth={active ? 1.6 : 2}
                    aria-hidden="true"
                  />
                  {id === 'alerts' && badge ? (
                    <span className="absolute -top-1 -right-2 grid min-w-4 place-items-center rounded-full bg-alert px-1 text-[10px] leading-4 font-bold text-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null}
                </span>
                <span className="truncate">{t(label)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
