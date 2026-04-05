import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import Navbar from '@/components/Navbar'
import type { Listing } from '@/types'
import {WILAYAS} from "@/lib/constants";

// ─── Données statiques ────────────────────────────────────────
const CATEGORIES = [
  { type: 'appartement', label: 'Appartements', emoji: '🏢', color: '#E8F0FB' },
  { type: 'villa',       label: 'Villas',       emoji: '🏠', color: '#FBF0E8' },
  { type: 'terrain',     label: 'Terrains',     emoji: '🌿', color: '#E8FBF0' },
  { type: 'local',       label: 'Locaux',       emoji: '🏪', color: '#FBE8E8' },
  { type: 'bureau',      label: 'Bureaux',      emoji: '🏛️', color: '#E8FBFB' },
  { type: 'studio',      label: 'Studios',      emoji: '🛋️', color: '#F0E8FB' },
]

const TOP_WILAYAS = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tizi Ouzou', 'Béjaïa']

// ─── Page ─────────────────────────────────────────────────────
export default async function HomePage() {
  const supabase = await createClient()

  // Utilisateur connecté + stats globales
  const [{ data: { user } }, { count: totalListings }, { count: totalUsers }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  let navUser
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    const name = profile?.name ?? user.email ?? ''
    navUser = { name: name.split(' ')[0], initial: name.charAt(0).toUpperCase() }
  }

  // Annonces récentes à la une
  const { data: featured } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream, #FDFAF5)' }}>

      {/* ── Navbar ────────────────────────────────────────────── */}
      <Navbar user={navUser} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-5 overflow-hidden" style={{ background: 'var(--navy)' }}>
        {/* Fond décoratif */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(192,94,60,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(184,146,42,0.12) 0%, transparent 40%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,1) 30px, rgba(255,255,255,1) 31px)',
        }} />

        <div className="relative max-w-3xl mx-auto text-center pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6" style={{ background: 'rgba(192,94,60,0.2)', border: '1px solid rgba(192,94,60,0.35)', color: '#F0A882' }}>
            🇩🇿 N°1 de l&apos;immobilier en Algérie
          </div>

          <h1 className="font-serif text-white mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700 }}>
            Trouvez votre bien idéal<br />
            <span style={{ color: 'var(--terracotta)' }}>dans toute l&apos;Algérie</span>
          </h1>

          <p className="text-white/60 mb-10 text-base max-w-xl mx-auto">
            Appartements, villas, terrains, locaux — des milliers d&apos;annonces dans les 48 wilayas.
          </p>

          {/* Barre de recherche */}
          <form action="/annonces" method="GET">
            <div className="bg-white rounded-2xl p-2 flex gap-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg className="text-gray-300 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text" name="q"
                  placeholder="Wilaya, commune, type de bien..."
                  className="flex-1 text-sm outline-none py-2 bg-transparent"
                  style={{ color: 'var(--navy)' }}
                />
              </div>
              <div className="w-px my-2" style={{ background: 'var(--border)' }} />
              <select name="transaction" className="text-sm outline-none px-3 bg-transparent cursor-pointer" style={{ color: 'var(--navy)' }}>
                <option value="">Vente & Location</option>
                <option value="vente">À vendre</option>
                <option value="location">À louer</option>
              </select>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-bold shrink-0 transition-opacity hover:opacity-90" style={{ background: 'var(--terracotta)' }}>
                Rechercher
              </button>
            </div>
          </form>

          {/* Raccourcis wilayas */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {TOP_WILAYAS.map(w => (
              <Link key={w} href={`/annonces?wilaya=${w}`} className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {w}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--sand)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-5 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: `${(totalListings ?? 0).toLocaleString('fr-DZ')}+`, label: 'Annonces actives' },
            { value: WILAYAS.length, label: 'Wilayas couvertes' },
            { value: `${(totalUsers ?? 0).toLocaleString('fr-DZ')}+`, label: 'Utilisateurs inscrits' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-serif text-2xl font-bold" style={{ color: 'var(--navy)' }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catégories ────────────────────────────────────────── */}
      <section className="py-14 px-5">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow="Parcourir" title="Tous types de biens" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.type} href={`/annonces?type=${cat.type}`}
                className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[var(--terracotta)] group"
                style={{ background: 'white', borderColor: 'var(--border)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors" style={{ background: cat.color }}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--navy)' }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Annonces récentes ─────────────────────────────────── */}
      <section className="py-14 px-5" style={{ background: 'var(--sand)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <SectionHeader eyebrow="Dernières annonces" title="Publiées récemment" />
            <Link href="/annonces" className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--terracotta)' }}>
              Voir toutes →
            </Link>
          </div>

          {featured && featured.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featured as Listing[]).map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-gray-400 mb-4">Aucune annonce publiée pour l&apos;instant.</p>
              <Link href="/annonces/nouvelle" className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'var(--terracotta)' }}>
                Être le premier à publier
              </Link>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/annonces" className="inline-block px-6 py-3 rounded-xl border text-sm font-semibold transition-all hover:shadow-md" style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}>
              Voir toutes les annonces →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader eyebrow="Simple & gratuit" title="Comment ça marche ?" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {[
              { n: '01', title: 'Créez un compte', desc: 'Inscription gratuite en 2 minutes pour particuliers et agences.' },
              { n: '02', title: 'Publiez votre annonce', desc: 'Ajoutez photos, prix et localisation. Visible instantanément.' },
              { n: '03', title: 'Recevez des contacts', desc: 'Les acheteurs vous contactent directement par téléphone ou message.' },
              { n: '04', title: 'Concluez la vente', desc: 'Rencontrez les candidats et finalisez en toute confiance.' },
            ].map(step => (
              <div key={step.n} className="relative">
                <div className="font-serif text-5xl font-bold mb-3 leading-none" style={{ color: 'var(--terracotta-light, #F0D5C8)' }}>{step.n}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--navy)' }}>{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-5 relative overflow-hidden" style={{ background: 'var(--navy)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(192,94,60,0.2) 0%, transparent 60%)' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(192,94,60,0.8)' }}>
            Vous avez un bien à vendre ou louer ?
          </p>
          <h2 className="font-serif text-white text-3xl font-bold mb-4">
            Publiez gratuitement<br />votre annonce
          </h2>
          <p className="text-white/55 mb-8">
            Touchez des milliers d&apos;acheteurs et locataires dans toute l&apos;Algérie.<br />
            Gratuit pour les particuliers, sans commission.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth/signup" className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: 'var(--terracotta)' }}>
              Créer un compte gratuit
            </Link>
            <Link href="/annonces" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10" style={{ border: '1.5px solid rgba(255,255,255,0.25)', color: 'white' }}>
              Parcourir les annonces
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: '#0F172A', color: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="font-serif text-xl font-bold text-white block mb-3">
              Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
            </span>
            <p className="text-sm leading-relaxed">
              La première plateforme dédiée à l&apos;immobilier en Algérie. 48 wilayas couvertes.
            </p>
          </div>
          <FooterCol title="Annonces" links={[
            { label: 'Appartements', href: '/annonces?type=appartement' },
            { label: 'Villas', href: '/annonces?type=villa' },
            { label: 'Terrains', href: '/annonces?type=terrain' },
            { label: 'Locaux commerciaux', href: '/annonces?type=local' },
          ]} />
          <FooterCol title="Wilayas" links={[
            { label: 'Alger', href: '/annonces?wilaya=Alger' },
            { label: 'Oran', href: '/annonces?wilaya=Oran' },
            { label: 'Constantine', href: '/annonces?wilaya=Constantine' },
            { label: 'Annaba', href: '/annonces?wilaya=Annaba' },
          ]} />
          <FooterCol title="Dari.dz" links={[
            { label: 'Publier une annonce', href: '/annonces/nouvelle' },
            { label: 'Se connecter', href: '/auth/login' },
            { label: 'Créer un compte', href: '/auth/signup' },
            { label: 'Mon tableau de bord', href: '/dashboard' },
          ]} />
        </div>
        <div className="max-w-6xl mx-auto px-5 py-4 border-t text-xs flex justify-between flex-wrap gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span>© {new Date().getFullYear()} Dari.dz — Tous droits réservés</span>
          <span>Fait avec ❤️ en Algérie 🇩🇿</span>
        </div>
      </footer>

    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--terracotta)' }}>{eyebrow}</p>
      <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--navy)' }}>{title}</h2>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
