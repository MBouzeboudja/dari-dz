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

    </div>
  )
}
