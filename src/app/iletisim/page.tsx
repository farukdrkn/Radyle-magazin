import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Radyle Dijital Dergi ile iletişime geçin. Resmi e-posta adresi ve iletişim detayları.',
}

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-transparent py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl p-8 md:p-16 text-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
          İletişim
        </h1>
        <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full mb-12 mx-auto" />
        
        <div className="max-w-xl mx-auto space-y-8 text-gray-700 dark:text-zinc-300">
          <p className="text-lg md:text-xl font-medium leading-relaxed">
            Bizimle paylaşmak istediğiniz bir geri bildiriminiz, iş birliği teklifiniz veya sorunuz mu var? Aşağıdaki resmi e-posta adresimiz üzerinden bizimle doğrudan iletişime geçebilirsiniz.
          </p>

          <div className="py-8 px-6 bg-gray-50 dark:bg-zinc-950/60 rounded-2xl border border-gray-100 dark:border-zinc-800 inline-block shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 block mb-2">
              E-POSTA ADRESİ
            </span>
            <a 
              href="mailto:fdurukan722@gmail.com" 
              className="text-xl md:text-2xl font-black text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-tight"
            >
              fdurukan722@gmail.com
            </a>
          </div>

          <p className="text-xs text-gray-400 dark:text-zinc-500 pt-8">
            Editör ekibimiz en kısa sürede size dönüş sağlayacaktır. İlginiz için teşekkür ederiz.
          </p>
        </div>
      </div>
    </main>
  )
}
