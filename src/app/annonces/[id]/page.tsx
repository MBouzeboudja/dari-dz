import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ContactForm from './ContactForm'
import Gallery from './Gallery'

const TYPE_LABEL: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa / Maison', studio: 'Studio',
  terrain: 'Terrain', local: 'Local commercial', bureau: 'Bureau',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AnnonceDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch annonce + images + profil vendeur
  const { data: listing } = await supabase
    .from('listings')
    .select('*, listing_images(*), profiles(name, phone, role)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  // Incrémenter les vues (fire and forget)
  supabase.from('listings').update({ views_count: (listing.views_count ?? 0) + 1 }).eq('id', id)

  const images = listing.listing_images ?? []
  const seller = listing.profiles as { name: string; phone: string; role: string } | null

  const features = [
    listing.surface   && { label: 'Surface',    value: `${listing.surface} m²` },
    listing.rooms     && { label: 'Pièces',      value: String(listing.rooms) },
    listing.bathrooms && { label: 'Salles de bain', value: String(listing.bathrooms) },
    { label: 'Type',        value: TYPE_LABEL[listing.type] ?? listing.type },
    { label: 'Transaction', value: listing.transaction === 'vente' ? 'À vendre' : 'À louer' },
    { label: 'Wilaya',      value: listing.wilaya },
    { label: 'Commune',     value: listing.commune },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)' }}>

      {/* ── Navbar ── */}
      <header className="bg-white border-b sticky top-0 z-20" style={{ borderColor: 'var(--border)', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link href="/" className="font-serif text-xl font-bold" style={{ color: 'var(--navy)' }}>
            Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
          </Link>
          <Link href="/annonces" className="text-sm text-gray-400 hover:text-gray-600 transition-colors ml-2">
            ← Retour aux annonces
          </Link>
          <Link href="/annonces/nouvelle" className="ml-auto shrink-0 px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'var(--terracotta)' }}>
            + Publier
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex gap-8 items-start flex-col lg:flex-row">

          {/* ── Colonne principale ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Galerie photos */}
            <Gallery images={images} title={listing.title} type={listing.type} />

            {/* Titre & prix */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                  style={{ background: listing.transaction === 'vente' ? 'var(--navy)' : '#2D6A4F' }}
                >
                  {listing.transaction === 'vente' ? 'À vendre' : 'À louer'}
                </span>
                <span className="text-xs text-gray-400">
                  {listing.views_count} vue{listing.views_count > 1 ? 's' : ''} · Publié le {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h1 className="font-serif text-2xl font-bold mb-2 leading-snug" style={{ color: 'var(--navy)' }}>
                {listing.title}
              </h1>

              <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {listing.adresse ? `${listing.adresse}, ` : ''}{listing.commune}, {listing.wilaya}
              </p>

              <div className="font-serif text-3xl font-bold" style={{ color: 'var(--terracotta)' }}>
                {Number(listing.price).toLocaleString('fr-DZ')} DA
                {listing.transaction === 'location' && (
                  <span className="text-base font-sans font-normal text-gray-400"> / mois</span>
                )}
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
              <h2 className="font-bold text-base mb-4" style={{ color: 'var(--navy)' }}>Caractéristiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {features.map(f => (
                  <div key={f.label} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: 'var(--sand)' }}>
                    <span className="text-xs text-gray-400 font-medium">{f.label}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
              <h2 className="font-bold text-base mb-4" style={{ color: 'var(--navy)' }}>Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

          </div>

          {/* ── Sidebar vendeur + contact ── */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 lg:sticky lg:top-24">

            {/* Infos vendeur */}
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--navy)' }}>
                  {seller?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{seller?.name ?? 'Vendeur'}</p>
                  <p className="text-xs text-gray-400 capitalize">{seller?.role ?? 'particulier'}</p>
                </div>
              </div>

              {/* Bouton appel direct */}
              {seller?.phone && (
                <a
                  href={`tel:${seller.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-sm mb-3 transition-opacity hover:opacity-90"
                  style={{ background: '#2D6A4F' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l1.06-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z"/>
                  </svg>
                  Appeler le vendeur
                </a>
              )}

              <p className="text-xs text-center text-gray-400">ou envoyez un message ci-dessous</p>
            </div>

            {/* Formulaire de contact */}
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
              <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--navy)' }}>Envoyer un message</h2>
              <ContactForm listingId={listing.id} />
            </div>

            {/* Signaler */}
            <p className="text-center text-xs text-gray-400">
              <button className="underline hover:text-gray-600 transition-colors">Signaler cette annonce</button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
