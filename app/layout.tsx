import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Roboto, Roboto_Condensed } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
  variable: '--font-roboto-condensed',
})

export const metadata: Metadata = {
  title: 'offonsvitlo — графік відключень ДТЕК',
  description:
    'Telegram Mini App: статус світла, графік відключень ДТЕК Дніпровські електромережі та сповіщення для кількох адрес.',
  openGraph: {
    title: 'offonsvitlo — графік відключень ДТЕК',
    description: 'Статус світла, графік відключень і сповіщення для ваших адрес.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef1ee' },
    { media: '(prefers-color-scheme: dark)', color: '#0b120e' },
  ],
}

const themeBootScript = `try{var t=localStorage.getItem('offonsvitlo_theme');var tg=window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.colorScheme;var d=t?t==='dark':tg?tg==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning className={`${roboto.variable} ${robotoCondensed.variable}`}>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased">
        {children}
        <Script
          id="monetag-tma-sdk"
          src="https://libtl.com/sdk.js"
          data-zone="12304298"
          data-sdk="show_12304298"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
