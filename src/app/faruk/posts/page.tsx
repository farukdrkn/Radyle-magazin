"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Eye, Trash2, Calendar, Tag, Loader2, Search, FileX } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { deletePublishedPage } from '../dbActions'

interface PublishedPage {
  id: string
  title: string
  slug: string
  category: string
  cover_url: string
  created_at: string
}

export default function PastPostsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [posts, setPosts] = useState<PublishedPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error: dbError } = await supabase
        .from('published_pages')
        .select('id, title, slug, category, cover_url, created_at')
        .order('created_at', { ascending: false })

      if (dbError) throw dbError
      setPosts(data || [])
    } catch (error: any) {
      console.error('Yayınlar çekilirken hata oluştu:', JSON.stringify(error))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Bu yayını silmek istediğinize emin misiniz? Sadece yayın kaldırılacak, medya ve metinleriniz korunacaktır.')) return

    setIsDeleting(id)
    try {
      await deletePublishedPage(id)
      setPosts(prev => prev.filter(post => post.id !== id))
    } catch (error: any) {
      console.error('Silme hatası:', error)
      alert('Silme işlemi sırasında bir hata oluştu.')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleView = (id: string) => {
    window.open(`/yazi/${id}`, '_blank')
  }

  const handleEdit = (id: string) => {
    router.push(`/faruk/publish?id=${id}`)
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12 flex justify-between items-end">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Search size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Arşiv Yönetimi</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Eski Yayınlar</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Paylaştığınız tüm içerikleri buradan kontrol edin.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Yükleniyor...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-inner">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 animate-pulse">
            <FileX size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-black uppercase tracking-widest text-lg">Henüz yayınlanmış bir yazı bulunmuyor.</p>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Yeni bir içerik oluşturup yayınlayarak başlayabilirsiniz.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={post.cover_url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={post.title} 
                />
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                  <Tag size={12} className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-900">{post.category}</span>
                </div>
              </div>

              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <Calendar size={14} className="text-gray-300" />
                  {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <div className="flex items-center gap-3 pt-8 border-t border-gray-50">
                  <button 
                    onClick={() => handleEdit(post.id)}
                    className="flex-1 bg-black text-white h-14 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-black/5"
                  >
                    <Edit2 size={16} />
                    Düzenle
                  </button>
                  <button 
                    onClick={() => handleView(post.id)}
                    className="w-14 h-14 border-2 border-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all hover:border-blue-100 active:scale-90"
                    title="Görüntüle"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(post.id, e)}
                    disabled={isDeleting === post.id}
                    className="w-14 h-14 border-2 border-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all hover:border-red-100 active:scale-90 disabled:opacity-50"
                    title="Sil"
                  >
                    {isDeleting === post.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
