import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'DateApp',
        short_name: 'DA',
        description: 'Приватное приложение для планирования свиданий',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff1f2',
        theme_color: '#f43f5e',
        orientation: 'portrait',
        icons: [
            {
                src: 'public/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: 'public/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: 'public/icons/icon-192x192-maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}