'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/annonces',                   label: 'Annonces' },
  { href: '/annonces?transaction=vente',  label: 'Acheter' },
  { href: '/annonces?transaction=location', label: 'Louer' },
  { href: '/auth/login',                 label: 'Connexion' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute top-0 w-full z-20">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-bold text-white drop-shadow">
          Dari<span style={{ color: '#F0A882' }}>.dz</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Bouton Publier */}
          <Link
            href="/annonces/nouvelle"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--terracotta)', color: 'white' }}
          >
            + Publier
          </Link>

          {/* Hamburger — mobile uniquement */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            aria-label="Menu"
          >
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-200 origin-center"
              style={{ transform: open ? 'translateY(8px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-200"
              style={{ opacity: open ? 0 : 1 }}
            />
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-200 origin-center"
              style={{ transform: open ? 'translateY(-8px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <div className="md:hidden" style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 px-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
