"use client"

import React from 'react'
import Link from 'next/link'
import { Image, FileText, Send, ChevronRight, Sparkles, Settings2 } from 'lucide-react'

export default function AdminDashboard() {
  const cards = [
    {
      title: 'Medya',
      desc: 'Görsel kütüphanesini yönetin ve yeni dosyalar yükleyin.',
      icon: <Image size={32} />,
      href: '/admin/media',
      color: 'bg-blue-500',
    },
    {
      title: 'Metinler',
      desc: 'Zengin içerikli makale ve tanıtım metinleri oluşturun.',
      icon: <FileText size={32} />,
      href: '/admin/texts',
      color: 'bg-emerald-500',
    },
    {
      title: 'Eski Yayınlar',
      desc: 'Önceden paylaştığınız içerikleri yönetin.',
      icon: <Sparkles size={32} />,
      href: '/admin/posts',
      color: 'bg-purple-500',
    },
    {
      title: 'Menü Düzenle',
      desc: 'Sidebar navigasyon yapısını yönetin.',
      icon: <Settings2 size={32} />,
      href: '/admin/categories',
      color: 'bg-orange-500',
    },
    {
      title: 'Yayınla',
      desc: 'Görsel ve metinleri birleştirerek canlıya alın.',
      icon: <Send size={32} />,
      href: '/admin/publish',
      color: 'bg-black',
    },
  ]

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Hoş geldin, Editör</h1>
        <p className="text-gray-500 font-medium uppercase tracking-[0.3em] text-xs">Radyle içerik yönetim sistemine erişiminiz sağlandı.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <Link 
            key={card.href} 
            href={card.href}
            className="group relative bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className={`w-16 h-16 ${card.color} text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
              {card.icon}
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">{card.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{card.desc}</p>
            
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
              Hemen Başla
              <ChevronRight size={14} />
            </div>

            <div className="absolute top-6 right-6 opacity-5 scale-150 rotate-12 pointer-events-none">
              {card.icon}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
