'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, CalendarDays, Lightbulb, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/dates', label: 'Свидания', icon: Heart },
  { href: '/calendar', label: 'Календарь', icon: CalendarDays },
  { href: '/ideas', label: 'Идеи', icon: Lightbulb },
  { href: '/profile', label: 'Профиль', icon: User },
];

export default function FloatingNav() {
  const pathname = usePathname();

  return (
      <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full bg-white/80 px-2 py-2 shadow-xl shadow-black/5 backdrop-blur-2xl border border-white/40">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const Icon = tab.icon;

            return (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className="relative flex flex-col items-center justify-center rounded-full px-4 py-2 transition-colors"
                >
                  {isActive && (
                      <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-full bg-rose-100"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                  )}
                  <Icon
                      className={`relative z-10 h-5 w-5 transition-colors ${
                          isActive ? 'text-rose-600' : 'text-gray-400'
                      }`}
                  />
                  <span
                      className={`relative z-10 mt-0.5 text-[10px] font-medium transition-colors ${
                          isActive ? 'text-rose-600' : 'text-gray-400'
                      }`}
                  >
                {tab.label}
              </span>
                </Link>
            );
          })}
        </div>
      </nav>
  );
}