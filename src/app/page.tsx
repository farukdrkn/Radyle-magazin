import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/PostCard'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: posts, error } = await supabase
    .from('published_pages')
    .select('id, title, slug, category, cover_url, layout_data, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
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
    <main className="w-full min-h-screen bg-transparent">
      <div className="w-full min-h-screen bg-transparent">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-10 sm:py-20">
          {/* Staggered Grid Layout */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 items-start">
            {posts?.map((post: any, index: number) => (
              <div 
                key={post.id} 
                className={`${getMobileMargin(index)} ${getDesktopMargin(index)}`}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="w-full mt-40 pb-20 text-center border-t border-white/10 pt-20">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-400">
              © 2026 Radyle Magazine
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
