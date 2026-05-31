"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

type Category = {
  id: string;
  name: string;
  slug?: string;
  parent_id: string | null;
}

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      
      if (!error && data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [supabase])

  const parentCategories = categories.filter(cat => !cat.parent_id)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsSearchFocused(false)
    }
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes smooth-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: smooth-marquee 40s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}} />
      <header className="w-full sticky top-0 z-50">
        <div className="bg-white border-b border-gray-100 shadow-sm">
          {/* Main Header - Aligned with content */}
          <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 h-20 flex items-center justify-between gap-4">
            
            {/* Left: Logo */}
            <div className="flex-1 flex justify-start items-center">
              <Link href="/" className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-black">
                RADYLE
              </Link>
            </div>

            {/* Middle: Expandable Search */}
            <div className="flex-[2] sm:flex-1 flex justify-center items-center">
              <div 
                className={`relative transition-all duration-500 ease-in-out flex items-center ${
                  isSearchFocused ? 'w-full max-w-md' : 'w-32 sm:w-48'
                }`}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="ARA..."
                  className="w-full bg-gray-100 text-[10px] font-bold tracking-widest rounded-full py-2.5 px-6 focus:outline-none focus:ring-1 focus:ring-black transition-all uppercase"
                />
              </div>
            </div>

            {/* Right: Menu Button */}
            <div className="flex-1 flex justify-end items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
              >
                <div className="w-6 h-5 flex flex-col justify-between items-end">
                  <div className="w-full h-0.5 bg-black" />
                  <div className="w-2/3 h-0.5 bg-black transition-all group-hover:w-full" />
                  <div className="w-full h-0.5 bg-black" />
                </div>
              </button>
            </div>
          </div>

          {/* Black Category Nav Bar - Infinite Marquee */}
          <div className="w-full bg-black text-white overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 overflow-hidden h-12 flex items-center">
              <div className="marquee-container">
                {/* Large set of categories for gapless loop */}
                <div className="flex items-center space-x-12 pr-12">
                  {Array(10).fill(parentCategories).flat().map((cat, idx) => (
                    <Link
                      key={`${cat.id}-${idx}`}
                      href={`/kategori/${cat.id}`}
                      className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors whitespace-nowrap"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                {/* Second set for loop */}
                <div className="flex items-center space-x-12 pr-12">
                  {Array(10).fill(parentCategories).flat().map((cat, idx) => (
                    <Link
                      key={`dup-${cat.id}-${idx}`}
                      href={`/kategori/${cat.id}`}
                      className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors whitespace-nowrap"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar Menu */}
        <div 
          className={`fixed top-0 right-0 h-full w-[320px] bg-white text-black z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-10 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-16">
              <span className="text-3xl font-black tracking-tighter">RADYLE</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Kategoriler</h3>
              {parentCategories.map((parent) => {
                const subCategories = categories.filter(c => c.parent_id === parent.id)
                const hasSub = subCategories.length > 0
                const isOpen = expandedCategories.includes(parent.id)

                return (
                  <div key={parent.id} className="group">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/kategori/${parent.id}`}
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-2xl font-black uppercase tracking-tighter hover:text-indigo-600 transition-colors"
                      >
                        {parent.name}
                      </Link>
                      {hasSub && (
                        <button 
                          onClick={() => toggleCategory(parent.id)}
                          className={`p-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {hasSub && isOpen && (
                      <div className="mt-4 ml-4 flex flex-col space-y-3 border-l-2 border-gray-100 pl-6">
                        {subCategories.map(sub => (
                          <Link 
                            key={sub.id}
                            href={`/kategori/${sub.id}`}
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}