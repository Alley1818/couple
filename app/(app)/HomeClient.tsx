'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
    Heart,
    Calendar,
    MapPin,
    Clock,
    Plus,
    ChevronRight,
    Bell,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DateItem {
    id: string;
    title: string;
    description: string;
    date_at: string | null;
    location: string;
    status: 'proposed' | 'confirmed' | 'done' | 'cancelled';
    created_by: string;
    address: string | null;
}

interface HomeClientProps {
    user: {
        id: string;
        display_name: string;
        couple_id: string;
    };
    partner: {
        id: string;
        display_name: string;
    } | null;
    heroDate: DateItem | null;
    pendingDates: DateItem[];
}

function CountdownHero({ targetDate }: { targetDate: string }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const target = new Date(targetDate);
    const days = Math.max(0, differenceInDays(target, now));
    const hours = Math.max(0, differenceInHours(target, now) % 24);
    const mins = Math.max(0, differenceInMinutes(target, now) % 60);

    const units = [
        { value: days, label: 'дней' },
        { value: hours, label: 'часов' },
        { value: mins, label: 'минут' },
    ];

    return (
        <div className="flex items-end gap-3">
            {units.map((u, i) => (
                <div key={i} className="text-center">
                    <div className="text-3xl font-bold text-white tabular-nums">{u.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">{u.label}</div>
                </div>
            ))}
        </div>
    );
}

export default function HomeClient({ user, partner, heroDate, pendingDates }: HomeClientProps) {
    const router = useRouter();
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleConfirm = async (dateId: string) => {
        setConfirmingId(dateId);
        try {
            const res = await fetch('/api/dates', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: dateId, status: 'confirmed' }),
            });
            if (res.ok) router.refresh();
        } finally {
            setConfirmingId(null);
        }
    };

    const hasPending = pendingDates.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-white pb-32">
            <div className="mx-auto max-w-lg px-5 pt-8">
                {/* Приветствие */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Привет, {user.display_name} <span className="inline-block animate-pulse">💕</span>
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {partner ? `С ${partner.display_name} всё прекрасно` : 'Ждём вторую половинку'}
                        </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                        <Bell className="h-5 w-5" />
                    </div>
                </div>

                {/* Hero: ближайшее свидание */}
                {heroDate ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 p-6 text-white shadow-xl shadow-rose-500/20"
                    >
                        {/* Декоративные круги */}
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute right-10 top-10 h-3 w-3 rounded-full bg-white/30" />
                        <div className="absolute bottom-10 left-10 h-2 w-2 rounded-full bg-white/20" />

                        <div className="relative">
                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
                                <Sparkles className="h-4 w-4" />
                                {heroDate.status === 'confirmed' ? 'Следующее свидание' : 'Предложено свидание'}
                            </div>

                            <h2 className="mt-2 text-2xl font-bold">{heroDate.title}</h2>

                            {heroDate.date_at && (
                                <div className="mt-4">
                                    <CountdownHero targetDate={heroDate.date_at} />
                                    <p className="mt-3 text-xs text-white/60">
                                        {format(new Date(heroDate.date_at), 'EEEE, d MMMM в HH:mm', { locale: ru })}
                                    </p>
                                </div>
                            )}

                            {(heroDate.location || heroDate.address) && (
                                <div className="mt-3 flex items-center gap-1.5 text-sm text-white/70">
                                    <MapPin className="h-4 w-4" />
                                    <span className="line-clamp-1">{heroDate.location || heroDate.address}</span>
                                </div>
                            )}

                            <Link
                                href={`/dates/${heroDate.id}`}
                                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                            >
                                Подробнее
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 p-8 text-center"
                    >
                        <Heart className="mx-auto h-10 w-10 text-rose-300" />
                        <h2 className="mt-3 text-lg font-semibold text-gray-900">Ничего не запланировано</h2>
                        <p className="mt-1 text-sm text-gray-500">Создайте первое свидание вместе</p>
                        <Link
                            href="/dates/new"
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600"
                        >
                            <Plus className="h-4 w-4" />
                            Создать свидание
                        </Link>
                    </motion.div>
                )}

                {/* Ожидают подтверждения */}
                {hasPending && (
                    <section className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Ожидают подтверждения
                            </h3>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {pendingDates.length}
              </span>
                        </div>

                        <div className="space-y-3">
                            {pendingDates.map((date, i) => (
                                <motion.div
                                    key={date.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{date.title}</h4>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                {date.date_at && (
                                                    <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                                                        {format(new Date(date.date_at), 'd MMMM', { locale: ru })}
                          </span>
                                                )}
                                                {(date.location || date.address) && (
                                                    <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                                                        {date.location || date.address}
                          </span>
                                                )}
                                                {!date.date_at && (
                                                    <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="h-3 w-3" />
                            Время не выбрано
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => handleConfirm(date.id)}
                                            disabled={confirmingId === date.id}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-50"
                                        >
                                            <Heart className="h-3.5 w-3.5 fill-white" />
                                            {confirmingId === date.id ? '...' : 'Подтвердить'}
                                        </button>
                                        <Link
                                            href={`/dates/${date.id}`}
                                            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Детали
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Быстрые действия */}
                <section>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Быстрые действия
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/dates/new"
                            className="group flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm transition hover:border-rose-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition group-hover:bg-rose-500 group-hover:text-white">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Новое свидание</span>
                        </Link>

                        <Link
                            href="/ideas"
                            className="group flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm transition hover:border-rose-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-white">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Идеи</span>
                        </Link>

                        <Link
                            href="/calendar"
                            className="group flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm transition hover:border-rose-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition group-hover:bg-blue-500 group-hover:text-white">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Календарь</span>
                        </Link>

                        <Link
                            href="/profile"
                            className="group flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm transition hover:border-rose-300 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-500 transition group-hover:bg-purple-500 group-hover:text-white">
                                <Heart className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Профиль</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}