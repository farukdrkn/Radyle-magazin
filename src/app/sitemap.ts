import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://radyle.com').replace(/\/$/, '')

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing during sitemap generation')
    return staticRoutes
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Fetch dynamic post pages
  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: posts } = await supabase
      .from('published_pages')
      .select('id, created_at')

    if (posts) {
      postRoutes = posts.map((post) => ({
        url: `${baseUrl}/yazi/${post.id}`,
        lastModified: post.created_at ? new Date(post.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
  }

  // Fetch dynamic category pages
  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug, created_at')

    if (categories) {
      categoryRoutes = categories.map((category) => ({
        url: `${baseUrl}/kategori/${category.slug || category.id}`,
        lastModified: category.created_at ? new Date(category.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  return [...staticRoutes, ...postRoutes, ...categoryRoutes]
}
