import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import ServerWakeBanner from '@/components/ServerWakeBanner'
import ServiceWorkerInit from '@/components/ServiceWorkerInit'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkillLink — Master any skill, right in your neighborhood',
  description: 'Connect with verified local experts for badminton, yoga, music, tech, and more.',
  manifest: '/manifest.json',
  themeColor: '#24389c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkillLink',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <ServiceWorkerInit />
        <ServerWakeBanner />
        {children}
      </body>
    </html>
  )
}
