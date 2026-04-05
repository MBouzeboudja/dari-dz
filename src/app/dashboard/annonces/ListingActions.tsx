'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { listingId: string; status: string }

export default function ListingActions({ listingId, status }: Props) {
  const router = useRouter()

  async function markAsSold() {
    if (!confirm('Marquer cette annonce comme vendue / louée ?')) return
    const supabase = createClient()
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId)
    router.refresh()
  }

  async function deleteListing() {
    if (!confirm('Supprimer définitivement cette annonce ?')) return
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', listingId)
    router.refresh()
  }

  return (
    <>
      {status === 'active' && (
        <button onClick={markAsSold} className="flex-1 text-center py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-r" style={{ borderColor: 'var(--border)' }}>
          ✅ Vendu
        </button>
      )}
      <button onClick={deleteListing} className="flex-1 text-center py-2.5 text-xs font-medium hover:bg-red-50 transition-colors" style={{ color: '#A32D2D' }}>
        🗑 Supprimer
      </button>
    </>
  )
}
