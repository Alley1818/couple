'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, MapPin, Clock, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

type DateStatus = 'proposed' | 'confirmed' | 'done' | 'cancelled';

interface DateItem {
  id: string;
  title: string;
  description?: string;
  date_at: string | null;
  location?: string;
  status: DateStatus;
  created_by: string;
  notes?: string;
  lat?: number | null;
  lng?: number | null;
  address?: string;
}

interface DateCardProps {
  date: DateItem;
  currentUserId: string;
  index?: number;
  variant?: 'upcoming' | 'history';
}

const statusConfig: Record<DateStatus, { label: string; color: string; bg: string; dot: string }> = {
  proposed: {
    label: 'На рассмотрении',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
  },
  confirmed: {
    label: 'Подтверждено',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-400',
  },
  done: {
    label: 'Прошло',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    dot: 'bg-rose-400',
  },
  cancelled: {
    label: 'Отменено',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    dot: 'bg-gray-400',
  },
};

export default function DateCard({ date, currentUserId, index = 0, variant = 'upcoming' }: DateCardProps) {
  const status = statusConfig[date.status];
  const isCreator = date.created_by === currentUserId;
  const hasLocation = date.lat && date.lng;

  const formattedDate = date.date_at
      ? format(new Date(date.date_at), 'd MMMM', { locale: ru })
      : null;

  const formattedTime = date.date_at
      ? format(new Date(date.date_at), 'HH:mm', { locale: ru })
      : null;

  if (variant === 'history') {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
          <Link
              href={`/dates/${date.id}`}
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white/60 px-5 py-4 transition hover:border-rose-200 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 line-through decoration-gray-300">
                  {date.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {formattedDate || 'Дата не выбрана'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 transition group-hover:text-rose-400" />
          </Link>
        </motion.div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
      >
        <Link
            href={`/dates/${date.id}`}
            className="group relative block overflow-hidden rounded-3xl border border-rose-100/50 bg-white shadow-sm shadow-rose-100/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200/30"
        >
          {/* Верхняя полоса-статус */}
          <div className={`h-1.5 w-full ${status.dot}`} />

          <div className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{date.title}</h3>
                {date.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{date.description}</p>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${date.status === 'proposed' ? 'animate-pulse' : ''}`} />
                {status.label}
            </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {formattedDate ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-rose-400" />
                    <span>{formattedDate}</span>
                    {formattedTime && formattedTime !== '00:00' && (
                        <span className="text-gray-400">в {formattedTime}</span>
                    )}
                  </div>
              ) : (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <Clock className="h-4 w-4" />
                    <span>Время не выбрано</span>
                  </div>
              )}

              {(date.location || hasLocation) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-400" />
                    <span className="line-clamp-1 max-w-[200px]">{date.location || date.address}</span>
                  </div>
              )}
            </div>

            {!isCreator && date.status === 'proposed' && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                  Партнёр ждёт твоего подтверждения
                </div>
            )}
          </div>

          {/* Hover эффект стрелки */}
          <div className="absolute bottom-5 right-5 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </motion.div>
  );
}