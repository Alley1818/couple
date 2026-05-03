'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/',         label: 'Главная',  icon: '🏠' },
  { href: '/dates',    label: 'Свидания', icon: '💝' },
  { href: '/calendar', label: 'Календарь',icon: '🗓' },
  { href: '/ideas',    label: 'Идеи',     icon: '💡' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-stone-100">
      <div className="flex items-center justify-around max-w-lg mx-auto px-1">
        {tabs.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-3 px-3 transition-colors ${active ? 'text-rose-500' : 'text-stone-400'}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}

        {/* Кнопка выхода */}
        <button onClick={logout}
          className="flex flex-col items-center gap-0.5 py-3 px-3 text-stone-300 hover:text-stone-500 transition-colors">
          <span className="text-lg">🚪</span>
          <span className="text-[10px] font-medium">Выйти</span>
        </button>
      </div>
    </nav>
  )
}
