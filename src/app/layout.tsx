"use client"

import React from 'react'
import './styles.css'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <html lang="tr">
      <body className="bg-[#FAF9F6] min-h-screen">
        {/* Admin sayfalarında ana Header'ı gizliyoruz */}
        {!isAdmin && <Header />}
        <main>{children}</main>
      </body>
    </html>
  )
}