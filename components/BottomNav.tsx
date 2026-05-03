'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Главная', icon: '🏠' },
  { href: '/dates', label: 'Свидания', icon: '📅' },
  { href: '/ideas', label: 'Идеи', icon: '💡' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center gap-1 py-3 px-6 transition-colors ${active ? 'text-rose-500' : 'text-stone-400'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
