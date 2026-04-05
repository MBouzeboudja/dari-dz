import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myListings } = await supabase
    .from('listings').select('id, title').eq('user_id', user.id)

  const ids = myListings?.map(l => l.id) ?? []

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .in('listing_id', ids.length > 0 ? ids : ['none'])
    .order('created_at', { ascending: false })

  const listingMap = Object.fromEntries((myListings ?? []).map(l => [l.id, l.title]))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-bold text-xl" style={{ color: 'var(--navy)' }}>Messages reçus</h1>
        <p className="text-sm text-gray-400">{contacts?.length ?? 0} message{(contacts?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <div className="text-5xl mb-4">💬</div>
          <p className="font-bold mb-2" style={{ color: 'var(--navy)' }}>Aucun message</p>
          <p className="text-sm text-gray-400">Les acheteurs intéressés vous contacteront ici.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>

              {/* En-tête */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: 'var(--navy)' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Link href={`/annonces/${c.listing_id}`} className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}>
                  Voir l&apos;annonce →
                </Link>
              </div>

              {/* Annonce concernée */}
              <p className="text-xs text-gray-400 mb-3 px-1">
                📋 {listingMap[c.listing_id] ?? 'Annonce supprimée'}
              </p>

              {/* Message */}
              <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--sand)', color: 'var(--navy)' }}>
                {c.message}
              </div>

              {/* Coordonnées */}
              <div className="flex gap-3 mt-3 flex-wrap">
                <a href={`tel:${c.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: '#2D6A4F' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l1.06-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z"/>
                  </svg>
                  {c.phone}
                </a>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50" style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}>
                    ✉️ {c.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
