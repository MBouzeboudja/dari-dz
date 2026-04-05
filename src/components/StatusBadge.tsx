interface Props { status: string }

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active:  { label: 'Actif',      bg: 'var(--success-bg)',      color: 'var(--success)' },
  pending: { label: 'En attente', bg: 'var(--gold-light)',      color: 'var(--gold)'    },
  sold:    { label: 'Vendu',      bg: '#F0F0F0',                color: '#6B7280'        },
  expired: { label: 'Expiré',     bg: 'var(--error-bg)',        color: 'var(--error)'   },
}

export default function StatusBadge({ status }: Props) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.active
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
