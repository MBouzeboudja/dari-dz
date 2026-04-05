import Link from 'next/link'
import type { Listing } from '@/types'

const TYPE_EMOJI: Record<string, string> = {
  appartement: '🏢', villa: '🏠', studio: '🛋️',
  terrain: '🌿', local: '🏪', bureau: '🏛️',
}
const TYPE_BG: Record<string, string> = {
  appartement: '#E8F0FB', villa: '#FBF0E8', studio: '#F0E8FB',
  terrain: '#E8FBF0', local: '#FBE8E8', bureau: '#E8FBFB',
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const primary = listing.listing_images?.find(i => i.is_primary) ?? listing.listing_images?.[0]
  const hasRealImage = !!primary?.url && !primary.url.includes('undefined')

  return (
    <Link href={`/annonces/${listing.id}`} className="block group">
      <article className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl" style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.07)' }}>

        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          {hasRealImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={primary!.url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-300" style={{ background: TYPE_BG[listing.type] ?? '#F5EFE0' }}>
              <span style={{ fontSize: '2.8rem' }}>{TYPE_EMOJI[listing.type] ?? '🏠'}</span>
              <span className="text-xs font-medium capitalize" style={{ color: 'var(--navy)', opacity: 0.4 }}>{listing.type}</span>
            </div>
          )}

          {/* Badge */}
          <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ background: listing.transaction === 'vente' ? 'var(--navy)' : '#2D6A4F', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
            {listing.transaction === 'vente' ? 'Vente' : 'Location'}
          </span>

          {listing.listing_images && listing.listing_images.length > 1 && (
            <span className="absolute bottom-3 right-3 text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ background: 'rgba(0,0,0,0.55)' }}>
              📷 {listing.listing_images.length}
            </span>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="font-serif font-bold text-xl" style={{ color: 'var(--terracotta)' }}>
              {Number(listing.price).toLocaleString('fr-DZ')} DA
            </span>
            {listing.transaction === 'location' && <span className="text-xs text-gray-400">/mois</span>}
          </div>

          <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2" style={{ color: 'var(--navy)' }}>
            {listing.title}
          </h3>

          <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="truncate">{listing.commune}, {listing.wilaya}</span>
          </p>

          <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            {listing.surface  && <Chip label={`${listing.surface} m²`} />}
            {listing.rooms    && <Chip label={`${listing.rooms} pièces`} />}
            {listing.bathrooms && <Chip label={`${listing.bathrooms} sdb`} />}
            {!listing.surface && !listing.rooms && <Chip label={listing.type} />}
          </div>
        </div>
      </article>
    </Link>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: 'var(--sand)', color: 'var(--navy)' }}>
      {label}
    </span>
  )
}
