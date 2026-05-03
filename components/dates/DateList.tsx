'use client';

import DateCard from './DateCard';

type DateItem = {
  id: string;
  title: string;
  description?: string;
  date_at: string | null;
  location?: string;
  status: 'proposed' | 'confirmed' | 'done' | 'cancelled';
  created_by: string;
  notes?: string;
  lat?: number | null;
  lng?: number | null;
  address?: string;
};

interface DateListProps {
  upcoming: DateItem[];
  history: DateItem[];
  currentUserId: string;
}

export default function DateList({ upcoming, history, currentUserId }: DateListProps) {
  return (
      <div className="space-y-8">
        {/* Предстоящие */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-rose-200 to-transparent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Предстоящие
          </span>
            <div className="h-px flex-1 bg-gradient-to-l from-rose-200 to-transparent" />
          </div>

          {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 py-12 text-center">
                <p className="text-sm text-gray-500">Пока ничего не запланировано</p>
                <p className="mt-1 text-xs text-gray-400">Создайте первое свидание!</p>
              </div>
          ) : (
              <div className="space-y-3">
                {upcoming.map((date, i) => (
                    <DateCard
                        key={date.id}
                        date={date}
                        currentUserId={currentUserId}
                        index={i}
                        variant="upcoming"
                    />
                ))}
              </div>
          )}
        </section>

        {/* История */}
        {history.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              История
            </span>
                <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
              </div>

              <div className="space-y-2">
                {history.map((date, i) => (
                    <DateCard
                        key={date.id}
                        date={date}
                        currentUserId={currentUserId}
                        index={i}
                        variant="history"
                    />
                ))}
              </div>
            </section>
        )}
      </div>
  );
}