"use client"

import Link from 'next/link'

interface PostCardProps {
  post: any
}

export default function PostCard({ post }: PostCardProps) {
  if (!post) return null;

  // Function to strip HTML tags and get plain text (Server-safe regex)
  const getPlainText = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>?/gm, '').trim()
  }

  // Get first block text as excerpt
  const excerpt = post.layout_data && post.layout_data.length > 0 
    ? getPlainText(post.layout_data[0].text)
    : ""

  return (
    <Link 
      href={`/yazi/${post.id}`} 
      className="flex flex-col group cursor-pointer transition-all duration-500 bg-transparent"
    >
      <div className="flex flex-col">
        {/* Cover Image */}
        <div className="w-full aspect-[4/5] overflow-hidden rounded-t-[2rem] shadow-lg group-hover:shadow-2xl transition-all duration-700">
          <img
            src={post.cover_url || 'https://placehold.co/600x800?text=Radyle'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </div>
        
        {/* Content Container (White Background / Dark background) */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-b-[2rem] shadow-xl border-t border-gray-50 dark:border-zinc-800 space-y-3 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800/80 transition-colors">
          {post.category && (
            <span className="text-blue-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] block">
              {post.category}
            </span>
          )}
          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-[11px] leading-relaxed text-gray-500 dark:text-zinc-400 font-medium line-clamp-3">
            {excerpt}
          </p>
        </div>
      </div>
    </Link>
  )
}