import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q || ''
  
  const supabase = await createClient()

  // Fetch all published posts to perform query filtering
  const { data: allPosts, error } = await supabase
    .from('published_pages')
    .select('id, title, slug, category, cover_url, layout_data, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
  }

  // Filter posts based on search query matching title or layout content
  const query = q.toLowerCase().trim()
  const posts = allPosts?.filter((post: any) => {
    if (!query) return true

    // Check title
    const matchesTitle = post.title?.toLowerCase().includes(query)

    // Check content in layout blocks
    let matchesContent = false
    if (post.layout_data && Array.isArray(post.layout_data)) {
      matchesContent = post.layout_data.some((block: any) => {
        if (!block || !block.text) return false
        return block.text.toLowerCase().includes(query)
      })
    }

    return matchesTitle || matchesContent
  }) || []

  // Staggered top margins for desktop (5 columns)
  const getDesktopMargin = (index: number) => {
    const mod = index % 5
    if (mod === 0) return 'mt-0'
    if (mod === 1) return 'mt-32'
    if (mod === 2) return 'mt-16'
    if (mod === 3) return 'mt-24'
    return 'mt-8'
  }

  // Staggered top margins for mobile (3 columns)
  const getMobileMargin = (index: number) => {
    const mod = index % 3
    if (mod === 0) return 'mt-0'
    if (mod === 1) return 'mt-12'
    return 'mt-6'
  }

  return (
    <main className="w-full min-h-screen bg-[url('/zekran.jpg')] bg-fixed bg-repeat bg-center">
      <div className="w-full min-h-screen bg-white/30">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-10 sm:py-20">
          
          {/* Header section of the search results */}
          <div className="w-full text-center mb-16">
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-blue-600 mb-2">
              Arama Sonuçları
            </h1>
            <p className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900">
              &ldquo;{q}&rdquo;
            </p>
            <div className="w-12 h-1 bg-indigo-600 mx-auto mt-4 rounded-full" />
          </div>

          {posts.length > 0 ? (
            /* Staggered Grid Layout */
            <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 items-start">
              {posts.map((post: any, index: number) => (
                <div 
                  key={post.id} 
                  className={`${getMobileMargin(index)} ${getDesktopMargin(index)}`}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            /* 0 RESULTS VIEW */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 mb-8 rounded-full bg-white/60 shadow-lg border border-black/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-widest max-w-2xl leading-tight">
                Arama Sonuçları: &apos;{q}&apos; için 0 SONUÇ BULUNDU
              </h2>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-4 max-w-md leading-relaxed">
                Aradığınız kelimeye uygun bir içerik dergimizde yer almıyor. Farklı kelimelerle tekrar aramayı deneyebilirsiniz.
              </p>
              <Link 
                href="/" 
                className="mt-8 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-colors shadow-xl rounded-full"
              >
                Geri Dön
              </Link>
            </div>
          )}

          {/* Footer */}
          <footer className="w-full mt-40 pb-20 text-center border-t border-black/5 pt-20">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              © 2026 Radyle Magazine
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
