'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
    id: string;
    text: string;
    created_at: string;
    user_id: string;
    users: { display_name: string };
}

interface DateChatProps {
    dateId: string;
    currentUserId: string;
}

export default function DateChat({ dateId, currentUserId }: DateChatProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchComments();
        // Realtime подписка
        const channel = new BroadcastChannel(`date-chat-${dateId}`);
        channel.onmessage = () => fetchComments();
        return () => channel.close();
    }, [dateId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const fetchComments = async () => {
        const res = await fetch(`/api/dates/comments?dateId=${dateId}`);
        const data = await res.json();
        setComments(data.comments || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/dates/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dateId, text }),
            });
            if (res.ok) {
                setText('');
                fetchComments();
                // Уведомляем другие вкладки
                new BroadcastChannel(`date-chat-${dateId}`).postMessage('refresh');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-rose-100 bg-white shadow-sm">
            <div className="border-b border-rose-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">💬 Обсуждение</h3>
            </div>

            <div className="h-64 overflow-y-auto px-4 py-3">
                {comments.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        Начните обсуждение свидания...
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {comments.map((c) => {
                                const isMe = c.user_id === currentUserId;
                                return (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isMe ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                            <p className="text-xs opacity-70 mb-0.5">{c.users?.display_name || '...'}</p>
                                            <p className="text-sm">{c.text}</p>
                                            <p className={`mt-1 text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                                {new Date(c.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-rose-50 p-3">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Написать сообщение..."
                    className="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md transition hover:bg-rose-600 disabled:opacity-50"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}