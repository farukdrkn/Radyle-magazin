import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/PostCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the specific category details
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (categoryError || !category) {
    return notFound()
  }

  // Determine all category IDs to fetch posts from
  // (If parent category, include all subcategories)
  let categoryIds = [id]
  if (!category.parent_id) {
    const { data: subCats } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id)
    
    if (subCats && subCats.length > 0) {
      categoryIds = [id, ...subCats.map(c => c.id)]
    }
  }

  // Fetch all matching posts
  const { data: posts, error: postsError } = await supabase
    .from('published_pages')
    .select('id, title, slug, category, cover_url, layout_data, created_at')
    .in('category_id', categoryIds)
    .order('created_at', { ascending: false })

  if (postsError) {
    console.error('Error fetching posts by category:', postsError)
  }

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
          
          {/* Category Header */}
          <div className="w-full text-center mb-16">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">
              Kategori
            </h1>
            <p className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900">
              {category.name}
            </p>
            <div className="w-12 h-1 bg-indigo-600 mx-auto mt-4 rounded-full" />
          </div>

          {posts && posts.length > 0 ? (
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
            /* EMPTY STATE VIEW */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 mb-8 rounded-full bg-white/60 shadow-lg border border-black/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest max-w-2xl leading-tight">
                Bu kategoride henüz yazı bulunmamaktadır
              </h2>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-4 max-w-md leading-relaxed">
                Dergi editörlerimiz bu kategoriye ait yeni yazıları çok yakında paylaşacaktır.
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
