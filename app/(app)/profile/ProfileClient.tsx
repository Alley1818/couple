'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User,
    Copy,
    CheckCircle2,
    LogOut,
    Heart,
    Calendar,
    ArrowLeft,
    Link as LinkIcon,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface ProfileClientProps {
    user: {
        id: string;
        display_name: string;
        couple_id: string;
        created_at: string;
    };
    couple: {
        id: string;
        invite_code: string;
        created_at: string;
    };
    partner: {
        id: string;
        display_name: string;
    } | null;
}

export default function ProfileClient({ user, couple, partner }: ProfileClientProps) {
    const router = useRouter();
    const [name, setName] = useState(user.display_name);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${couple.invite_code}`;

    const handleSaveName = async () => {
        if (!name.trim() || name === user.display_name) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_name: name.trim() }),
            });
            if (!res.ok) throw new Error();
            router.refresh();
        } finally {
            setIsSaving(false);
        }
    };

    const copyInvite = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            router.push('/login');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-rose-100/50 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-lg items-center px-5 py-4">
                    <Link
                        href="/"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-rose-100 hover:text-rose-600"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="ml-4 text-xl font-bold text-gray-900">Профиль</h1>
                </div>
            </div>

            <div className="mx-auto max-w-lg px-5 pt-8">
                {/* Аватар + имя */}
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/20">
                        <User className="h-10 w-10" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">{user.display_name}</h2>
                    <p className="mt-1 text-sm text-gray-500">В паре с {partner?.display_name || '...'}</p>
                </div>

                <div className="space-y-4">
                    {/* Смена имени */}
                    <div className="rounded-2xl border border-rose-100/50 bg-white p-5 shadow-sm">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Ваше имя</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={isSaving || !name.trim() || name === user.display_name}
                                className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 disabled:opacity-50"
                            >
                                {isSaving ? '...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>

                    {/* Invite ссылка */}
                    <div className="rounded-2xl border border-rose-100/50 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-rose-400" />
                            <h3 className="text-sm font-semibold text-gray-900">Пригласить партнёра</h3>
                        </div>
                        <p className="mb-3 text-xs text-gray-500">
                            Отправь эту ссылку второй половинке. Она работает один раз.
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1 overflow-hidden rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-2.5">
                                <code className="block truncate text-xs text-rose-700">{inviteUrl}</code>
                            </div>
                            <button
                                onClick={copyInvite}
                                className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600"
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Готово' : 'Копировать'}
                            </button>
                        </div>
                    </div>

                    {/* Инфо о паре */}
                    <div className="rounded-2xl border border-rose-100/50 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">О паре</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <Heart className="h-4 w-4 text-rose-400" />
                  Партнёр
                </span>
                                <span className="font-medium text-gray-900">{partner?.display_name || 'Не подключён'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4 text-rose-400" />
                  Дата создания пары
                </span>
                                <span className="font-medium text-gray-900">
                  {new Date(couple.created_at).toLocaleDateString('ru-RU')}
                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  Код пары
                </span>
                                <span className="font-mono font-medium text-gray-900">{couple.invite_code}</span>
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="pt-4">
                        {!showLogoutConfirm ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                                <LogOut className="h-4 w-4" />
                                Выйти из аккаунта
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <p className="text-center text-sm text-gray-600">Точно выйти?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}