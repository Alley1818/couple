'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Calendar, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50/30">
            {/* Hero */}
            <div className="mx-auto max-w-lg px-5 pt-16 pb-12 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl shadow-rose-500/20"
                >
                    <Heart className="h-10 w-10 text-white fill-white" />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-bold text-gray-900"
                >
                    DateApp
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-lg text-gray-600"
                >
                    Планируйте свидания вместе. <br />
                    <span className="text-rose-500 font-semibold">Приватно. Красиво. Вдвоём.</span>
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 flex flex-col gap-3"
                >
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 hover:shadow-rose-500/40"
                    >
                        Начать
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                    <p className="text-sm text-gray-400">Бесплатно. Без рекламы.</p>
                </motion.div>
            </div>

            {/* Features */}
            <div className="mx-auto max-w-lg px-5 py-12">
                <div className="grid gap-4">
                    <FeatureCard
                        icon={Calendar}
                        title="Календарь свиданий"
                        description="Планируйте заранее и не пропускайте важные даты"
                        color="bg-blue-50 text-blue-500"
                    />
                    <FeatureCard
                        icon={Sparkles}
                        title="Банк идей"
                        description="Сохраняйте идеи и голосуйте за них вдвоём"
                        color="bg-amber-50 text-amber-500"
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Приватность"
                        description="Только вы двое. Никаких соцсетей."
                        color="bg-emerald-50 text-emerald-500"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="pb-12 text-center">
                <p className="text-sm text-gray-400">
                    Сделано с <Heart className="inline h-3 w-3 text-rose-400 fill-rose-400" /> для пар
                </p>
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, color }: {
    icon: typeof Heart;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
        </motion.div>
    );
}