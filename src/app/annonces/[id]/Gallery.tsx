'use client'

import { useState } from 'react'

const TYPE_EMOJI: Record<string, string> = {
  appartement: '🏢', villa: '🏠', studio: '🛋️',
  terrain: '🌿', local: '🏪', bureau: '🏛️',
}
const TYPE_BG: Record<string, string> = {
  appartement: '#E8F0FB', villa: '#FBF0E8', studio: '#F0E8FB',
  terrain: '#E8FBF0', local: '#FBE8E8', bureau: '#E8FBFB',
}

interface Image { id: string; url: string; is_primary: boolean; order: number }

interface Props {
  images: Image[]
  title: string
  type: string
}

export default function Gallery({ images, title, type }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const sorted = [...images].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : a.order - b.order))
  const hasImages = sorted.length > 0

  if (!hasImages) {
    return (
      <div className="w-full h-72 rounded-2xl flex flex-col items-center justify-center gap-3 border" style={{ background: TYPE_BG[type] ?? 'var(--sand)', borderColor: 'var(--border)' }}>
        <span style={{ fontSize: '4rem' }}>{TYPE_EMOJI[type] ?? '🏠'}</span>
        <p className="text-sm text-gray-400">Aucune photo disponible</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Image principale */}
        <div
          className="relative w-full rounded-2xl overflow-hidden cursor-zoom-in"
          style={{ height: '400px', background: '#f0f0f0' }}
          onClick={() => setLightbox(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[active].url}
            alt={`${title} — photo ${active + 1}`}
            className="w-full h-full object-cover transition-opacity duration-200"
          />
          {sorted.length > 1 && (
            <>
              {/* Flèche gauche */}
              {active > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); setActive(a => a - 1) }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              {/* Flèche droite */}
              {active < sorted.length - 1 && (
                <button
                  onClick={e => { e.stopPropagation(); setActive(a => a + 1) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )}
              {/* Compteur */}
              <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {active + 1} / {sorted.length}
              </span>
            </>
          )}
          {/* Hint zoom */}
          <span className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">
            🔍 Agrandir
          </span>
        </div>

        {/* Miniatures */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActive(i)}
                className="shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all"
                style={{ borderColor: i === active ? 'var(--terracotta)' : 'transparent', opacity: i === active ? 1 : 0.6 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>

          {active > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setActive(a => a - 1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sorted[active].url}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>

          {active < sorted.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setActive(a => a + 1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )}

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {active + 1} / {sorted.length}
          </span>
        </div>
      )}
    </>
  )
}
