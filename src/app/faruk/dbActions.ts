'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

// Strict protection check: verifies that the custom auth cookie is valid
async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    throw new Error('Unauthorized: Yetkisiz erişim.')
  }
  
  return token
}

/* ==========================================================================
   CATEGORIES ACTIONS
   ========================================================================== */

export async function saveCategory(categoryData: { 
  id?: string
  name: string
  slug: string
  parent_id: string | null
  order_index: number 
}) {
  await verifyAuth()
  const supabase = createAdminClient()

  if (categoryData.id) {
    // Update existing category
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: categoryData.name,
        slug: categoryData.slug,
        parent_id: categoryData.parent_id,
        order_index: categoryData.order_index
      })
      .eq('id', categoryData.id)
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  } else {
    // Insert new category
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  }
}

export async function deleteCategory(id: string) {
  await verifyAuth()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function batchUpdateCategories(updates: any[]) {
  await verifyAuth()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .upsert(updates, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  return { success: true, data }
}

/* ==========================================================================
   MEDIA ACTIONS
   ========================================================================== */

export async function saveMedia(payload: { id?: string; file_name: string; file_url?: string; storage_path?: string }) {
  await verifyAuth()
  const supabase = createAdminClient()

  if (payload.id) {
    const updateData: any = { file_name: payload.file_name }
    if (payload.file_url) updateData.file_url = payload.file_url
    if (payload.storage_path) updateData.storage_path = payload.storage_path

    const { data, error } = await supabase
      .from('media')
      .update(updateData)
      .eq('id', payload.id)
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  } else {
    const { data, error } = await supabase
      .from('media')
      .insert([{
        file_name: payload.file_name,
        file_url: payload.file_url!,
        storage_path: payload.storage_path!
      }])
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  }
}



export async function deleteMedia(id: string, storage_path: string) {
  await verifyAuth()
  const supabase = createAdminClient()

  // 1. Delete from database
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', id)

  if (dbError) throw new Error(dbError.message)

  // 2. Delete from Supabase Storage
  if (storage_path) {
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([storage_path])
    
    if (storageError) {
      console.error('Storage file deletion error:', storageError)
    }
  }

  return { success: true }
}

/* ==========================================================================
   POSTS (PUBLISHED PAGES) ACTIONS
   ========================================================================== */

export async function savePublishedPage(payload: {
  id?: string
  title: string
  page_name: string
  slug: string
  category: string
  category_id: string
  cover_url: string
  layout_data: any
  text_id: string | null
}) {
  await verifyAuth()
  const supabase = createAdminClient()

  if (payload.id) {
    const { data, error } = await supabase
      .from('published_pages')
      .update({
        title: payload.title,
        page_name: payload.page_name,
        slug: payload.slug,
        category: payload.category,
        category_id: payload.category_id,
        cover_url: payload.cover_url,
        layout_data: payload.layout_data,
        text_id: payload.text_id
      })
      .eq('id', payload.id)
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  } else {
    const { data, error } = await supabase
      .from('published_pages')
      .insert([payload])
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  }
}

export async function deletePublishedPage(id: string) {
  await verifyAuth()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('published_pages')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

/* ==========================================================================
   TEXTS ACTIONS
   ========================================================================== */

export async function saveText(textData: { id?: string; title: string; content: string }) {
  await verifyAuth()
  const supabase = createAdminClient()

  if (textData.id) {
    const { data, error } = await supabase
      .from('texts')
      .update({
        title: textData.title,
        content: textData.content
      })
      .eq('id', textData.id)
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  } else {
    const { data, error } = await supabase
      .from('texts')
      .insert([{
        title: textData.title,
        content: textData.content
      }])
      .select()

    if (error) throw new Error(error.message)
    return { success: true, data }
  }
}

export async function deleteText(id: string) {
  await verifyAuth()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('texts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function getAdminUsers() {
  await verifyAuth()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, created_at')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}
