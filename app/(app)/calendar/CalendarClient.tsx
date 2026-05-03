'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO
} from 'date-fns'
import { ru } from 'date-fns/locale'

type DateItem = { id: string; title: string; date_at: string; status: string; location?: string }

export default function CalendarClient({ dates }: { dates: DateItem[]; currentUserId: string }) {
  const [current, setCurrent] = useState(new Date())

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Добавляем пустые ячейки в начало (понедельник = 0)
  const startDay = (monthStart.getDay() + 6) % 7 // 0=пн ... 6=вс
  const blanks = Array(startDay).fill(null)

  function datesOnDay(day: Date) {
    return dates.filter(d => isSameDay(parseISO(d.date_at), day))
  }

  // Ближайшие свидания (список под календарём)
  const upcoming = dates.filter(d => new Date(d.date_at) >= new Date())

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Календарь</h1>

      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(d => subMonths(d, 1))}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50">
          ‹
        </button>
        <h2 className="font-semibold text-stone-900 capitalize">
          {format(current, 'LLLL yyyy', { locale: ru })}
        </h2>
        <button onClick={() => setCurrent(d => addMonths(d, 1))}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50">
          ›
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 mb-1">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <div key={d} className="text-center text-xs text-stone-400 py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-0.5">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          const events = datesOnDay(day)
          const hasEvent = events.length > 0
          const today = isToday(day)
          const inMonth = isSameMonth(day, current)

          return (
            <div key={day.toISOString()}
              className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm transition-colors
                ${today ? 'bg-rose-500 text-white' : ''}
                ${hasEvent && !today ? 'bg-rose-50 text-rose-600' : ''}
                ${!inMonth ? 'opacity-30' : ''}
              `}>
              <span className={`text-xs font-medium ${today ? 'text-white' : hasEvent ? 'text-rose-600' : 'text-stone-600'}`}>
                {format(day, 'd')}
              </span>
              {hasEvent && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${today ? 'bg-white' : 'bg-rose-400'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Список предстоящих */}
      {upcoming.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">Предстоящие</h3>
          <div className="space-y-2">
            {upcoming.map(d => (
              <Link key={d.id} href={`/dates/${d.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-100 hover:border-rose-200 transition-colors">
                <div className="text-center bg-rose-50 rounded-lg px-2 py-1 min-w-[40px]">
                  <p className="text-xs text-rose-400 font-medium leading-none">
                    {format(parseISO(d.date_at), 'MMM', { locale: ru })}
                  </p>
                  <p className="text-lg font-semibold text-rose-600 leading-tight">
                    {format(parseISO(d.date_at), 'd')}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-900 truncate">{d.title}</p>
                  <p className="text-xs text-stone-400">
                    {format(parseISO(d.date_at), 'HH:mm')} {d.location ? `· ${d.location}` : ''}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  d.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {d.status === 'confirmed' ? '✓' : '⏳'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">🗓</p>
          <p className="text-stone-500 text-sm">Нет предстоящих свиданий</p>
          <Link href="/dates/new" className="inline-block mt-3 px-4 py-2 bg-rose-500 text-white text-sm rounded-xl">
            Создать
          </Link>
        </div>
      )}
    </div>
  )
}
