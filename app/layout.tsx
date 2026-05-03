import type { Metadata } from 'next'
import './globals.css'
import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Couple',
  description: 'Планировать свидания вместе',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  )
}

export const viewport: Viewport = {
  themeColor: '#f43f5e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
