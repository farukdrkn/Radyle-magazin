"use client"

import React from 'react'
import './styles.css'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFaruk = pathname?.startsWith('/faruk')

  return (
    <html lang="tr" className="bg-transparent">
      <body className="min-h-screen !bg-[url('/zekran.jpg')] !bg-cover !bg-fixed !bg-center text-black">
        {/* Admin sayfalarında ana Header'ı gizliyoruz */}
        {!isFaruk && <Header />}
        <main className="bg-transparent">{children}</main>
      </body>
    </html>
  )
}