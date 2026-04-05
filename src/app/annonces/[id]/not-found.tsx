import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--sand)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">🏚️</div>
        <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
          Annonce introuvable
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Cette annonce n&apos;existe pas ou a été supprimée.
        </p>
        <Link
          href="/annonces"
          className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'var(--terracotta)' }}
        >
          ← Voir toutes les annonces
        </Link>
      </div>
    </div>
  )
}
