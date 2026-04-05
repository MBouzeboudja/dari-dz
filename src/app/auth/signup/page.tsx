'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'particulier' | 'agence'>('particulier')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // 1. Créer le compte
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // transmis au trigger handle_new_user
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // 2. Mettre à jour le profil avec phone + role
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ phone, role })
        .eq('id', data.user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--sand)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold" style={{ color: 'var(--navy)' }}>
            Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">Créez votre compte gratuitement</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: 'var(--border)' }}>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">

            {/* Type de compte */}
            <div className="flex gap-2">
              {(['particulier', 'agence'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize"
                  style={{
                    background: role === r ? 'var(--navy)' : 'white',
                    color: role === r ? 'white' : 'var(--navy)',
                    borderColor: role === r ? 'var(--navy)' : 'var(--border)',
                  }}
                >
                  {r === 'particulier' ? '👤 Particulier' : '🏢 Agence'}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {role === 'agence' ? "Nom de l'agence" : 'Nom complet'}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'agence' ? 'Agence El Baraka' : 'Mohamed Benali'}
                required
                className="border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

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
                className="border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0555 00 00 00"
                className="border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
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
                placeholder="8 caractères minimum"
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
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              En créant un compte, vous acceptez nos conditions d&apos;utilisation.
            </p>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--terracotta)' }}>
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}
