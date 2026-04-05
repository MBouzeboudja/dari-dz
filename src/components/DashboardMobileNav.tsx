'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  shortLabel?: string
  icon: string
  badge?: number
}

export default function DashboardMobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t"
      style={{ borderColor: 'var(--border)', boxShadow: '0 -2px 12px rgba(26,39,68,0.08)' }}
    >
      <div className="flex">
        {items.map(item => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative"
              style={{ color: active ? 'var(--terracotta)' : '#9CA3AF' }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold leading-none text-center px-1">
                {item.shortLabel ?? item.label}
              </span>
              {!!item.badge && item.badge > 0 && (
                <span
                  className="absolute top-2 right-[22%] w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'var(--terracotta)' }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
