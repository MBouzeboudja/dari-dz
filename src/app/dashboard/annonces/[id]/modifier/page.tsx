import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditForm from './EditForm'
import type { ListingType, TransactionType } from '@/types'

export default async function ModifierAnnoncePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('id', id)
    .single()

  if (!listing) notFound()
  if (listing.user_id !== user.id) redirect('/dashboard/annonces')

  const initial = {
    type:        listing.type        as ListingType,
    transaction: listing.transaction as TransactionType,
    wilaya:      listing.wilaya      ?? '',
    commune:     listing.commune     ?? '',
    adresse:     listing.adresse     ?? '',
    price:       String(listing.price ?? ''),
    surface:     listing.surface     ? String(listing.surface)   : '',
    rooms:       listing.rooms       ? String(listing.rooms)     : '',
    bathrooms:   listing.bathrooms   ? String(listing.bathrooms) : '',
    title:       listing.title       ?? '',
    description: listing.description ?? '',
  }

  const existingImages = (listing.listing_images ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--navy)' }}>Modifier l&apos;annonce</h1>
        <p className="text-sm text-gray-500 mt-1 truncate max-w-xl">{listing.title}</p>
      </div>

      <EditForm
        listingId={id}
        userId={user.id}
        initial={initial}
        existingImages={existingImages}
      />
    </div>
  )
}
