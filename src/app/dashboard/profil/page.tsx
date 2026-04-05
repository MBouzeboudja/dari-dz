import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import type { UserRole } from '@/types'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone, role, created_at')
    .eq('id', user.id)
    .single()

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="flex flex-col gap-6">

      {/* En-tête */}
      <div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--navy)' }}>Mon profil</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez vos informations personnelles et la sécurité de votre compte.</p>
      </div>

      <ProfileForm
        userId={user.id}
        initialName={profile?.name ?? ''}
        initialPhone={profile?.phone ?? ''}
        initialRole={(profile?.role as UserRole) ?? 'particulier'}
        email={user.email ?? ''}
        memberSince={memberSince}
      />

      {/* ── Déconnexion ── */}
      <div className="bg-white rounded-2xl border max-w-2xl" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Session</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 mb-4">Vous êtes connecté en tant que <span className="font-semibold" style={{ color: 'var(--navy)' }}>{user.email}</span>.</p>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              style={{ borderColor: 'var(--border)', color: '#6B7280' }}
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
