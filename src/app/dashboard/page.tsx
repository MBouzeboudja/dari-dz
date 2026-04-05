import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: myListings } = await supabase
    .from('listings')
    .select('id, status, views_count, title, price, transaction, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const listings = myListings ?? []
  const ids = listings.map(l => l.id)

  const { data: recentContacts } = await supabase
    .from('contacts')
    .select('id, name, created_at, listing_id')
    .in('listing_id', ids.length > 0 ? ids : ['none'])
    .order('created_at', { ascending: false })
    .limit(5)

  const totalViews  = listings.reduce((s, l) => s + (l.views_count ?? 0), 0)
  const activeCount = listings.filter(l => l.status === 'active').length

  const stats = [
    { label: 'Annonces actives', value: activeCount,              color: 'var(--navy)',        bg: 'var(--sand)' },
    { label: 'Vues totales',     value: totalViews,               color: '#2D6A4F',            bg: '#E8FBF0' },
    { label: 'Messages reçus',   value: recentContacts?.length ?? 0, color: 'var(--terracotta)', bg: '#F0D5C8' },
    { label: 'En attente',       value: listings.filter(l => l.status === 'pending').length, color: '#B8922A', bg: '#F5E6C0' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">{s.label}</p>
            <p className="font-serif text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Annonces récentes */}
        <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Mes annonces</h2>
            <Link href="/dashboard/annonces" className="text-xs font-semibold" style={{ color: 'var(--terracotta)' }}>Voir tout →</Link>
          </div>

          {listings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-sm mb-4">Aucune annonce publiée.</p>
              <Link href="/annonces/nouvelle" className="inline-block px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'var(--terracotta)' }}>
                + Créer une annonce
              </Link>
            </div>
          ) : (
            <div>
              {listings.slice(0, 5).map(l => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0 hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--navy)' }}>{l.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Number(l.price).toLocaleString('fr-DZ')} DA{l.transaction === 'location' ? '/mois' : ''}
                      &nbsp;·&nbsp;{l.views_count ?? 0} vue{(l.views_count ?? 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                  <Link href={`/annonces/${l.id}`} className="text-gray-300 hover:text-gray-500 ml-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers messages */}
        <div className="bg-white rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Derniers messages</h2>
            <Link href="/dashboard/messages" className="text-xs font-semibold" style={{ color: 'var(--terracotta)' }}>Voir tout →</Link>
          </div>

          {!recentContacts || recentContacts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-sm">Aucun message reçu pour l&apos;instant.</p>
            </div>
          ) : (
            <div>
              {recentContacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'var(--navy)' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--navy)' }}>{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Link href="/dashboard/messages" className="text-gray-300 hover:text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active:  { label: 'Actif',      bg: '#E8FBF0', color: '#2D6A4F' },
    pending: { label: 'En attente', bg: '#F5E6C0', color: '#B8922A' },
    sold:    { label: 'Vendu',      bg: '#F0F0F0', color: '#6B7280' },
    expired: { label: 'Expiré',     bg: '#FBE8E8', color: '#A32D2D' },
  }
  const s = map[status] ?? map.active
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}
