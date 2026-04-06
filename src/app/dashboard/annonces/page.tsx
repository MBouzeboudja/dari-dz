import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingActions from './ListingActions'
import StatusBadge from '@/components/StatusBadge'

export default async function MesAnnoncesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(url, is_primary)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const TYPE_EMOJI: Record<string, string> = {
    appartement: '🏢', villa: '🏠', studio: '🛋️',
    terrain: '🌿', local: '🏪', bureau: '🏛️',
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: 'var(--navy)' }}>Mes annonces</h1>
          <p className="text-sm text-gray-400">{listings?.length ?? 0} annonce{(listings?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Link href="/annonces/nouvelle" className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'var(--terracotta)' }}>
          + Nouvelle annonce
        </Link>
      </div>

      {/* Liste */}
      {!listings || listings.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <div className="text-5xl mb-4">📋</div>
          <p className="font-bold mb-2" style={{ color: 'var(--navy)' }}>Aucune annonce</p>
          <p className="text-sm text-gray-400 mb-6">Publiez votre première annonce gratuitement.</p>
          <Link href="/annonces/nouvelle" className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'var(--terracotta)' }}>
            + Créer une annonce
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map(listing => {
            const img = listing.listing_images?.find((i: { is_primary: boolean }) => i.is_primary) ?? listing.listing_images?.[0]
            return (
              <div key={listing.id} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
                <div className="flex gap-4 p-4">

                  {/* Vignette */}
                  <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl" style={{ background: 'var(--sand)' }}>
                    {img?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{TYPE_EMOJI[listing.type] ?? '🏠'}</span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--navy)' }}>{listing.title}</h3>
                      <StatusBadge status={listing.status} />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {listing.commune}, {listing.wilaya} · {Number(listing.price).toLocaleString('fr-DZ')} DA{listing.transaction === 'location' ? '/mois' : ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>👁 {listing.views_count ?? 0} vues</span>
                      <span>📅 {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}</span>
                      <span>⏳ expire {new Date(listing.expires_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative flex border-t" style={{ borderColor: 'var(--border)' }}>
                  <Link href={`/annonces/${listing.id}`} className="flex-1 text-center py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-r" style={{ borderColor: 'var(--border)' }}>
                    👁 Voir
                  </Link>
                  <Link href={`/dashboard/annonces/${listing.id}/modifier`} className="flex-1 text-center py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-r" style={{ borderColor: 'var(--border)' }}>
                    ✏️ Modifier
                  </Link>
                  <ListingActions listingId={listing.id} status={listing.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

