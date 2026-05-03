'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Utensils, Mountain, Plane, Home, Sparkles, Trash2 } from 'lucide-react';

type Category = 'restaurant' | 'activity' | 'travel' | 'home' | 'other';

interface Idea {
    id: string;
    title: string;
    description: string;
    category: Category;
    created_by: string;
    couple_id: string;
}

interface Vote {
    idea_id: string;
    user_id: string;
}

interface IdeaGridProps {
    ideas: Idea[];
    votes: Vote[];
    currentUserId: string;
}

const categoryConfig: Record<Category, { label: string; icon: typeof Utensils; color: string; bg: string }> = {
    restaurant: { label: 'Ресторан', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
    activity: { label: 'Активность', icon: Mountain, color: 'text-blue-600', bg: 'bg-blue-50' },
    travel: { label: 'Путешествие', icon: Plane, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    home: { label: 'Дома', icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
    other: { label: 'Другое', icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function IdeaGrid({ ideas, votes, currentUserId }: IdeaGridProps) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [votingId, setVotingId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', description: '', category: 'other' as Category });

    const getVotesForIdea = (ideaId: string) => votes.filter((v) => v.idea_id === ideaId);
    const hasVoted = (ideaId: string) => getVotesForIdea(ideaId).some((v) => v.user_id === currentUserId);
    const isMutual = (ideaId: string) => getVotesForIdea(ideaId).length >= 2;

    const handleVote = async (ideaId: string) => {
        setVotingId(ideaId);
        const action = hasVoted(ideaId) ? 'unvote' : 'vote';
        try {
            const res = await fetch('/api/ideas/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ideaId, action }),
            });
            if (res.ok) router.refresh();
        } finally {
            setVotingId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    category: form.category,
                }),
            });
            if (res.ok) {
                setForm({ title: '', description: '', category: 'other' });
                setIsAdding(false);
                router.refresh();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Кнопка добавить */}
    {!isAdding && (
        <motion.button
            whileTap={{ scale: 0.98 }}
        onClick={() => setIsAdding(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-4 text-sm font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
        >
        <Plus className="h-5 w-5" />
            Добавить идею
    </motion.button>
    )}

    {/* Форма добавления */}
    <AnimatePresence>
        {isAdding && (
        <motion.form
            initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    onSubmit={handleSubmit}
    className="overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
    >
    <input
        type="text"
    placeholder="Название идеи..."
    value={form.title}
    onChange={(e) => setForm({ ...form, title: e.target.value })}
    className="mb-3 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    autoFocus
    />
    <textarea
        placeholder="Описание (необязательно)"
    value={form.description}
    onChange={(e) => setForm({ ...form, description: e.target.value })}
    rows={2}
    className="mb-3 w-full resize-none rounded-xl border border-rose-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    />
    <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const Icon = cfg.icon;
            const isActive = form.category === cat;
            return (
                <button
                    key={cat}
            type="button"
            onClick={() => setForm({ ...form, category: cat })}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isActive
                    ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-rose-200`
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
        >
            <Icon className="h-3.5 w-3.5" />
                {cfg.label}
                </button>
        );
        })}
    </div>
    <div className="flex gap-2">
    <button
        type="button"
    onClick={() => setIsAdding(false)}
    className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
        Отмена
        </button>
        <button
    type="submit"
    disabled={isSubmitting || !form.title.trim()}
    className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 disabled:opacity-50"
        >
        {isSubmitting ? '...' : 'Добавить'}
        </button>
        </div>
        </motion.form>
)}
    </AnimatePresence>

    {/* Сетка идей */}
    <div className="grid gap-3">
        {ideas.length === 0 && !isAdding && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">Пока нет идей</p>
                <p className="mt-1 text-xs text-gray-400">Добавьте первую!</p>
                </div>
)}

    {ideas.map((idea, i) => {
        const cfg = categoryConfig[idea.category];
        const Icon = cfg.icon;
        const ideaVotes = getVotesForIdea(idea.id);
        const voted = hasVoted(idea.id);
        const mutual = isMutual(idea.id);

        return (
            <motion.div
                key={idea.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className={`relative rounded-2xl border bg-white p-5 shadow-sm transition ${
            mutual ? 'border-rose-200 shadow-rose-100/30' : 'border-gray-100'
        }`}
    >
        {mutual && (
            <div className="absolute -top-2 left-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                Оба хотят!
        </div>
        )}

        <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}>
        <Icon className="h-5 w-5" />
        </div>
        <div>
        <h3 className="font-semibold text-gray-900">{idea.title}</h3>
        {idea.description && (
            <p className="mt-0.5 text-sm text-gray-500">{idea.description}</p>
        )}
        <span className={`mt-1 inline-block text-xs font-medium ${cfg.color}`}>
        {cfg.label}
        </span>
        </div>
        </div>

        <button
        onClick={() => handleVote(idea.id)}
        disabled={votingId === idea.id}
        className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition ${
            voted
                ? 'bg-rose-50 text-rose-500'
                : 'bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-400'
        }`}
    >
        <Heart
            className={`h-5 w-5 transition ${voted ? 'fill-rose-400 text-rose-400' : ''} ${
            votingId === idea.id ? 'animate-pulse' : ''
        }`}
        />
        <span className="text-[10px] font-medium">{ideaVotes.length}</span>
            </button>
            </div>
            </motion.div>
    );
    })}
    </div>
    </div>
);
}