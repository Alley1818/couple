'use client';

interface GoogleMapEmbedProps {
    address?: string;
    className?: string;
}

export default function GoogleMapEmbed({ address, className = '' }: GoogleMapEmbedProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!address || !apiKey) {
        return (
            <div className={`flex items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-400 ${className}`} style={{ minHeight: 200 }}>
                Адрес не указан
            </div>
        );
    }

    return (
        <div className={`overflow-hidden rounded-2xl border border-rose-100/50 shadow-sm ${className}`}>
            <iframe
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&language=ru`}
            />
        </div>
    );
}