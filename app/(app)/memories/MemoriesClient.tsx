'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Calendar, MapPin, Filter } from 'lucide-react';
import Link from 'next/link';
import FloatingNav from '@/components/layout/FloatingNav';

interface Memory {
    id: string;
    title: string;
    description: string;
    date_at: string;
    location: string;
    address: string;
    category: string;
    created_by: string;
    users: { display_name: string };
    photos?: string[];
}

interface MemoriesClientProps {
    initialMemories: Memory[];
    coupleId: string;
}

export default function MemoriesClient({ initialMemories, coupleId }: MemoriesClientProps) {
    const [memories, setMemories] = useState(initialMemories);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<'all' | 'restaurant' | 'activity' | 'travel' | 'home'>('all');

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        const res = await fetch(`/api/memories?page=${page + 1}&filter=${filter}&coupleId=${coupleId}`);
        const data = await res.json();

        if (data.memories.length === 0) {
            setHasMore(false);
        } else {
            setMemories((prev) => [...prev, ...data.memories]);
            setPage((p) => p + 1);
        }
        setLoading(false);
    }, [page, loading, hasMore, filter, coupleId]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                loadMore();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    const filteredMemories = filter === 'all'
        ? memories
        : memories.filter((m) => m.category === filter);

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-white pb-32">
            <div className="mx-auto max-w-lg px-5 pt-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Воспоминания</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {memories.length} свиданий вместе
                    </p>
                </div>

                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'Все' },
                        { key: 'restaurant', label: 'Рестораны' },
                        { key: 'activity', label: 'Активности' },
                        { key: 'travel', label: 'Путешествия' },
                        { key: 'home', label: 'Дома' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                                filter === f.key
                                    ? 'bg-rose-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {filteredMemories.map((memory, i) => (
                        <MemoryCard key={memory.id} memory={memory} index={i} />
                    ))}
                </div>

                {loading && (
                    <div className="py-8 text-center text-sm text-gray-400">Загрузка...</div>
                )}
            </div>

            <FloatingNav />
        </div>
    );
}

function MemoryCard({ memory, index }: { memory: Memory; index: number }) {
    const [liked, setLiked] = useState(false);
    const daysAgo = differenceInDays(new Date(), new Date(memory.date_at));

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm"
        >
            <div className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white text-sm font-bold">
                    {memory.users?.display_name?.charAt(0) || '?'}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{memory.users?.display_name}</p>
                    <p className="text-xs text-gray-500">
                        {daysAgo === 0 ? 'Сегодня' : `${daysAgo} дн. назад`} • {format(new Date(memory.date_at), 'd MMMM yyyy', { locale: ru })}
                    </p>
                </div>
            </div>

            {memory.photos && memory.photos.length > 0 && (
                <div className={`grid gap-1 ${memory.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {memory.photos.map((photo, i) => (
                        <div key={i} className={`aspect-square overflow-hidden ${memory.photos!.length === 1 ? 'max-h-96' : ''}`}>
                            <img src={photo} alt="" className="h-full w-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{memory.title}</h3>
                {memory.description && (
                    <p className="mt-1 text-sm text-gray-600">{memory.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(memory.date_at), 'd MMMM', { locale: ru })}
                    </span>
                    {(memory.location || memory.address) && (
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {memory.location || memory.address}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-3">
                <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-1.5 text-sm transition ${liked ? 'text-rose-500' : 'text-gray-500'}`}
                >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-rose-500' : ''}`} />
                    {liked ? 'Нравится' : 'Лайк'}
                </button>
                <Link href={`/dates/${memory.id}`} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MessageCircle className="h-5 w-5" />
                    Комментарии
                </Link>
            </div>
        </motion.article>
    );
}