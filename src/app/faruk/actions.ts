'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// SHA-256 password hashing helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'true'

  if (!username || !password) {
    return { success: false, error: 'Lütfen kullanıcı adı ve şifre girin.' }
  }

  try {
    const supabase = createAdminClient()

    // Query admin_users table
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (error || !user) {
      console.error('Login error:', error)
      return { success: false, error: 'Kullanıcı adı veya şifre hatalı.' }
    }

    const hashedInput = hashPassword(password)
    const isValid = user.password === password || user.password === hashedInput

    if (!isValid) {
      return { success: false, error: 'Kullanıcı adı veya şifre hatalı.' }
    }

    // Set HTTP-only auth cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'auth_token',
      value: username,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined, // 30 days or session-only
      sameSite: 'lax',
    })

    return { success: true }
  } catch (err: any) {
    console.error('Kritik Giriş Hatası:', err)
    return { success: false, error: 'Sunucuda beklenmeyen bir hata oluştu.' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}

export async function createUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { success: false, error: 'Lütfen tüm alanları doldurun.' }
  }

  try {
    const supabase = createAdminClient()

    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existingUser) {
      return { success: false, error: 'Bu kullanıcı adı zaten alınmış.' }
    }

    const { error } = await supabase
      .from('admin_users')
      .insert([{ username, password }])

    if (error) {
      console.error('Error inserting admin user:', error)
      return { success: false, error: `Kullanıcı eklenemedi: ${error.message}` }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Kullanıcı Ekleme Hatası:', err)
    return { success: false, error: 'Sunucuda beklenmeyen bir hata oluştu.' }
  }
}
