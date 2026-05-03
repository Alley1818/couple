'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

type DateItem = {
  id: string
  title: string
  description?: string
  date_at: string | null
  location?: string
  notes?: string
  status: 'proposed' | 'confirmed' | 'done' | 'cancelled'
  created_by: string
  couple_id: string
}

const statusStyle = {
  proposed:  { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Ожидает подтверждения' },
  confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Подтверждено ✓' },
  done:      { bg: 'bg-stone-100 text-stone-400 border-stone-200', label: 'Прошло' },
  cancelled: { bg: 'bg-red-50 text-red-400 border-red-200', label: 'Отменено' },
}

export default function DateDetailClient({
  date: initial,
  currentUserId,
  coupleId,
  initialPhotos,
}: {
  date: DateItem
  currentUserId: string
  coupleId: string
  initialPhotos: string[]
}) {
  const [date, setDate] = useState(initial)
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [proposingTime, setProposingTime] = useState(false)
  const [newDateTime, setNewDateTime] = useState('')
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const isCreator = date.created_by === currentUserId
  const canConfirm = date.status === 'proposed' && !isCreator
  const canDone = date.status === 'confirmed'
  const st = statusStyle[date.status]

  async function updateStatus(status: string) {
    setLoading(true)
    const res = await fetch('/api/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: date.id, status }),
    })
    if (res.ok) setDate(d => ({ ...d, status: status as DateItem['status'] }))
    setLoading(false)
  }

  async function saveNotes() {
    await fetch('/api/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: date.id, notes }),
    })
    setEditingNotes(false)
  }

  async function proposeTime() {
    if (!newDateTime) return
    setLoading(true)
    const res = await fetch('/api/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: date.id, date_at: new Date(newDateTime).toISOString() }),
    })
    if (res.ok) {
      setDate(d => ({ ...d, date_at: new Date(newDateTime).toISOString() }))
      setProposingTime(false)
    }
    setLoading(false)
  }

  async function uploadPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length)
    if (!files.length) return
    setUploading(true)
    const newUrls: string[] = []
    for (const file of files) {
      const path = `${coupleId}/${date.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('date-photos').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('date-photos').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }
    setPhotos(p => [...p, ...newUrls])
    setUploading(false)
  }

  return (
    <div className="space-y-4">
      {/* Заголовок + статус */}
      <div className="bg-white rounded-2xl p-5 border border-stone-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-semibold text-stone-900 leading-tight">{date.title}</h1>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 ${st.bg}`}>
            {st.label}
          </span>
        </div>

        {date.location && (
          <p className="text-sm text-stone-500 mb-2">📍 {date.location}</p>
        )}

        {/* Дата */}
        {date.date_at ? (
          <p className="text-sm font-medium text-stone-700">
            🗓 {format(new Date(date.date_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </p>
        ) : (
          <div>
            <p className="text-sm text-amber-600 font-medium mb-2">⏰ Время не выбрано</p>
            {/* Партнёр (не создатель) может предложить время */}
            {!isCreator && !proposingTime && (
              <button
                onClick={() => setProposingTime(true)}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium underline underline-offset-2"
              >
                Предложить время
              </button>
            )}
            {proposingTime && (
              <div className="mt-2 space-y-2">
                <input
                  type="datetime-local"
                  value={newDateTime}
                  onChange={e => setNewDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <div className="flex gap-2">
                  <button onClick={proposeTime} disabled={!newDateTime || loading}
                    className="flex-1 py-2 bg-rose-500 text-white text-sm rounded-lg disabled:opacity-50">
                    Предложить
                  </button>
                  <button onClick={() => setProposingTime(false)}
                    className="px-4 py-2 border border-stone-200 text-stone-400 text-sm rounded-lg">
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {date.description && (
          <p className="text-sm text-stone-500 mt-3 leading-relaxed">{date.description}</p>
        )}
      </div>

      {/* Кнопки действий */}
      {(canConfirm || canDone) && (
        <div className="space-y-2">
          {canConfirm && (
            <div className="flex gap-2">
              <button onClick={() => updateStatus('confirmed')} disabled={loading}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl text-sm disabled:opacity-50 transition-colors">
                ✓ Подтвердить свидание
              </button>
              <button onClick={() => updateStatus('cancelled')} disabled={loading}
                className="px-4 py-3 border border-stone-200 text-stone-400 text-sm rounded-xl hover:bg-stone-50 disabled:opacity-50">
                Отклонить
              </button>
            </div>
          )}
          {canDone && (
            <button onClick={() => updateStatus('done')} disabled={loading}
              className="w-full py-3 border border-stone-200 text-stone-500 text-sm rounded-xl hover:bg-stone-50 disabled:opacity-50">
              Отметить как прошедшее 🎉
            </button>
          )}
        </div>
      )}

      {/* Заметки */}
      <div className="bg-white rounded-2xl p-5 border border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-stone-700">📝 Заметки</h2>
          {!editingNotes && (
            <button onClick={() => setEditingNotes(true)}
              className="text-xs text-rose-500 hover:text-rose-600">
              {notes ? 'Изменить' : 'Добавить'}
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Что взять с собой, пожелания, идеи..."
              rows={4}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={saveNotes}
                className="flex-1 py-2 bg-stone-900 text-white text-sm rounded-lg">
                Сохранить
              </button>
              <button onClick={() => { setEditingNotes(false); setNotes(initial.notes ?? '') }}
                className="px-4 py-2 border border-stone-200 text-stone-400 text-sm rounded-lg">
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500">
            {notes || <span className="text-stone-300 italic">Нет заметок</span>}
          </p>
        )}
      </div>

      {/* Фото воспоминания */}
      {(date.status === 'done' || photos.length > 0) && (
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-stone-700">📸 Воспоминания</h2>
            {photos.length < 3 && (
              <button onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-rose-500 hover:text-rose-600 disabled:opacity-50">
                {uploading ? 'Загружаем...' : '+ Добавить фото'}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={uploadPhotos}
          />
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full py-8 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-sm hover:border-rose-200 transition-colors">
              {uploading ? 'Загружаем...' : '+ Добавить фото с этого свидания'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
