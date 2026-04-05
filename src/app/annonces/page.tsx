import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import SearchFilters from '@/components/listings/SearchFilters'
import type { Listing } from '@/types'

const PAGE_SIZE = 12

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AnnoncesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*, listing_images(*)', { count: 'exact' })
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at',  { ascending: false })
    .range(from, to)

  if (params.type)        query = query.eq('type', params.type)
  if (params.transaction) query = query.eq('transaction', params.transaction)
  if (params.wilaya)      query = query.eq('wilaya', params.wilaya)
  if (params.price_min)   query = query.gte('price', Number(params.price_min))
  if (params.price_max)   query = query.lte('price', Number(params.price_max))
  if (params.rooms_min)   query = query.gte('rooms', Number(params.rooms_min))
  if (params.q)           query = query.ilike('title', `%${params.q}%`)

  const { data: listings, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const hasFilters = ['type', 'transaction', 'wilaya', 'price_min', 'price_max', 'rooms_min', 'q'].some(k => params[k])

  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)' }}>

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="bg-white border-b sticky top-0 z-20" style={{ borderColor: 'var(--border)', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-4">

          <Link href="/" className="font-serif text-xl font-bold shrink-0" style={{ color: 'var(--navy)' }}>
            Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
          </Link>

          {/* Search */}
          <form method="GET" action="/annonces" className="flex-1 max-w-xl">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text" name="q" defaultValue={params.q ?? ''}
                placeholder="Rechercher : ville, type de bien..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--sand)' }}
              />
              {params.type        && <input type="hidden" name="type"        value={params.type} />}
              {params.transaction && <input type="hidden" name="transaction" value={params.transaction} />}
              {params.wilaya      && <input type="hidden" name="wilaya"      value={params.wilaya} />}
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-500 ml-2">
            <Link href="/annonces" className="hover:text-[var(--navy)] transition-colors font-medium" style={{ color: 'var(--navy)' }}>Annonces</Link>
            <Link href="/auth/login" className="hover:text-[var(--navy)] transition-colors">Se connecter</Link>
          </nav>

          <Link
            href="/annonces/nouvelle"
            className="shrink-0 ml-auto px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--terracotta)' }}
          >
            + Publier
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex gap-7 items-start">

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 12px rgba(26,39,68,0.07)' }}>
              <Suspense>
                <SearchFilters />
              </Suspense>
            </div>
          </aside>

          {/* ── Résultats ───────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* En-tête résultats */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--navy)' }}>
                  {count ?? 0} annonce{(count ?? 0) > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-400">
                  {hasFilters ? 'avec les filtres sélectionnés' : 'disponibles en Algérie'}
                </p>
              </div>
              <select className="text-sm border rounded-xl px-3 py-2 outline-none bg-white" style={{ borderColor: 'var(--border)' }}>
                <option>Plus récentes</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
              </select>
            </div>

            {/* Grille */}
            {listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {(listings as Listing[]).map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--navy)' }}>
                  {hasFilters ? 'Aucun résultat' : 'Aucune annonce'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {hasFilters ? 'Essayez d\'élargir vos critères.' : 'Soyez le premier à publier !'}
                </p>
                <Link
                  href={hasFilters ? '/annonces' : '/annonces/nouvelle'}
                  className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: hasFilters ? 'var(--navy)' : 'var(--terracotta)' }}
                >
                  {hasFilters ? 'Voir toutes les annonces' : '+ Publier une annonce'}
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                {page > 1 && (
                  <PaginationLink href={buildUrl(params, page - 1)} label="← Précédent" />
                )}
                <span className="text-sm text-gray-400 px-2">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <PaginationLink href={buildUrl(params, page + 1)} label="Suivant →" primary />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function buildUrl(params: Record<string, string | undefined>, page: number) {
  const next = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v && k !== 'page') next.set(k, v) })
  next.set('page', String(page))
  return `/annonces?${next.toString()}`
}

function PaginationLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
      style={primary
        ? { background: 'var(--navy)', color: 'white', borderColor: 'var(--navy)' }
        : { background: 'white', color: 'var(--navy)', borderColor: 'var(--border)' }
      }
    >
      {label}
    </Link>
  )
}
