'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WILAYAS, LISTING_TYPES, TRANSACTION_TYPES } from '@/lib/constants'
import type { ListingType, TransactionType, ListingImage } from '@/types'

interface FormData {
  type: ListingType
  transaction: TransactionType
  wilaya: string
  commune: string
  adresse: string
  price: string
  surface: string
  rooms: string
  bathrooms: string
  title: string
  description: string
}

interface Props {
  listingId: string
  userId: string
  initial: FormData
  existingImages: ListingImage[]
}

const inputCls  = "border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--terracotta)] bg-white"
const selectCls = "border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--terracotta)] bg-white appearance-none cursor-pointer"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}{required && <span style={{ color: 'var(--terracotta)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

export default function EditForm({ listingId, userId, initial, existingImages }: Props) {
  const router = useRouter()
  const [form, setForm]   = useState<FormData>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Photos existantes
  const [kept, setKept] = useState<ListingImage[]>(existingImages)
  const [deletedIds, setDeletedIds] = useState<string[]>([])

  // Nouvelles photos
  const [newFiles, setNewFiles]       = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function removeExisting(img: ListingImage) {
    setKept(prev => prev.filter(i => i.id !== img.id))
    setDeletedIds(prev => [...prev, img.id])
  }

  function handleNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10 - kept.length)
    setNewFiles(prev => [...prev, ...files].slice(0, 10 - kept.length))
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 10 - kept.length))
  }

  function removeNew(i: number) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  function validate() {
    if (!form.type)              return 'Choisissez un type de bien.'
    if (!form.transaction)       return 'Choisissez vente ou location.'
    if (!form.wilaya)            return 'Choisissez une wilaya.'
    if (!form.commune.trim())    return 'Indiquez la commune.'
    if (!form.title.trim() || form.title.length < 10)
                                 return 'Le titre doit contenir au moins 10 caractères.'
    if (!form.price || isNaN(Number(form.price)))
                                 return 'Indiquez un prix valide.'
    if (!form.description.trim() || form.description.length < 30)
                                 return 'La description doit contenir au moins 30 caractères.'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    const supabase = createClient()

    // 1. Mettre à jour l'annonce
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        type:        form.type,
        transaction: form.transaction,
        wilaya:      form.wilaya,
        commune:     form.commune.trim(),
        adresse:     form.adresse.trim() || null,
        price:       Number(form.price),
        surface:     form.surface ? Number(form.surface) : null,
        rooms:       form.rooms ? Number(form.rooms) : null,
        bathrooms:   form.bathrooms ? Number(form.bathrooms) : null,
        title:       form.title.trim(),
        description: form.description.trim(),
      })
      .eq('id', listingId)

    if (updateError) {
      setError('Impossible de sauvegarder les modifications.')
      setLoading(false)
      return
    }

    // 2. Supprimer les photos retirées
    if (deletedIds.length > 0) {
      await supabase.from('listing_images').delete().in('id', deletedIds)
    }

    // 3. Recalculer is_primary sur les photos restantes
    if (kept.length > 0) {
      await supabase
        .from('listing_images')
        .update({ is_primary: false })
        .eq('listing_id', listingId)
      await supabase
        .from('listing_images')
        .update({ is_primary: true })
        .eq('id', kept[0].id)
    }

    // 4. Upload des nouvelles photos
    const startOrder = kept.length
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      const ext  = file.name.split('.').pop()
      const path = `${userId}/${listingId}/${Date.now()}_${i}.${ext}`

      const { data: upload } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { upsert: true })

      if (upload) {
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(path)

        await supabase.from('listing_images').insert({
          listing_id: listingId,
          url:        publicUrl,
          is_primary: kept.length === 0 && i === 0,
          order:      startOrder + i,
        })
      }
    }

    router.push('/dashboard/annonces')
    router.refresh()
  }

  const totalPhotos = kept.length + newFiles.length

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

      {/* ── Type & transaction ── */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <h2 className="font-bold text-sm mb-5" style={{ color: 'var(--navy)' }}>Type de bien & transaction</h2>
        <div className="flex flex-col gap-5">

          <Field label="Type de bien" required>
            <div className="grid grid-cols-3 gap-2">
              {LISTING_TYPES.map(t => (
                <button
                  key={t.value} type="button"
                  onClick={() => set('type', t.value)}
                  className="py-2 px-3 rounded-lg text-sm font-medium border transition-all text-center"
                  style={{
                    background:   form.type === t.value ? 'var(--navy)' : 'white',
                    color:        form.type === t.value ? 'white' : 'var(--navy)',
                    borderColor:  form.type === t.value ? 'var(--navy)' : 'var(--border)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Transaction" required>
            <div className="grid grid-cols-2 gap-2">
              {TRANSACTION_TYPES.map(t => (
                <button
                  key={t.value} type="button"
                  onClick={() => set('transaction', t.value)}
                  className="py-2.5 rounded-lg text-sm font-semibold border transition-all"
                  style={{
                    background:   form.transaction === t.value ? 'var(--terracotta)' : 'white',
                    color:        form.transaction === t.value ? 'white' : 'var(--navy)',
                    borderColor:  form.transaction === t.value ? 'var(--terracotta)' : 'var(--border)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

        </div>
      </div>

      {/* ── Localisation ── */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <h2 className="font-bold text-sm mb-5" style={{ color: 'var(--navy)' }}>Localisation</h2>
        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-4">
            <Field label="Wilaya" required>
              <select
                value={form.wilaya}
                onChange={e => set('wilaya', e.target.value)}
                className={selectCls}
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="">Choisir...</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>

            <Field label="Commune" required>
              <input
                type="text" value={form.commune}
                onChange={e => set('commune', e.target.value)}
                placeholder="Ex : Hydra"
                className={inputCls}
                style={{ borderColor: 'var(--border)' }}
              />
            </Field>
          </div>

          <Field label="Adresse (optionnel)">
            <input
              type="text" value={form.adresse}
              onChange={e => set('adresse', e.target.value)}
              placeholder="Rue, résidence..."
              className={inputCls}
              style={{ borderColor: 'var(--border)' }}
            />
          </Field>

        </div>
      </div>

      {/* ── Détails & prix ── */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <h2 className="font-bold text-sm mb-5" style={{ color: 'var(--navy)' }}>Détails & prix</h2>
        <div className="flex flex-col gap-4">

          <Field label="Titre de l'annonce" required>
            <input
              type="text" value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex : Appartement F4 avec vue mer à Hydra"
              maxLength={100}
              className={inputCls}
              style={{ borderColor: 'var(--border)' }}
            />
            <span className="text-xs text-gray-400 text-right">{form.title.length}/100</span>
          </Field>

          <Field label={form.transaction === 'location' ? 'Loyer mensuel (DA)' : 'Prix de vente (DA)'} required>
            <input
              type="number" value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="Ex : 15000000"
              min="0"
              className={inputCls}
              style={{ borderColor: 'var(--border)' }}
            />
            {form.price && (
              <span className="text-xs text-gray-400">
                ≈ {Number(form.price).toLocaleString('fr-DZ')} DA
              </span>
            )}
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Surface (m²)">
              <input
                type="number" value={form.surface}
                onChange={e => set('surface', e.target.value)}
                placeholder="85" min="0"
                className={inputCls}
                style={{ borderColor: 'var(--border)' }}
              />
            </Field>

            {form.type !== 'terrain' && form.type !== 'local' && (
              <>
                <Field label="Pièces">
                  <input
                    type="number" value={form.rooms}
                    onChange={e => set('rooms', e.target.value)}
                    placeholder="3" min="1" max="20"
                    className={inputCls}
                    style={{ borderColor: 'var(--border)' }}
                  />
                </Field>
                <Field label="Salles de bain">
                  <input
                    type="number" value={form.bathrooms}
                    onChange={e => set('bathrooms', e.target.value)}
                    placeholder="1" min="1" max="10"
                    className={inputCls}
                    style={{ borderColor: 'var(--border)' }}
                  />
                </Field>
              </>
            )}
          </div>

          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décrivez votre bien..."
              rows={5}
              maxLength={2000}
              className={inputCls}
              style={{ borderColor: 'var(--border)', resize: 'vertical' }}
            />
            <span className="text-xs text-gray-400 text-right">{form.description.length}/2000</span>
          </Field>

        </div>
      </div>

      {/* ── Photos ── */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(26,39,68,0.06)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-sm" style={{ color: 'var(--navy)' }}>Photos</h2>
          <span className="text-xs text-gray-400">{totalPhotos}/10</span>
        </div>

        {/* Photos existantes */}
        {kept.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {kept.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                    Principale
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExisting(img)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Nouvelles photos */}
        {newPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-dashed" style={{ borderColor: 'var(--terracotta)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                  Nouvelle
                </span>
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zone upload */}
        {totalPhotos < 10 && (
          <label
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-[var(--terracotta)] flex flex-col items-center gap-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <input
              type="file" accept="image/*" multiple
              onChange={handleNewFiles}
              className="hidden"
            />
            <span className="text-2xl">📷</span>
            <p className="text-sm font-medium" style={{ color: 'var(--navy)' }}>Ajouter des photos</p>
            <p className="text-xs text-gray-400">JPG, PNG — max 5 Mo par photo</p>
          </label>
        )}
      </div>

      {/* ── Erreur & actions ── */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/annonces')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{ background: 'var(--terracotta)' }}
        >
          {loading ? 'Sauvegarde...' : '✓ Sauvegarder les modifications'}
        </button>
      </div>

    </form>
  )
}
