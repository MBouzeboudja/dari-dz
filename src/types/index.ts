export type UserRole = 'particulier' | 'agence'
export type ListingType = 'appartement' | 'villa' | 'terrain' | 'local' | 'bureau' | 'studio'
export type TransactionType = 'vente' | 'location'
export type ListingStatus = 'active' | 'pending' | 'sold' | 'expired'

export interface Profile {
  id: string
  email: string
  phone?: string
  name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  type: ListingType
  transaction: TransactionType
  wilaya: string
  commune: string
  adresse?: string
  price: number
  surface?: number
  rooms?: number
  bathrooms?: number
  title: string
  description: string
  status: ListingStatus
  is_featured: boolean
  views_count: number
  created_at: string
  expires_at: string
  profiles?: Profile
  listing_images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  is_primary: boolean
  order: number
}

export interface ContactMessage {
  id: string
  listing_id: string
  name: string
  phone: string
  email?: string
  message: string
  created_at: string
}

export interface SearchFilters {
  type?: ListingType
  transaction?: TransactionType
  wilaya?: string
  price_min?: number
  price_max?: number
  rooms_min?: number
  surface_min?: number
}
