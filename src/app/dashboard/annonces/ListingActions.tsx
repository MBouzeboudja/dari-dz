'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { listingId: string; status: string }

type State = 'idle' | 'confirm-sold' | 'confirm-delete' | 'loading-sold' | 'loading-delete'

function Spinner() {
  return (
    <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export default function ListingActions({ listingId, status }: Props) {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')

  async function confirmSold() {
    setState('loading-sold')
    const supabase = createClient()
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId)
    router.refresh()
  }

  async function confirmDelete() {
    setState('loading-delete')
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', listingId)
    router.refresh()
  }

  const busy = state === 'loading-sold' || state === 'loading-delete'
  const borderStyle = { borderColor: 'var(--border)' }

  /* ── Confirmation inline vendu ── */
  if (state === 'confirm-sold') {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-l" style={{ ...borderStyle, background: 'var(--success-bg)' }}>
        <span className="text-xs font-medium shrink-0" style={{ color: 'var(--success)' }}>Marquer vendu ?</span>
        <button onClick={confirmSold}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white transition-colors"
          style={{ background: 'var(--success)' }}>
          Oui
        </button>
        <button onClick={() => setState('idle')}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 bg-white border hover:bg-gray-50 transition-colors" style={borderStyle}>
          Non
        </button>
      </div>
    )
  }

  /* ── Confirmation inline suppression ── */
  if (state === 'confirm-delete') {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-l" style={{ ...borderStyle, background: 'var(--error-bg)' }}>
        <span className="text-xs font-medium shrink-0" style={{ color: 'var(--error)' }}>Supprimer ?</span>
        <button onClick={confirmDelete}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white transition-colors"
          style={{ background: 'var(--error)' }}>
          Oui
        </button>
        <button onClick={() => setState('idle')}
          className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 bg-white border hover:bg-gray-50 transition-colors" style={borderStyle}>
          Non
        </button>
      </div>
    )
  }

  /* ── État normal ── */
  return (
    <>
      {status === 'active' && (
        <button
          onClick={() => setState('confirm-sold')}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-l disabled:opacity-40"
          style={borderStyle}
        >
          {state === 'loading-sold' ? <Spinner /> : '✅'} Vendu
        </button>
      )}
      <button
        onClick={() => setState('confirm-delete')}
        disabled={busy}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-red-50 transition-colors border-l disabled:opacity-40"
        style={{ borderColor: 'var(--border)', color: 'var(--error)' }}
      >
        {state === 'loading-delete' ? <Spinner /> : '🗑'} Supprimer
      </button>
    </>
  )
}
