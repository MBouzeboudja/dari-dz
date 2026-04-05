'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

interface Props {
  userId: string
  initialName: string
  initialPhone: string
  initialRole: UserRole
  email: string
  memberSince: string
}

export default function ProfileForm({ userId, initialName, initialPhone, initialRole, email, memberSince }: Props) {
  const router = useRouter()
  const [name, setName]   = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [role, setRole]   = useState<UserRole>(initialRole)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError]     = useState('')

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), phone: phone.trim() || null, role })
      .eq('id', userId)

    if (error) {
      setError('Impossible de sauvegarder les modifications.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwError('')
    setPwSuccess(false)

    if (newPassword.length < 6) {
      setPwError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      setPwLoading(false)
      return
    }

    const supabase = createClient()

    // Re-authenticate first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (signInError) {
      setPwError('Mot de passe actuel incorrect.')
      setPwLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      setPwError('Impossible de modifier le mot de passe.')
      setPwLoading(false)
      return
    }

    setPwSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setPwLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* ── Informations du compte ── */}
      <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Informations du compte</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Email (lecture seule) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>
            <div className="border rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 select-all" style={{ borderColor: 'var(--border)' }}>
              {email}
            </div>
            <p className="text-xs text-gray-400">L&apos;email ne peut pas être modifié.</p>
          </div>

          {/* Membre depuis */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Membre depuis
            </label>
            <div className="border rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400" style={{ borderColor: 'var(--border)' }}>
              {memberSince}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modifier le profil ── */}
      <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Modifier le profil</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="px-6 py-5 flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom"
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
              Type de compte
            </label>
            <div className="flex gap-3">
              {(['particulier', 'agence'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all capitalize"
                  style={{
                    borderColor: role === r ? 'var(--terracotta)' : 'var(--border)',
                    background:  role === r ? 'rgba(192,94,60,0.08)' : 'white',
                    color:       role === r ? 'var(--terracotta)' : 'var(--navy)',
                  }}
                >
                  {r === 'particulier' ? '👤 Particulier' : '🏢 Agence'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm border rounded-lg px-3 py-2" style={{ color: 'var(--error)', background: 'var(--error-bg)', borderColor: 'var(--error)' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm border rounded-lg px-3 py-2" style={{ color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'var(--success)' }}>
              Profil mis à jour avec succès.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--terracotta)' }}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>

        </form>
      </div>

      {/* ── Changer le mot de passe ── */}
      <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Changer le mot de passe</h2>
        </div>
        <form onSubmit={handleChangePassword} className="px-6 py-5 flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ borderColor: 'var(--border)' }}
            />
            <p className="text-xs text-gray-400">Minimum 6 caractères.</p>
          </div>

          {pwError && (
            <p className="text-sm border rounded-lg px-3 py-2" style={{ color: 'var(--error)', background: 'var(--error-bg)', borderColor: 'var(--error)' }}>
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="text-sm border rounded-lg px-3 py-2" style={{ color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'var(--success)' }}>
              Mot de passe modifié avec succès.
            </p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--navy)' }}
          >
            {pwLoading ? 'Modification...' : 'Modifier le mot de passe'}
          </button>

        </form>
      </div>

    </div>
  )
}
