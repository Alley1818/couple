'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    link: string;
    created_at: string;
}

export default function NotificationBell() {
    const [count, setCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // polling каждые 30 сек
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnread = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setCount(data.unreadCount || 0);
        } catch {
            // silently fail
        }
    };

    const markAllRead = async () => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ readAll: true }),
        });
        fetchUnread();
    };

    const markRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        fetchUnread();
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition hover:bg-rose-200"
            >
                <Bell className="h-5 w-5" />
                {count > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
                    >
                        {count > 9 ? '9+' : count}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-rose-50 px-4 py-3">
                            <h3 className="text-sm font-semibold text-gray-900">Уведомления</h3>
                            {count > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-rose-500 transition hover:text-rose-600"
                                >
                                    <Check className="h-3 w-3" />
                                    Прочитать все
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Bell className="mx-auto h-8 w-8 text-gray-200" />
                                    <p className="mt-2 text-xs text-gray-400">Нет уведомлений</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={n.link || '#'}
                                        onClick={() => !n.read && markRead(n.id)}
                                        className={`block border-b border-gray-50 px-4 py-3 transition last:border-0 ${
                                            n.read ? 'bg-white' : 'bg-rose-50/50'
                                        } hover:bg-rose-50`}
                                    >
                                        <p className={`text-sm ${n.read ? 'text-gray-500' : 'font-medium text-gray-900'}`}>
                                            {n.title}
                                        </p>
                                        {n.message && <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>}
                                        <p className="mt-1 text-[10px] text-gray-400">
                                            {new Date(n.created_at).toLocaleDateString('ru-RU')}
                                        </p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}