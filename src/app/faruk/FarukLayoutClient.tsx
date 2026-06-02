"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Image, 
  FileText, 
  Send, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Settings2, 
  UserPlus 
} from 'lucide-react'
import { logout } from './actions'

export default function FarukLayoutClient({ 
  children,
  isAuthenticated
}: { 
  children: React.ReactNode
  isAuthenticated: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // publish veya texts sayfalarında sidebar'ı otomatik daraltıyoruz
  useEffect(() => {
    const shouldCollapse = pathname?.includes('/faruk/publish') || pathname?.includes('/faruk/texts')
    setIsCollapsed(shouldCollapse || false)
  }, [pathname])

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/faruk' },
    { icon: <Image size={20} />, label: 'Medya', href: '/faruk/media' },
    { icon: <FileText size={20} />, label: 'Metinler', href: '/faruk/texts' },
    { icon: <Sparkles size={20} />, label: 'Eski Yayınlar', href: '/faruk/posts' },
    { icon: <Settings2 size={20} />, label: 'Menü Düzenle', href: '/faruk/categories' },
    { icon: <Send size={20} />, label: 'Yayınla', href: '/faruk/publish' },
    { icon: <UserPlus size={20} />, label: 'Kullanıcı Ekle', href: '/faruk/users' },
  ]

  const handleLogout = async () => {
    await logout()
    router.refresh()
    router.push('/faruk')
  }

  // If we are on the login page (unauthenticated /faruk route), do not render the sidebar wrapper
  if (pathname === '/faruk' && !isAuthenticated) {
    return (
      <main className="w-full min-h-screen bg-transparent">
        <div className="w-full min-h-screen bg-transparent flex items-center justify-center p-6">
          {children}
        </div>
      </main>
    )
  }

  return (
    /* Root Layer: Outermost container is transparent since body has the zekran pattern */
    <div className="flex h-screen w-screen text-gray-900 font-sans overflow-hidden bg-transparent">
      {/* Overlay Layer: Semi-transparent frosted mask for legibility */}
      <div className="flex h-full w-full bg-transparent overflow-hidden">
        
        {/* Sidebar */}
        <aside 
          className={`bg-white/90 backdrop-blur-md border-r border-gray-200/50 flex flex-col transition-all duration-500 ease-in-out relative z-30 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-50 hover:bg-gray-50 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Sidebar Header Brand Link to Home Page */}
          <Link 
            href="/" 
            className={`p-6 border-b border-gray-200/50 flex items-center hover:opacity-85 transition-opacity ${
              isCollapsed ? 'justify-center' : 'gap-2'
            }`}
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xl">R</span>
            </div>
            {!isCollapsed && <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">Radyle</span>}
          </Link>

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

          <div className="p-4 border-t border-gray-200/50">
            <button 
              onClick={handleLogout} 
              className={`w-full flex items-center rounded-xl text-red-600 transition-colors font-bold text-sm uppercase tracking-wider hover:bg-red-50 cursor-pointer ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              }`}
            >
              <div className="shrink-0"><LogOut size={20} /></div>
              {!isCollapsed && <span className="whitespace-nowrap">Çıkış</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-transparent z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
