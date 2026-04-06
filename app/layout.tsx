import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ServerWakeBanner from '@/components/ServerWakeBanner'
import ServiceWorkerInit from '@/components/ServiceWorkerInit'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkillLink',
  description: 'Book trusted local experts for skills, classes, and coaching.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#4F46E5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body>
        <Providers>
          <ServiceWorkerInit />
          <ServerWakeBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}
