import React from 'react'
import type { Metadata } from 'next'
import './styles.css'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GoogleAnalytics } from '@next/third-parties/google'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: {
    default: 'Radyle | Yeni Nesil Dijital Dergi',
    template: '%s | Radyle',
  },
  description: 'Modaya dair her şey, markalar nasıl kuruldu, dahi tasarımcıların hayatı, en ikonik parçalar... Radyle modanın merkezi.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Radyle | Yeni Nesil Dijital Dergi',
    description: 'Modaya dair her şey, markalar nasıl kuruldu, dahi tasarımcıların hayatı, en ikonik parçalar... Radyle modanın merkezi.',
    type: 'website',
    locale: 'tr_TR',
    url: 'https://radyle.com',
    siteName: 'Radyle',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen text-black dark:text-white transition-colors duration-150">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="bg-transparent">{children}</main>
        </ThemeProvider>
        <CookieBanner />
        <GoogleAnalytics gaId="G-KV0E8VPNE9" />
      </body>
    </html>
  )
}