import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem','MSila','Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane',
]

const TYPES = ['appartement', 'villa', 'studio', 'terrain', 'local', 'bureau']
const TRANSACTIONS = ['vente', 'location']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/annonces`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
  ]

  // Pages par wilaya
  const wilayas: MetadataRoute.Sitemap = WILAYAS.map(w => ({
    url: `${SITE_URL}/annonces?wilaya=${encodeURIComponent(w)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Pages par type × transaction
  const categories: MetadataRoute.Sitemap = TYPES.flatMap(type =>
    TRANSACTIONS.map(transaction => ({
      url: `${SITE_URL}/annonces?type=${type}&transaction=${transaction}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  )

  // Annonces actives
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(5000)

  const listingPages: MetadataRoute.Sitemap = (listings ?? []).map(l => ({
    url: `${SITE_URL}/annonces/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...wilayas, ...categories, ...listingPages]
}
