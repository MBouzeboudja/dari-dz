'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props { listingId: string }

export default function ContactForm({ listingId }: Props) {
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('Bonjour, je suis intéressé(e) par votre annonce. Pouvez-vous me contacter ?')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('contacts').insert({
      listing_id: listingId,
      name:       name.trim(),
      phone:      phone.trim(),
      email:      email.trim() || null,
      message:    message.trim(),
    })

    if (error) {
      setError('Erreur lors de l\'envoi. Réessayez.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--navy)' }}>Message envoyé !</p>
        <p className="text-xs text-gray-400">Le vendeur vous contactera bientôt.</p>
      </div>
    )
  }

  const inputCls = "w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors bg-white focus:border-[var(--terracotta)]"
  const style = { borderColor: 'var(--border)' }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      <input
        type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Votre nom *" required
        className={inputCls} style={style}
      />

      <input
        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
        placeholder="Votre téléphone *" required
        className={inputCls} style={style}
      />

      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Email (optionnel)"
        className={inputCls} style={style}
      />

      <textarea
        value={message} onChange={e => setMessage(e.target.value)}
        rows={3} required
        className={inputCls} style={{ ...style, resize: 'none' }}
      />

      {error && (
        <p className="text-xs border rounded-lg px-3 py-2" style={{ color: 'var(--error)', background: 'var(--error-bg)', borderColor: 'var(--error)' }}>{error}</p>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
        style={{ background: 'var(--terracotta)' }}
      >
        {loading ? 'Envoi...' : 'Envoyer le message'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Vos coordonnées ne seront partagées qu&apos;avec le vendeur.
      </p>
    </form>
  )
}
