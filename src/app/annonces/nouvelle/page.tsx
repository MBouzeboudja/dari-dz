'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WILAYAS, LISTING_TYPES, TRANSACTION_TYPES } from '@/lib/constants'
import type { ListingType, TransactionType } from '@/types'

// ─── Types ────────────────────────────────────────────────
interface FormData {
  type: ListingType | ''
  transaction: TransactionType | ''
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

const INITIAL: FormData = {
  type: '', transaction: '', wilaya: '', commune: '', adresse: '',
  price: '', surface: '', rooms: '', bathrooms: '', title: '', description: '',
}

// ─── Step indicator ────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ['Type & localisation', 'Détails & prix', 'Photos', 'Récapitulatif']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: done ? 'var(--terracotta)' : active ? 'var(--navy)' : 'var(--border)',
                  color: done || active ? 'white' : '#9CA3AF',
                }}
              >
                {done ? '✓' : num}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: active ? 'var(--navy)' : '#9CA3AF' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5" style={{ background: done ? 'var(--terracotta)' : 'var(--border)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Field wrapper ─────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label} {required && <span style={{ color: 'var(--terracotta)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--terracotta)] bg-white"
const selectCls = "border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--terracotta)] bg-white appearance-none cursor-pointer"

// ─── Main component ────────────────────────────────────────
export default function NouvelleAnnoncePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Validation par step ──
  function validateStep1() {
    if (!form.type) return 'Choisissez un type de bien'
    if (!form.transaction) return 'Choisissez vente ou location'
    if (!form.wilaya) return 'Choisissez une wilaya'
    if (!form.commune.trim()) return 'Indiquez la commune'
    return ''
  }

  function validateStep2() {
    if (!form.title.trim()) return 'Ajoutez un titre à votre annonce'
    if (form.title.length < 10) return 'Le titre doit contenir au moins 10 caractères'
    if (!form.price || isNaN(Number(form.price))) return 'Indiquez un prix valide'
    if (!form.description.trim() || form.description.length < 30)
      return 'La description doit contenir au moins 30 caractères'
    return ''
  }

  function next() {
    setError('')
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : ''
    if (err) { setError(err); return }
    setStep(s => s + 1)
  }

  // ── Soumission finale ──
  async function submit() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // 1. Insérer l'annonce
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id:     user.id,
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
        status:      'active',
      })
      .select()
      .single()

    if (listingError || !listing) {
      setError('Erreur lors de la publication. Réessayez.')
      setLoading(false)
      return
    }

    // 2. Upload des photos
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${listing.id}/${i}.${ext}`

      const { data: upload } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { upsert: true })

      if (upload) {
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(path)

        await supabase.from('listing_images').insert({
          listing_id: listing.id,
          url:        publicUrl,
          is_primary: i === 0,
          order:      i,
        })
      }
    }

    router.push(`/dashboard?success=1`)
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--sand)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <a href="/" className="font-serif text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
          </a>
          <h1 className="text-xl font-bold mt-4" style={{ color: 'var(--navy)' }}>
            Publier une annonce
          </h1>
          <p className="text-sm text-gray-500">Gratuit pour les particuliers</p>
        </div>

        <Steps current={step} />

        <div className="bg-white rounded-2xl p-8 border shadow-sm" style={{ borderColor: 'var(--border)' }}>

          {/* ── STEP 1 : Type & localisation ─────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Type de bien & localisation</h2>

              <Field label="Type de bien" required>
                <div className="grid grid-cols-3 gap-2">
                  {LISTING_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('type', t.value)}
                      className="py-2 px-3 rounded-lg text-sm font-medium border transition-all text-center"
                      style={{
                        background: form.type === t.value ? 'var(--navy)' : 'white',
                        color: form.type === t.value ? 'white' : 'var(--navy)',
                        borderColor: form.type === t.value ? 'var(--navy)' : 'var(--border)',
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
                      key={t.value}
                      type="button"
                      onClick={() => set('transaction', t.value)}
                      className="py-2.5 rounded-lg text-sm font-semibold border transition-all"
                      style={{
                        background: form.transaction === t.value ? 'var(--terracotta)' : 'white',
                        color: form.transaction === t.value ? 'white' : 'var(--navy)',
                        borderColor: form.transaction === t.value ? 'var(--terracotta)' : 'var(--border)',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>

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
                    type="text"
                    value={form.commune}
                    onChange={e => set('commune', e.target.value)}
                    placeholder="Ex : Hydra"
                    className={inputCls}
                    style={{ borderColor: 'var(--border)' }}
                  />
                </Field>
              </div>

              <Field label="Adresse (optionnel)">
                <input
                  type="text"
                  value={form.adresse}
                  onChange={e => set('adresse', e.target.value)}
                  placeholder="Rue, résidence..."
                  className={inputCls}
                  style={{ borderColor: 'var(--border)' }}
                />
              </Field>
            </div>
          )}

          {/* ── STEP 2 : Détails & prix ───────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Détails & prix</h2>

              <Field label="Titre de l'annonce" required>
                <input
                  type="text"
                  value={form.title}
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
                  type="number"
                  value={form.price}
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
                    placeholder="85"
                    min="0"
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
                        placeholder="3"
                        min="1" max="20"
                        className={inputCls}
                        style={{ borderColor: 'var(--border)' }}
                      />
                    </Field>
                    <Field label="Salles de bain">
                      <input
                        type="number" value={form.bathrooms}
                        onChange={e => set('bathrooms', e.target.value)}
                        placeholder="1"
                        min="1" max="10"
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
                  placeholder="Décrivez votre bien : état général, équipements, étage, exposition, quartier, proximité des commodités..."
                  rows={5}
                  maxLength={2000}
                  className={inputCls}
                  style={{ borderColor: 'var(--border)', resize: 'vertical' }}
                />
                <span className="text-xs text-gray-400 text-right">{form.description.length}/2000</span>
              </Field>
            </div>
          )}

          {/* ── STEP 3 : Photos ───────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Photos</h2>
              <p className="text-sm text-gray-500">
                Jusqu&apos;à 10 photos. La première sera la photo principale.
              </p>

              {/* Zone upload */}
              <label
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-[var(--terracotta)]"
                style={{ borderColor: 'var(--border)' }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  className="hidden"
                />
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-medium" style={{ color: 'var(--navy)' }}>
                  Cliquez pour ajouter des photos
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 5 Mo par photo</p>
              </label>

              {/* Prévisualisations */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                          Principale
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400">
                Vous pourrez ajouter ou modifier les photos plus tard depuis votre tableau de bord.
              </p>
            </div>
          )}

          {/* ── STEP 4 : Récapitulatif ────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Récapitulatif</h2>

              <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--sand)' }}>
                <Row label="Type" value={`${LISTING_TYPES.find(t => t.value === form.type)?.label ?? ''} — ${form.transaction === 'vente' ? 'À vendre' : 'À louer'}`} />
                <Row label="Localisation" value={`${form.commune}, ${form.wilaya}`} />
                <Row label="Titre" value={form.title} />
                <Row label="Prix" value={`${Number(form.price).toLocaleString('fr-DZ')} DA${form.transaction === 'location' ? '/mois' : ''}`} />
                {form.surface && <Row label="Surface" value={`${form.surface} m²`} />}
                {form.rooms && <Row label="Pièces" value={form.rooms} />}
                <Row label="Photos" value={`${images.length} photo(s)`} />
              </div>

              <div className="rounded-xl p-4 border text-sm" style={{ borderColor: '#D1FAE5', background: '#F0FDF4', color: '#166534' }}>
                ✓ Votre annonce sera publiée immédiatement et visible pendant 60 jours.
              </div>
            </div>
          )}

          {/* ── Erreur & navigation ───────────────────────────── */}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}
              >
                ← Retour
              </button>
            ) : (
              <a href="/dashboard" className="px-5 py-2.5 rounded-lg text-sm text-gray-400">
                Annuler
              </a>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity"
                style={{ background: 'var(--navy)' }}
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
                style={{ background: 'var(--terracotta)' }}
              >
                {loading ? 'Publication...' : '✓ Publier l\'annonce'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right" style={{ color: 'var(--navy)', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}
