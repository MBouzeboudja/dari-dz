import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardMobileNav from '@/components/DashboardMobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  // Nombre de messages non lus (approximatif — tous les contacts reçus)
  const { count: msgCount } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .in('listing_id',
      (await supabase.from('listings').select('id').eq('user_id', user.id)).data?.map(l => l.id) ?? []
    )

  const navItems = [
    { href: '/dashboard',          label: 'Vue d\'ensemble', shortLabel: 'Accueil',   icon: '▦' },
    { href: '/dashboard/annonces', label: 'Mes annonces',    shortLabel: 'Annonces',  icon: '📋' },
    { href: '/dashboard/messages', label: 'Messages',        shortLabel: 'Messages',  icon: '💬', badge: msgCount ?? 0 },
    { href: '/dashboard/profil',   label: 'Mon profil',      shortLabel: 'Profil',    icon: '👤' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sand)' }}>

      {/* ── Top bar ── */}
      <header className="bg-white border-b sticky top-0 z-20" style={{ borderColor: 'var(--border)', boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-xl font-bold" style={{ color: 'var(--navy)' }}>
              Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
            </Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <span className="text-sm text-gray-500 hidden sm:block">Tableau de bord</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/annonces/nouvelle"
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--terracotta)' }}
            >
              + Nouvelle annonce
            </Link>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--navy)' }}>
              {profile?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-5 py-8 gap-7">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col gap-1 w-56 shrink-0">
          <div className="bg-white rounded-2xl p-4 border mb-4" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--navy)' }}>
                {profile?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--navy)' }}>{profile?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <div className="mt-auto pt-4">
            <form action="/auth/logout" method="POST">
              <button type="submit" className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-white transition-all">
                ← Déconnexion
              </button>
            </form>
          </div>
        </aside>

        {/* ── Contenu ── */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Nav mobile (bottom bar) ── */}
      <DashboardMobileNav items={navItems} />
    </div>
  )
}

// NavLink as server component using pathname workaround
function NavLink({ href, label, icon, badge }: { href: string; label: string; icon: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white"
      style={{ color: 'var(--navy)' }}
    >
      <span className="flex items-center gap-2.5">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs text-white px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--terracotta)' }}>
          {badge}
        </span>
      )}
    </Link>
  )
}
