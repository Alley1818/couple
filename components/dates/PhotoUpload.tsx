'use client';

import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

interface PhotoUploadProps {
    dateId: string;
    existingPhotos: string[];
    onPhotosChange: (photos: string[]) => void;
}

const COMPRESSION_OPTIONS = {
    maxSizeMB: 0.5,        // Максимум 500KB после сжатия
    maxWidthOrHeight: 1920, // Максимальная сторона 1920px
    useWebWorker: true,     // Сжатие в отдельном потоке
    fileType: 'image/webp', // Конвертируем в WebP
};

export default function PhotoUpload({ dateId, existingPhotos, onPhotosChange }: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [photos, setPhotos] = useState(existingPhotos);
    const [compressing, setCompressing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCompressing(true);
        try {
            // Сжимаем перед загрузкой
            const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

            console.log('Original:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            console.log('Compressed:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

            setCompressing(false);
            setUploading(true);

            const formData = new FormData();
            formData.append('dateId', dateId);
            formData.append('file', compressedFile, `${Date.now()}.webp`);

            const res = await fetch('/api/dates/photos', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.url) {
                const newPhotos = [...photos, data.url];
                setPhotos(newPhotos);
                onPhotosChange(newPhotos);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            setCompressing(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDelete = async (url: string, index: number) => {
        const path = url.split('/date-photos/')[1];
        if (!path) return;

        await fetch(`/api/dates/photos?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        onPhotosChange(newPhotos);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Фото воспоминаний {photos.length > 0 && `(${photos.length}/10)`}
                </p>
                {photos.length < 10 && (
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading || compressing}
                        className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                        {compressing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : uploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Camera className="h-3.5 w-3.5" />
                        )}
                        {compressing ? 'Сжатие...' : uploading ? 'Загрузка...' : 'Добавить'}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
            />

            <div className="grid grid-cols-3 gap-2">
                <AnimatePresence>
                    {photos.map((url, i) => (
                        <motion.div
                            key={url}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-square overflow-hidden rounded-xl"
                        >
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                                onClick={() => handleDelete(url, i)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}