'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WILAYAS, LISTING_TYPES, TRANSACTION_TYPES } from '@/lib/constants'
import type { ListingType, TransactionType } from '@/types'

// ─── Types ────────────────────────────────────────────────────
interface FormData {
  type:        ListingType | ''
  transaction: TransactionType | ''
  wilaya:      string
  commune:     string
  adresse:     string
  price:       string
  surface:     string
  rooms:       string
  bathrooms:   string
  title:       string
  description: string
}

const INITIAL: FormData = {
  type: '', transaction: '', wilaya: '', commune: '', adresse: '',
  price: '', surface: '', rooms: '', bathrooms: '', title: '', description: '',
}

const TYPE_ICONS: Record<string, string> = {
  appartement: '🏢', villa: '🏠', studio: '🛋️',
  terrain: '🌿', local: '🏪', bureau: '🏛️',
}

const STEPS = [
  { n: 1, label: 'Type',      sub: 'Bien & localisation' },
  { n: 2, label: 'Détails',   sub: 'Prix & description'  },
  { n: 3, label: 'Photos',    sub: 'Jusqu\'à 10 photos'  },
  { n: 4, label: 'Publier',   sub: 'Récapitulatif'       },
]

// ─── Helpers ──────────────────────────────────────────────────
const inputCls  = "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[var(--terracotta)] focus:ring-2 focus:ring-[rgba(192,94,60,0.1)] bg-white"
const selectCls = "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[var(--terracotta)] focus:ring-2 focus:ring-[rgba(192,94,60,0.1)] bg-white appearance-none cursor-pointer"

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
        {label}{required && <span className="ml-1" style={{ color: 'var(--terracotta)' }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────
function ProgressBar({ current }: { current: number }) {
  const pct = ((current - 1) / (STEPS.length - 1)) * 100
  return (
    <div className="w-full">
      {/* Labels desktop */}
      <div className="hidden sm:flex justify-between mb-3 px-1">
        {STEPS.map(s => (
          <div key={s.n} className="flex flex-col items-center gap-0.5" style={{ width: '23%' }}>
            <span
              className="text-xs font-bold transition-colors"
              style={{ color: current >= s.n ? 'var(--navy)' : '#CBD5E1' }}
            >
              {s.n}. {s.label}
            </span>
            <span className="text-[10px]" style={{ color: current === s.n ? 'var(--terracotta)' : '#CBD5E1' }}>
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Barre */}
      <div className="relative h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--terracotta)' }}
        />
        {/* Points */}
        {STEPS.map(s => (
          <div
            key={s.n}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300"
            style={{
              left: `${((s.n - 1) / (STEPS.length - 1)) * 100}%`,
              background: current > s.n ? 'var(--terracotta)' : current === s.n ? 'white' : 'white',
              borderColor: current >= s.n ? 'var(--terracotta)' : '#E2E8F0',
            }}
          >
            {current > s.n && (
              <svg className="w-full h-full p-0.5" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Label mobile */}
      <div className="sm:hidden flex justify-between mt-2 px-0.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--navy)' }}>
          Étape {current} — {STEPS[current - 1].label}
        </span>
        <span className="text-xs text-gray-400">{current}/{STEPS.length}</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function NouvelleAnnoncePage() {
  const router  = useRouter()
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState<FormData>(INITIAL)
  const [images, setImages]   = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

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

  function validateStep1() {
    if (!form.type)          return 'Choisissez un type de bien.'
    if (!form.transaction)   return 'Choisissez vente ou location.'
    if (!form.wilaya)        return 'Choisissez une wilaya.'
    if (!form.commune.trim())return 'Indiquez la commune.'
    return ''
  }

  function validateStep2() {
    if (!form.title.trim() || form.title.length < 10) return 'Le titre doit contenir au moins 10 caractères.'
    if (!form.price || isNaN(Number(form.price)))      return 'Indiquez un prix valide.'
    if (!form.description.trim() || form.description.length < 30)
                                                        return 'La description doit contenir au moins 30 caractères.'
    return ''
  }

  function next() {
    setError('')
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : ''
    if (err) { setError(err); return }
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setError('')
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

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
        surface:     form.surface    ? Number(form.surface)    : null,
        rooms:       form.rooms      ? Number(form.rooms)      : null,
        bathrooms:   form.bathrooms  ? Number(form.bathrooms)  : null,
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

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext  = file.name.split('.').pop()
      const path = `${user.id}/${listing.id}/${i}.${ext}`
      const { data: upload } = await supabase.storage
        .from('listing-images').upload(path, file, { upsert: true })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images').getPublicUrl(path)
        await supabase.from('listing_images').insert({
          listing_id: listing.id, url: publicUrl, is_primary: i === 0, order: i,
        })
      }
    }

    router.push('/dashboard?success=1')
  }

  const typeLabel  = LISTING_TYPES.find(t => t.value === form.type)?.label ?? ''
  const showRooms  = form.type && form.type !== 'terrain' && form.type !== 'local'

  // ── Render ──
  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)' }}>

      {/* ── Top bar ── */}
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold" style={{ color: 'var(--navy)' }}>
            Dari<span style={{ color: 'var(--terracotta)' }}>.dz</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Annuler
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">

        {/* ── Titre ── */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
            Publier une annonce
          </h1>
          <p className="text-sm text-gray-400">Gratuit pour les particuliers · visible 60 jours</p>
        </div>

        {/* ── Progress ── */}
        <div className="mb-6 sm:mb-10">
          <ProgressBar current={step} />
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border)' }}>

          {/* Step header */}
          <div className="px-5 py-4 sm:px-8 sm:py-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--sand)' }}>
            <h2 className="font-bold text-base sm:text-lg" style={{ color: 'var(--navy)' }}>
              {step === 1 && 'Type de bien & localisation'}
              {step === 2 && 'Détails & prix'}
              {step === 3 && 'Photos'}
              {step === 4 && 'Récapitulatif'}
            </h2>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="flex flex-col gap-6">

                <Field label="Type de bien" required>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {LISTING_TYPES.map(t => (
                      <button
                        key={t.value} type="button"
                        onClick={() => set('type', t.value)}
                        className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all text-center"
                        style={{
                          background:  form.type === t.value ? 'rgba(26,39,68,0.05)' : 'white',
                          borderColor: form.type === t.value ? 'var(--navy)' : 'var(--border)',
                        }}
                      >
                        <span className="text-2xl">{TYPE_ICONS[t.value]}</span>
                        <span className="text-xs font-semibold leading-tight" style={{ color: form.type === t.value ? 'var(--navy)' : '#6B7280' }}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Transaction" required>
                  <div className="grid grid-cols-2 gap-2.5">
                    {TRANSACTION_TYPES.map(t => (
                      <button
                        key={t.value} type="button"
                        onClick={() => set('transaction', t.value)}
                        className="py-3.5 rounded-xl border-2 text-sm font-bold transition-all"
                        style={{
                          background:  form.transaction === t.value ? 'var(--terracotta)' : 'white',
                          color:       form.transaction === t.value ? 'white' : '#6B7280',
                          borderColor: form.transaction === t.value ? 'var(--terracotta)' : 'var(--border)',
                        }}
                      >
                        {t.value === 'vente' ? '🏷️ À vendre' : '🔑 À louer'}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Wilaya" required>
                    <div className="relative">
                      <select
                        value={form.wilaya}
                        onChange={e => set('wilaya', e.target.value)}
                        className={selectCls}
                        style={{ borderColor: 'var(--border)', paddingRight: '2.5rem' }}
                      >
                        <option value="">Choisir une wilaya…</option>
                        {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </Field>

                  <Field label="Commune" required>
                    <input
                      type="text" value={form.commune}
                      onChange={e => set('commune', e.target.value)}
                      placeholder="Ex : Hydra, Bab El Oued…"
                      className={inputCls}
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </Field>
                </div>

                <Field label="Adresse précise" hint="Optionnel — visible par les acheteurs intéressés">
                  <input
                    type="text" value={form.adresse}
                    onChange={e => set('adresse', e.target.value)}
                    placeholder="N° de rue, résidence, quartier…"
                    className={inputCls}
                    style={{ borderColor: 'var(--border)' }}
                  />
                </Field>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="flex flex-col gap-6">

                <Field label="Titre de l'annonce" required hint={`${form.title.length}/100 caractères`}>
                  <input
                    type="text" value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="Ex : Appartement F4 lumineux vue mer, Hydra"
                    maxLength={100}
                    className={inputCls}
                    style={{ borderColor: 'var(--border)' }}
                  />
                </Field>

                <Field
                  label={form.transaction === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
                  required
                  hint={form.price ? `≈ ${Number(form.price).toLocaleString('fr-DZ')} DA` : undefined}
                >
                  <div className="relative">
                    <input
                      type="number" value={form.price}
                      onChange={e => set('price', e.target.value)}
                      placeholder="0"
                      min="0"
                      className={inputCls}
                      style={{ borderColor: 'var(--border)', paddingRight: '4rem' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">
                      DA{form.transaction === 'location' ? '/mois' : ''}
                    </span>
                  </div>
                </Field>

                <div className={`grid gap-4 ${showRooms ? 'grid-cols-3' : 'grid-cols-1'}`}>
                  <Field label="Surface" hint="m²">
                    <input
                      type="number" value={form.surface}
                      onChange={e => set('surface', e.target.value)}
                      placeholder="85" min="0"
                      className={inputCls}
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </Field>

                  {showRooms && (
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

                <Field label="Description" required hint={`${form.description.length}/2000`}>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Décrivez votre bien : état général, équipements, étage, exposition, quartier, transport à proximité…"
                    rows={6}
                    maxLength={2000}
                    className={inputCls}
                    style={{ borderColor: 'var(--border)', resize: 'vertical' }}
                  />
                </Field>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="flex flex-col gap-5">

                <p className="text-sm text-gray-500">
                  Ajoutez jusqu&apos;à <strong>10 photos</strong>. La première sera la photo principale de l&apos;annonce.
                </p>

                {/* Zone upload */}
                <label className="group relative flex flex-col items-center gap-3 py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-[var(--terracotta)] hover:bg-orange-50/30"
                  style={{ borderColor: 'var(--border)' }}>
                  <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:scale-110"
                    style={{ background: '#FBF0E8' }}>
                    📷
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                      Cliquez ou déposez vos photos ici
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 5 Mo par photo</p>
                  </div>
                  <span className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity group-hover:opacity-90"
                    style={{ background: 'var(--terracotta)' }}>
                    Choisir des fichiers
                  </span>
                </label>

                {/* Prévisualisations */}
                {previews.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                      {previews.length} photo{previews.length > 1 ? 's' : ''} sélectionnée{previews.length > 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 transition-all"
                          style={{ borderColor: i === 0 ? 'var(--terracotta)' : 'transparent' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          {i === 0 && (
                            <div className="absolute bottom-0 inset-x-0 py-1.5 text-center text-xs font-bold text-white"
                              style={{ background: 'var(--terracotta)' }}>
                              Photo principale
                            </div>
                          )}
                          <button
                            type="button" onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-sm flex items-center justify-center transition-colors backdrop-blur-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previews.length === 0 && (
                  <p className="text-xs text-gray-400 text-center">
                    Les annonces avec photos reçoivent 5× plus de contacts.
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 4 ── */}
            {step === 4 && (
              <div className="flex flex-col gap-5">

                {/* Résumé */}
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--sand)' }}>
                    <span className="text-lg">{TYPE_ICONS[form.type] ?? '🏠'}</span>
                    <span className="font-bold text-sm" style={{ color: 'var(--navy)' }}>{typeLabel}</span>
                    <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ background: form.transaction === 'vente' ? 'var(--navy)' : 'var(--terracotta)' }}>
                      {form.transaction === 'vente' ? 'À vendre' : 'À louer'}
                    </span>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    <SummaryRow label="Localisation" value={`${form.commune}, ${form.wilaya}`} />
                    <SummaryRow label="Titre" value={form.title} />
                    <SummaryRow
                      label="Prix"
                      value={`${Number(form.price).toLocaleString('fr-DZ')} DA${form.transaction === 'location' ? '/mois' : ''}`}
                      highlight
                    />
                    {form.surface   && <SummaryRow label="Surface"     value={`${form.surface} m²`} />}
                    {form.rooms     && <SummaryRow label="Pièces"      value={form.rooms} />}
                    {form.bathrooms && <SummaryRow label="Salle de bain" value={form.bathrooms} />}
                    <SummaryRow label="Photos" value={images.length === 0 ? 'Aucune (recommandé d\'en ajouter)' : `${images.length} photo${images.length > 1 ? 's' : ''}`} />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 border"
                  style={{ background: '#F0FDF4', borderColor: '#86EFAC' }}>
                  <span className="text-lg shrink-0">✅</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Prêt à publier</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Votre annonce sera visible immédiatement pendant 60 jours, gratuitement.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* ── Erreur ── */}
            {error && (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl px-4 py-3 border text-sm"
                style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
                <span className="shrink-0">⚠️</span>
                {error}
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <div className="px-5 py-4 sm:px-8 border-t flex items-center justify-between gap-3"
            style={{ borderColor: 'var(--border)', background: step === 4 ? 'var(--sand)' : 'white' }}>

            {step > 1 ? (
              <button type="button" onClick={back}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-gray-50"
                style={{ borderColor: 'var(--border)', color: 'var(--navy)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Retour
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button type="button" onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--navy)' }}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'var(--terracotta)' }}>
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Publication…
                  </>
                ) : (
                  <>
                    Publier l&apos;annonce
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m5 12 7-7 7 7M12 5v14"/>
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Summary row ──────────────────────────────────────────────
function SummaryRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-right truncate"
        style={{ color: highlight ? 'var(--terracotta)' : 'var(--navy)', fontWeight: highlight ? 700 : 500 }}>
        {value}
      </span>
    </div>
  )
}
