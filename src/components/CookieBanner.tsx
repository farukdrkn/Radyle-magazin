"use client"

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent !== 'granted') {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-100 dark:border-zinc-800 shadow-2xl rounded-2xl p-6 flex flex-col gap-4 text-black dark:text-white transition-colors duration-150">
        <p className="text-xs font-semibold leading-relaxed text-gray-700 dark:text-zinc-300">
          Sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Radyle'yi kullanmaya devam ederek çerez politikamızı kabul etmiş olursunuz.
        </p>
        <div className="flex justify-end gap-3 items-center">
          <button 
            onClick={handleAccept}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-md active:scale-95"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  )
}
