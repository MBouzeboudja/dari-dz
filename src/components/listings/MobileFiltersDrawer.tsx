'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import SearchFilters from './SearchFilters'

function Drawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col"
        style={{ maxHeight: '85vh', boxShadow: '0 -4px 24px rgba(26,39,68,0.15)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Filtres</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters (scrollable) */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <Suspense>
            <SearchFilters />
          </Suspense>
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--navy)' }}
          >
            Voir les résultats
          </button>
        </div>
      </div>
    </>
  )
}

export default function MobileFiltersDrawer() {
  const [open, setOpen] = useState(false)
  const params = useSearchParams()

  const activeCount = ['type', 'transaction', 'wilaya', 'price_min', 'price_max', 'rooms_min']
    .filter(k => params.has(k)).length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all"
        style={{
          borderColor: activeCount > 0 ? 'var(--navy)' : 'var(--border)',
          background:  activeCount > 0 ? 'var(--navy)' : 'white',
          color:       activeCount > 0 ? 'white' : 'var(--navy)',
        }}
      >
        {/* Filter icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        Filtres
        {activeCount > 0 && (
          <span
            className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--terracotta)', color: 'white' }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && <Drawer onClose={() => setOpen(false)} />}
    </>
  )
}
