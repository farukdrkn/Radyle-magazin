import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface LayoutBlock {
  text: string
  imageUrl: string | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('published_pages')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!post) return {}

  const getPlainText = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>?/gm, '').trim()
  }

  const excerpt = post.layout_data && post.layout_data.length > 0 
    ? getPlainText(post.layout_data[0].text).substring(0, 150) + '...'
    : 'Radyle Magazine makalesi.'

  const resolveMediaUrl = (path: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  const coverUrl = resolveMediaUrl(post.cover_url)

  return {
    title: post.title,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      images: coverUrl ? [{ url: coverUrl }] : [],
    },
  }
}

export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: post, error } = await supabase
    .from('published_pages')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !post) {
    return notFound()
  }

  const resolveMediaUrl = (path: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  const blocks = (post.layout_data as LayoutBlock[]) || []
  const coverUrl = resolveMediaUrl(post.cover_url)

  return (
    <main className="w-full min-h-screen bg-transparent">
      <div className="w-full min-h-screen bg-transparent">
        {/* Centered Container for the entire page content */}
        <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 bg-transparent relative shadow-2xl">
          <div className="relative z-10 bg-transparent">
            {/* Header/Nav */}
            <nav className="p-6 md:p-10 absolute top-0 left-0 w-full z-50">
              <Link 
                href="/" 
                className="text-[10px] font-black uppercase tracking-[0.5em] text-white bg-black/20 backdrop-blur-md px-6 py-3 rounded-full hover:bg-black/40 transition-all inline-block shadow-2xl"
              >
                ← RADYLE MAGAZİN
              </Link>
            </nav>

            {/* Hero Section - Constrained to max-w-5xl via parent */}
            <section 
              className="h-[80vh] w-full flex flex-col items-center justify-center p-10 md:p-20 text-center relative overflow-hidden"
            >
              {coverUrl && (
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
                  style={{ backgroundImage: `url(${coverUrl})` }}
                />
              )}
              <div className="absolute inset-0 bg-black/50 z-10" />
              
              <div className="relative z-20">
                <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 drop-shadow-2xl max-w-4xl break-words mx-auto">
                  {post.title}
                </h1>
                <div className="w-20 h-1.5 bg-indigo-500 mx-auto rounded-full shadow-lg mb-8" />
                {post.category && (
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-white/70 drop-shadow-md">
                    {post.category} • 2026
                  </span>
                )}
              </div>
            </section>

            {/* Zigzag Content Sections - bg-transparent to show zekran pattern through the subtle overlay */}
            <div className="bg-transparent">
              <div className="divide-y divide-white/10 bg-transparent py-10">
                {blocks.map((block, index) => (
                  <section 
                    key={index} 
                    className="flex flex-col md:flex-row gap-10 md:gap-16 py-24 md:py-28 relative items-start bg-transparent"
                  >
                    {/* Text Section */}
                    <div className={`flex-1 w-full md:w-1/2 space-y-8 flex flex-col justify-center overflow-hidden break-words ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-indigo-500/30" />
                        <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-[0.4em]">Bölüm 0{index + 1}</span>
                      </div>
                      <div 
                        className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-lg prose-p:md:text-xl prose-p:leading-relaxed prose-p:text-gray-800 dark:prose-p:text-white prose-p:italic prose-p:font-serif overflow-hidden break-words"
                        dangerouslySetInnerHTML={{ __html: block.text }}
                      />
                    </div>

                    {/* Image Section */}
                    <div className={`flex-1 w-full md:w-1/2 ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                      {block.imageUrl && (
                        <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 transition-transform duration-700 hover:scale-[1.02]">
                          <img 
                            src={resolveMediaUrl(block.imageUrl)} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="w-full py-20 text-center bg-black/5 dark:bg-black/25 border-t border-black/5 dark:border-white/10 backdrop-blur-xl">
               <div className="mb-8">
                 <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em]">
                   Radyle Magazin Ana Sayfa
                 </Link>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">© 2026 Radyle Magazine</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
