"use client"

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifre girin.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      formData.append('rememberMe', rememberMe ? 'true' : 'false')

      const result = await login(null, formData)
      
      if (result.success) {
        // Force router refresh so layouts check the new cookie
        router.refresh()
        router.push('/faruk/publish')
      } else {
        setError(result.error || 'Giriş yapılamadı.')
      }
    })
  }

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Logo/Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-2xl mb-4">
          R
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wider mb-2">
          Radyle Panel
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
          İçerik Yönetim Sistemi Girişi
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 p-8 rounded-[2.5rem] shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-2xl text-center">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı yazın"
                disabled={isPending}
                className="w-full bg-gray-50 border border-gray-100 focus:border-black text-sm text-gray-900 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi yazın"
                disabled={isPending}
                className="w-full bg-gray-50 border border-gray-100 focus:border-black text-sm text-gray-900 rounded-2xl py-3.5 pl-11 pr-12 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between px-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isPending}
                className="w-4 h-4 bg-gray-50 border border-gray-200 rounded text-black focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider group-hover:text-gray-900 transition-colors">
                Beni Hatırla
              </span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-[0.25em] py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Giriş Yap'
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
