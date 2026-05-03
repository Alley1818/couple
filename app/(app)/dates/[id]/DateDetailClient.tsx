'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Check,
  X,
  Trash2,
  Heart,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import GoogleMapEmbed from '@/components/maps/GoogleMapEmbed';

type DateStatus = 'proposed' | 'confirmed' | 'done' | 'cancelled';

interface DateDetail {
  id: string;
  title: string;
  description: string;
  date_at: string | null;
  location: string;
  notes: string;
  status: DateStatus;
  created_by: string;
  address: string | null;
  couple_id: string;
}

interface User {
  id: string;
  display_name: string;
}

interface DateDetailClientProps {
  date: DateDetail;
  currentUser: User;
  partner: User | null;
  photos: string[];
}

const statusConfig: Record<DateStatus, { label: string; color: string; bg: string; border: string }> = {
  proposed: { label: 'На рассмотрении', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  confirmed: { label: 'Подтверждено', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  done: { label: 'Прошло', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  cancelled: { label: 'Отменено', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
};

function Countdown({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(new Date());

  // Обновляем каждую минуту
  useState(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  });

  const target = new Date(targetDate);
  const days = differenceInDays(target, now);
  const hours = differenceInHours(target, now) % 24;
  const mins = differenceInMinutes(target, now) % 60;

  if (target < now) return null;

  return (
      <div className="flex items-center gap-3">
        {days > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{days}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/70">дн</div>
            </div>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{hours}</div>
          <div className="text-[10px] uppercase tracking-wider text-white/70">час</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{mins}</div>
          <div className="text-[10px] uppercase tracking-wider text-white/70">мин</div>
        </div>
      </div>
  );
}

export default function DateDetailClient({
                                           date,
                                           currentUser,
                                           partner,
                                           photos,
                                         }: DateDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({
    title: date.title,
    description: date.description,
    location: date.location,
    address: date.address || '',
    date_at: date.date_at ? format(new Date(date.date_at), "yyyy-MM-dd'T'HH:mm") : '',
    notes: date.notes,
  });

  const isCreator = date.created_by === currentUser.id;
  const canConfirm = !isCreator && date.status === 'proposed';
  const status = statusConfig[date.status];

  const formattedDate = date.date_at
      ? format(new Date(date.date_at), 'd MMMM yyyy', { locale: ru })
      : null;
  const formattedTime = date.date_at
      ? format(new Date(date.date_at), 'HH:mm', { locale: ru })
      : null;

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        id: date.id,
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        address: editForm.address || null,
        notes: editForm.notes,
      };

      if (editForm.date_at) {
        body.date_at = new Date(editForm.date_at).toISOString();
      } else {
        body.date_at = null;
      }

      const res = await fetch('/api/dates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      setIsEditing(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: DateStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: date.id, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить свидание?')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dates?id=${date.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.push('/dates');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (date.address) {
      navigator.clipboard.writeText(date.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-white pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-rose-100/50 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
            <Link
                href="/dates"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-rose-100 hover:text-rose-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex gap-2">
              {!isEditing && (
                  <button
                      onClick={() => setIsEditing(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-rose-100 hover:text-rose-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
              )}
              <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-lg px-5 pt-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
                <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                >
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Название</label>
                    <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Описание</label>
                    <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Дата и время</label>
                    <input
                        type="datetime-local"
                        value={editForm.date_at}
                        onChange={(e) => setEditForm({ ...editForm, date_at: e.target.value })}
                        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                    <p className="mt-1 text-xs text-gray-400">Оставьте пустым — партнёр выберет время</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Название места</label>
                    <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Например: Ресторан 'Белуга'"
                        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Адрес для карты</label>
                    <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Москва, Арбат 10"
                        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                    <p className="mt-1 text-xs text-gray-400">Google Maps найдёт это место автоматически</p>

                    {editForm.address && (
                        <div className="mt-3">
                          <GoogleMapEmbed address={editForm.address} />
                        </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Заметки</label>
                    <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                      Отмена
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </motion.div>
            ) : (
                <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                >
                  {/* Hero с градиентом для confirmed */}
                  {date.status === 'confirmed' && date.date_at && new Date(date.date_at) > new Date() && (
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 p-6 text-white shadow-xl shadow-rose-500/20">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                        <p className="relative text-sm font-medium text-white/80">До свидания осталось</p>
                        <div className="relative mt-3">
                          <Countdown targetDate={date.date_at} />
                        </div>
                        <div className="relative mt-4 text-xs text-white/60">
                          {format(new Date(date.date_at), 'EEEE, d MMMM yyyy в HH:mm', { locale: ru })}
                        </div>
                      </div>
                  )}

                  {/* Статус */}
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${status.bg} ${status.color} ${status.border}`}>
                    <span className={`h-2 w-2 rounded-full ${date.status === 'proposed' ? 'animate-pulse bg-amber-400' : date.status === 'confirmed' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                    {status.label}
                  </div>

                  {/* Заголовок */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{date.title}</h1>
                    {date.description && (
                        <p className="mt-2 leading-relaxed text-gray-600">{date.description}</p>
                    )}
                  </div>

                  {/* Мета */}
                  <div className="space-y-3 rounded-2xl border border-rose-100/50 bg-white p-5 shadow-sm shadow-rose-100/20">
                    {formattedDate && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400">Дата</p>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                          </div>
                          {formattedTime && formattedTime !== '00:00' && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                                {formattedTime}
                      </span>
                          )}
                        </div>
                    )}

                    {(date.location || date.address) && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400">Место</p>
                            <p className="font-medium text-gray-900">{date.location || date.address}</p>
                            {date.address && (
                                <button
                                    onClick={copyAddress}
                                    className="mt-1 flex items-center gap-1 text-xs text-rose-500 transition hover:text-rose-600"
                                >
                                  {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  {copied ? 'Скопировано' : 'Скопировать адрес'}
                                </button>
                            )}
                          </div>
                        </div>
                    )}
                  </div>

                  {/* Карта */}
                  {date.address && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Карта</p>
                          <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(date.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-rose-500 transition hover:text-rose-600"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Открыть в Google Maps
                          </a>
                        </div>
                        <GoogleMapEmbed address={date.address} />
                      </div>
                  )}

                  {/* Заметки */}
                  {date.notes && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">Заметки</p>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{date.notes}</p>
                      </div>
                  )}

                  {/* Фото */}
                  {photos.length > 0 && (
                      <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Воспоминания</p>
                        <div className="grid grid-cols-3 gap-2">
                          {photos.map((url, i) => (
                              <div key={i} className="aspect-square overflow-hidden rounded-xl">
                                <img src={url} alt="" className="h-full w-full object-cover transition hover:scale-105" />
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Действия */}
                  <div className="space-y-3 pt-4">
                    {canConfirm && (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStatusChange('confirmed')}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <Heart className="h-5 w-5 fill-white" />
                          Подтвердить свидание
                        </motion.button>
                    )}

                    {date.status === 'confirmed' && (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStatusChange('done')}
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 disabled:opacity-50"
                        >
                          <Check className="h-5 w-5" />
                          Отметить как прошедшее
                        </motion.button>
                    )}

                    {date.status === 'proposed' && isCreator && (
                        <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-500">
                          Ожидание подтверждения от {partner?.display_name || 'партнёра'}
                        </div>
                    )}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
}