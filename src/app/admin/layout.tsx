"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Image, FileText, Send, LogOut, ChevronLeft, ChevronRight, Sparkles, Settings2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // publish veya texts sayfalarında sidebar'ı otomatik daraltıyoruz
  useEffect(() => {
    const shouldCollapse = pathname?.includes('/admin/publish') || pathname?.includes('/admin/texts')
    setIsCollapsed(shouldCollapse || false)
  }, [pathname])

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin' },
    { icon: <Image size={20} />, label: 'Medya', href: '/admin/media' },
    { icon: <FileText size={20} />, label: 'Metinler', href: '/admin/texts' },
    { icon: <Sparkles size={20} />, label: 'Eski Yayınlar', href: '/admin/posts' },
    { icon: <Settings2 size={20} />, label: 'Menü Düzenle', href: '/admin/categories' },
    { icon: <Send size={20} />, label: 'Yayınla', href: '/admin/publish' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-50 hover:bg-gray-50"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className={`p-6 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xl">R</span>
          </div>
          {!isCollapsed && <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">Radyle</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              title={isCollapsed ? item.label : ''}
              className={`flex items-center rounded-xl transition-all duration-300 font-bold text-sm uppercase tracking-wider ${
                pathname === item.href ? 'bg-black text-white' : 'hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link 
            href="/" 
            className={`flex items-center rounded-xl text-red-600 transition-colors font-bold text-sm uppercase tracking-wider hover:bg-red-50 ${
              isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
            }`}
          >
            <div className="shrink-0"><LogOut size={20} /></div>
            {!isCollapsed && <span className="whitespace-nowrap">Çıkış</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  )
}
