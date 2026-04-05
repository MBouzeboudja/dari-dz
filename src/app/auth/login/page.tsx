'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--sand)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold" style={{ color: 'var(--navy)' }}>
            Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: 'var(--border)' }}>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-terracotta transition-colors"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            {error && (
              <p className="text-sm border rounded-lg px-3 py-2" style={{ color: 'var(--error)', background: 'var(--error-bg)', borderColor: 'var(--error)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--terracotta)' }}
            >
              {loading && (
                <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{' '}
          <Link href="/auth/signup" className="font-semibold" style={{ color: 'var(--terracotta)' }}>
            S&apos;inscrire
          </Link>
        </p>

      </div>
    </div>
  )
}
