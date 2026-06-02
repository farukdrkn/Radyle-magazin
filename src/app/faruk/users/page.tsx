"use client"

import React, { useState, useEffect, useTransition } from 'react'
import { createUser } from '../actions'
import { getAdminUsers } from '../dbActions'
import { Loader2, UserPlus, CheckCircle, AlertCircle, Users, User } from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  created_at: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  
  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching admin users:', err)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!username || !password) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const result = await createUser(null, formData)
      
      if (result.success) {
        setSuccess(true)
        setUsername('')
        setPassword('')
        // Refresh the user list
        fetchUsers()
      } else {
        setError(result.error || 'Kullanıcı eklenemedi.')
      }
    })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
          <Users size={36} className="text-black" />
          Kullanıcı Yönetimi
        </h1>
        <p className="text-gray-500 font-medium uppercase tracking-[0.3em] text-xs">
          Radyle yönetim paneli için yetkili listesini izleyin ve yeni editör ekleyin.
        </p>
      </header>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
        
        {/* Left Column: Users List */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 p-8 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2.5">
            <Users size={20} className="text-gray-400" />
            Mevcut Yetkililer
          </h2>

          {usersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {users.map((admin) => (
                <div 
                  key={admin.id} 
                  className="flex items-center gap-4 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 truncate">
                      {admin.username}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      Kayıt: {formatDate(admin.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider text-center py-12 border border-dashed border-gray-200 rounded-2xl">
              Yetkili kullanıcı bulunamadı.
            </p>
          )}
        </div>

        {/* Right Column: Add User Form */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 p-8 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2.5">
            <UserPlus size={20} className="text-gray-400" />
            Kullanıcı Ekle
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center gap-3">
                <CheckCircle size={18} className="shrink-0" />
                Yeni kullanıcı hesabı başarıyla oluşturuldu.
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Yeni kullanıcı adını yazın"
                disabled={isPending}
                className="w-full bg-gray-50 border border-gray-100 focus:border-black text-sm text-gray-900 rounded-2xl py-4 px-6 focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Güçlü bir şifre girin"
                disabled={isPending}
                className="w-full bg-gray-50 border border-gray-100 focus:border-black text-sm text-gray-900 rounded-2xl py-4 px-6 focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-[0.25em] py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-8"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Kullanıcı Oluştur'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
