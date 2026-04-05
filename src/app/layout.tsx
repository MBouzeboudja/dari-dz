import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dari.dz — Immobilier en Algérie',
    template: '%s — Dari.dz',
  },
  description: 'La première plateforme dédiée à l\'immobilier en Algérie. Achetez, vendez, ou louez dans les 48 wilayas.',
  keywords: 'immobilier algérie, appartement vente algérie, villa location algérie, terrain algérie, achat immobilier, location appartement algérie',
  openGraph: {
    siteName: 'Dari.dz',
    type: 'website',
    locale: 'fr_DZ',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
