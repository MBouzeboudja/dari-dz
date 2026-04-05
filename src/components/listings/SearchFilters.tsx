'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { WILAYAS, LISTING_TYPES } from '@/lib/constants'

export default function SearchFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    value ? next.set(key, value) : next.delete(key)
    next.delete('page')
    router.push(`/annonces?${next.toString()}`)
  }, [params, router])

  const hasFilters = ['type', 'transaction', 'wilaya', 'price_min', 'price_max', 'rooms_min'].some(k => params.has(k))
  const get = (k: string) => params.get(k) ?? ''

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--navy)' }}>Filtres</h2>
        {hasFilters && (
          <button onClick={() => router.push('/annonces')} className="text-xs font-medium underline" style={{ color: 'var(--terracotta)' }}>
            Tout effacer
          </button>
        )}
      </div>

      {/* Transaction */}
      <Group label="Transaction">
        <div className="grid grid-cols-3 gap-1.5">
          {[{ v: '', l: 'Toutes' }, { v: 'vente', l: 'Vente' }, { v: 'location', l: 'Location' }].map(o => (
            <button key={o.v} onClick={() => update('transaction', o.v)}
              className="py-2 rounded-xl text-xs font-semibold border transition-all"
              style={{ background: get('transaction') === o.v ? 'var(--navy)' : 'white', color: get('transaction') === o.v ? 'white' : 'var(--navy)', borderColor: get('transaction') === o.v ? 'var(--navy)' : 'var(--border)' }}>
              {o.l}
            </button>
          ))}
        </div>
      </Group>

      {/* Type */}
      <Group label="Type de bien">
        <div className="flex flex-col gap-1">
          <FilterOption label="Tous les types" active={!get('type')} onClick={() => update('type', '')} />
          {LISTING_TYPES.map(t => (
            <FilterOption key={t.value} label={t.label} active={get('type') === t.value} onClick={() => update('type', t.value)} />
          ))}
        </div>
      </Group>

      {/* Wilaya */}
      <Group label="Wilaya">
        <div className="relative">
          <select value={get('wilaya')} onChange={e => update('wilaya', e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none appearance-none bg-white pr-8 transition-colors"
            style={{ borderColor: 'var(--border)', color: get('wilaya') ? 'var(--navy)' : '#9CA3AF' }}>
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </Group>

      {/* Prix */}
      <Group label="Budget (DA)">
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" value={get('price_min')} min="0"
            onChange={e => update('price_min', e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors bg-white"
            style={{ borderColor: 'var(--border)' }} />
          <span className="text-gray-300 text-lg shrink-0">—</span>
          <input type="number" placeholder="Max" value={get('price_max')} min="0"
            onChange={e => update('price_max', e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors bg-white"
            style={{ borderColor: 'var(--border)' }} />
        </div>
      </Group>

      {/* Pièces */}
      <Group label="Pièces minimum">
        <div className="flex gap-1.5">
          {['', '1', '2', '3', '4', '5+'].map(n => (
            <button key={n} onClick={() => update('rooms_min', n === '5+' ? '5' : n)}
              className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
              style={{
                background: (n === '5+' ? get('rooms_min') === '5' : get('rooms_min') === n) ? 'var(--terracotta)' : 'white',
                color:      (n === '5+' ? get('rooms_min') === '5' : get('rooms_min') === n) ? 'white' : 'var(--navy)',
                borderColor:(n === '5+' ? get('rooms_min') === '5' : get('rooms_min') === n) ? 'var(--terracotta)' : 'var(--border)',
              }}>
              {n === '' ? 'Ts' : n}
            </button>
          ))}
        </div>
      </Group>
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      {children}
    </div>
  )
}

function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all text-left"
      style={{ background: active ? 'var(--sand)' : 'transparent', color: active ? 'var(--navy)' : '#6B7280', fontWeight: active ? 600 : 400 }}>
      {label}
      {active && <span style={{ color: 'var(--terracotta)', fontSize: '16px' }}>✓</span>}
    </button>
  )
}
