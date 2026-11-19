import { Bell, CalendarClock, Megaphone, Siren, Zap, ZapOff } from 'lucide-react'
import type { AlertEvent } from '@/lib/api'
import { LOCALE, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useLang } from '@/hooks/use-app-data'

const fmts: Partial<Record<Lang, Intl.DateTimeFormat>> = {}
function timeFmt(lang: Lang) {
  return (fmts[lang] ??= new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }))
}

function iconFor(type: string) {
  if (type.includes('emergency')) return { Icon: Siren, cls: 'bg-destructive/15 text-destructive' }
  if (type.includes('off')) return { Icon: ZapOff, cls: 'bg-off/15 text-off dark:text-destructive' }
  if (type.includes('on')) return { Icon: Zap, cls: 'bg-on/15 text-on' }
  if (type.includes('schedule') || type.includes('tomorrow')) return { Icon: CalendarClock, cls: 'bg-warn/20 text-warn-foreground dark:text-warn' }
  if (type.includes('channel')) return { Icon: Megaphone, cls: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' }
  return { Icon: Bell, cls: 'bg-muted text-muted-foreground' }
}

export function AlertItem({ alert }: { alert: AlertEvent }) {
  const lang = useLang()
  const { Icon, cls } = iconFor(alert.type)
  return (
    <li className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', cls)}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{alert.title}</p>
        <p className="text-sm text-muted-foreground">{alert.message}</p>
      </div>
      <time dateTime={alert.createdAt} className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {timeFmt(lang).format(new Date(alert.createdAt))}
      </time>
    </li>
  )
}
