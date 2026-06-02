"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ImageIcon, 
  FileText, 
  Settings, 
  Check, 
  Send, 
  Sparkles, 
  ChevronRight, 
  Image as ImageIconLucide,
  Plus,
  X,
  Loader2,
  Layout,
  Type,
  Eye,
  ArrowRightLeft,
  Layers,
  ChevronLeft
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { savePublishedPage } from '../dbActions'

interface TextRecord {
  id: string
  title: string
  content: string
}

interface MediaRecord {
  id: string
  file_url: string
  file_name: string
}

interface CategoryRecord {
  id: string
  name: string
  parent_id: string | null
}

interface LayoutBlock {
  text: string
  imageUrl: string | null
}

const generateSlug = (name: string) => {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  }
  return name
    .split('')
    .map(c => trMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

function PublishPageContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  // Data States
  const [texts, setTexts] = useState<TextRecord[]>([])
  const [media, setMedia] = useState<MediaRecord[]>([])
  const [categories, setCategories] = useState<CategoryRecord[]>([])

  // UI States
  const [activeTab, setActiveTab] = useState<'texts' | 'media' | 'details'>('texts')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null) // -1 for Hero

  // Selection & Payload States
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<LayoutBlock[]>([])
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)

  // Helper: Resolve Supabase Storage URL
  const resolveMediaUrl = useCallback((path: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }, [supabase])

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [textsRes, mediaRes, catsRes] = await Promise.all([
        supabase.from('texts').select('id, title, content').order('created_at', { ascending: false }),
        supabase.from('media').select('id, file_url, file_name').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name, parent_id').order('name', { ascending: true })
      ])

      // Defensive Data Mapping
      if (textsRes.error) console.error('Metinler çekilemedi:', textsRes.error)
      setTexts(textsRes.data || [])

      if (mediaRes.error) {
        console.error('Medyalar çekilemedi:', mediaRes.error)
      } else {
        // Savunmacı URL işleme ve null kontrolü + URL Çözümleme
        const safeMedia = (mediaRes.data || []).map((m, idx) => ({
          ...m,
          file_url: resolveMediaUrl(m.file_url),
          file_name: m.file_name || (m.file_url ? m.file_url.split('/').pop() : `Görsel #${idx + 1}`) || `Görsel #${idx + 1}`
        }))
        setMedia(safeMedia)
      }

      if (catsRes.error) console.error('Kategoriler çekilemedi:', catsRes.error)
      setCategories(catsRes.data || [])

      // Edit Mode
      if (editId) {
        const { data: page, error: pageError } = await supabase
          .from('published_pages')
          .select('*')
          .eq('id', editId)
          .maybeSingle()

        if (pageError) {
          console.error('Sayfa verisi çekilemedi:', pageError)
        } else if (page) {
          setTitle(page.title || '')
          setCategoryId(page.category_id || '')
          setHeroImageUrl(page.cover_url || null)
          setSelectedTextId(page.text_id)
          setBlocks((page.layout_data as LayoutBlock[]) || [])
          
          // Find parent category if categoryId is set
          if (page.category_id && catsRes.data) {
            const currentCat = catsRes.data.find(c => c.id === page.category_id)
            if (currentCat?.parent_id) {
              setParentCategoryId(currentCat.parent_id)
            } else if (currentCat) {
              setParentCategoryId(currentCat.id)
            }
          }
          
          setActiveTab('details')
        }
      }
    } catch (error) {
      console.error('Beklenmedik hata:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, editId, resolveMediaUrl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Logic: Text Selection
  const handleSelectText = (text: TextRecord) => {
    setSelectedTextId(text.id)
    setTitle(text.title)
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(text.content, 'text/html')
    const paragraphs = Array.from(doc.querySelectorAll('p'))
      .map(p => p.outerHTML)
      .filter(html => html.replace(/<[^>]*>/g, '').trim().length > 0)

    setBlocks(paragraphs.map(p => ({ text: p, imageUrl: null })))
    setActiveTab('media')
  }

  // Logic: Media Assignment
  const selectImage = (imageUrl: string) => {
    if (activeBlockIndex === -1) {
      setHeroImageUrl(imageUrl)
      setActiveBlockIndex(null)
    } else if (activeBlockIndex !== null) {
      const newBlocks = [...blocks]
      newBlocks[activeBlockIndex].imageUrl = imageUrl
      setBlocks(newBlocks)
      setActiveBlockIndex(null)
    }
  }

  // Action: Save/Publish
  const handlePublish = async () => {
    if (!title || !categoryId || blocks.length === 0) {
      alert('Lütfen başlık, kategori ve içerik seçtiğinizden emin olun.')
      return
    }

    setIsSaving(true)
    const slug = generateSlug(title)
    const coverUrl = heroImageUrl || blocks.find(b => b.imageUrl)?.imageUrl || ''
    const selectedCategory = categories.find(c => c.id === categoryId)?.name || ''

    const payload = {
      title,
      page_name: title, // Fix: page_name must be present and not null
      slug,
      category: selectedCategory,
      category_id: categoryId,
      cover_url: coverUrl,
      layout_data: blocks,
      text_id: selectedTextId
    }

    try {
      if (editId) {
        await savePublishedPage({
          id: editId,
          ...payload
        })
      } else {
        await savePublishedPage(payload)
      }
      alert('Başarıyla kaydedildi!')
      router.push('/faruk/posts')
    } catch (error: any) {
      console.error('Kaydetme hatası:', error)
      alert(`Hata: ${error.message || 'Bilinmeyen hata'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-transparent overflow-hidden">
      {/* 3-TAB WORKFLOW CONTROLLER */}
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm z-20">
        <div className="flex border-b border-gray-50">
          {[
            { id: 'texts', icon: <FileText size={18} />, label: 'Metinler' },
            { id: 'media', icon: <ImageIcon size={18} />, label: 'Medya' },
            { id: 'details', icon: <Settings size={18} />, label: 'Yayın' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-5 flex flex-col items-center gap-1.5 transition-all relative ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'texts' && (
            <div className="p-4 space-y-3">
              <div className="px-2 mb-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kaynak Metinler</h3>
              </div>
              {texts.map(text => (
                <div 
                  key={text.id}
                  onClick={() => handleSelectText(text)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                    selectedTextId === text.id 
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-sm' 
                      : 'bg-white border-gray-50 hover:border-gray-100'
                  }`}
                >
                  <h4 className={`text-xs font-bold uppercase tracking-tight mb-1 ${selectedTextId === text.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {text.title}
                  </h4>
                  <p className="text-[9px] text-gray-400 font-medium">Seçmek için tıkla</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-4">
              <div className="px-2 mb-4 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Görsel Seç</h3>
                {activeBlockIndex !== null && (
                  <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
                    {activeBlockIndex === -1 ? 'Arka Plan' : `Sıra #${activeBlockIndex + 1}`} Aktif
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {media.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => selectImage(item.file_url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activeBlockIndex !== null ? 'hover:border-indigo-500 ring-offset-2 hover:ring-2 ring-indigo-200' : 'opacity-60 grayscale hover:grayscale-0'
                    }`}
                    title={item.file_name}
                  >
                    {item.file_url && item.file_url !== "" ? (
                      <img 
                        src={item.file_url} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        alt={item.file_name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Hata'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center gap-2">
                        <ImageIconLucide size={20} className="text-zinc-300" />
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Resim Yok</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                      <Plus className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" size={20} />
                    </div>
                  </div>
                ))}
              </div>
              {activeBlockIndex === null && (
                <p className="mt-6 text-[10px] text-center text-gray-400 italic px-4 leading-relaxed">
                  * Görsel atamak için önce sağ taraftaki mizanpajdan bir görsel alanına veya arka plana tıklayın.
                </p>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yayın Yapılandırması</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Kapak Başlığı</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 ring-indigo-100 outline-none transition-all"
                    placeholder="Vitrinde görünecek başlık..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Ana Kategori</label>
                  <select 
                    value={parentCategoryId}
                    onChange={(e) => {
                      setParentCategoryId(e.target.value)
                      setCategoryId('')
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Lütfen seçin...</option>
                    {categories.filter(c => !c.parent_id).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                {parentCategoryId && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Alt Kategori</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Lütfen seçin...</option>
                      {categories.filter(c => c.parent_id === parentCategoryId).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CANVAS AREA */}
      <main className="flex-1 overflow-y-auto p-10 bg-transparent custom-scrollbar relative">
        <header className="max-w-5xl mx-auto mb-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Mizanpaj Editörü</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {selectedTextId ? 'İmmersif Tasarım Canlı Önizleme' : 'Başlamak için soldan metin seçin'}
              </p>
            </div>
          </div>

          <button 
            onClick={handlePublish}
            disabled={isSaving || !selectedTextId}
            className="group bg-black text-white px-10 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30 shadow-2xl shadow-black/5"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {editId ? 'Güncelle' : 'Yayına Al'}
          </button>
        </header>

        {/* Viewport Canvas - Immersive Container */}
        <div 
          className="max-w-5xl mx-auto bg-white shadow-2xl rounded-[3rem] min-h-[1000px] overflow-hidden border border-gray-50 relative bg-cover bg-fixed bg-center transition-all duration-1000"
          style={{ 
            backgroundImage: heroImageUrl ? `url(${resolveMediaUrl(heroImageUrl)})` : 'none',
            backgroundColor: heroImageUrl ? 'transparent' : '#fff'
          }}
        >
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-gray-200 gap-6 bg-white/90 backdrop-blur-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center animate-pulse">
                <Layers size={40} />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Mizanpaj boş. Lütfen bir kaynak metin seçin.</p>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Global Hero Overlay */}
              <div 
                onClick={() => {
                  setActiveBlockIndex(-1)
                  setActiveTab('media')
                }}
                className={`relative h-[600px] w-full group cursor-pointer flex flex-col items-center justify-center p-20 text-center transition-all ${
                  activeBlockIndex === -1 ? 'ring-4 ring-inset ring-indigo-500 bg-indigo-500/10' : 'bg-black/40 hover:bg-black/30'
                }`}
              >
                {!heroImageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                     <ImageIconLucide size={48} className="text-white/20" />
                     <span className="text-xs font-bold uppercase tracking-widest text-white/40">Arka Plan Görseli Seçmek İçin Tıkla</span>
                  </div>
                )}
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 break-words max-w-4xl drop-shadow-2xl">
                  {title || 'Sayfa Başlığı'}
                </h2>
                <div className="w-20 h-1.5 bg-indigo-500 rounded-full shadow-lg" />
              </div>

              {/* Zigzag Content - Transparent Sections */}
              <div className="divide-y divide-white/10 backdrop-blur-sm bg-black/10">
                {blocks.map((block, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col md:flex-row gap-20 px-16 md:px-24 py-32 relative items-start bg-transparent"
                  >
                    {/* Text Section */}
                    <div className={`flex-1 w-full md:w-1/2 space-y-8 flex flex-col justify-center overflow-hidden break-words ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-white/30" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] drop-shadow-md">Bölüm 0{index + 1}</span>
                      </div>
                      <div 
                        className="prose prose-invert max-w-none prose-p:text-xl prose-p:md:text-2xl prose-p:leading-relaxed prose-p:text-white prose-p:italic prose-p:font-serif overflow-hidden break-words drop-shadow-lg"
                        dangerouslySetInnerHTML={{ __html: block.text }}
                      />
                    </div>

                    {/* Image Section (Sticky) */}
                    <div className={`flex-1 w-full md:w-1/2 sticky top-28 self-start ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                      <div 
                        onClick={() => {
                          setActiveBlockIndex(index)
                          setActiveTab('media')
                        }}
                        className={`relative aspect-[4/5] rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 shadow-2xl ${
                          activeBlockIndex === index ? 'ring-4 ring-indigo-500 ring-offset-8 scale-[1.02]' : ''
                        } ${
                          block.imageUrl ? 'shadow-black/50' : 'bg-white/10 backdrop-blur-md border-2 border-dashed border-white/20 hover:border-indigo-400 hover:bg-indigo-500/20'
                        }`}
                      >
                        {block.imageUrl ? (
                          <>
                            <img 
                              src={resolveMediaUrl(block.imageUrl)} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                              alt="" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/800x1000?text=Görsel+Bulunamadı'
                              }}
                            />
                            <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <ArrowRightLeft className="text-white transform translate-y-4 group-hover:translate-y-0 transition-all" size={32} />
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/50 group-hover:text-indigo-400 transition-colors">
                            <div className="p-5 bg-white/10 rounded-2xl shadow-sm border border-white/10 group-hover:scale-110 transition-transform">
                              <ImageIconLucide size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Bölüm Görseli Seç</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ddd; }
      `}</style>
    </div>
  )
}

export default function PublishPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      <PublishPageContent />
    </Suspense>
  )
}
