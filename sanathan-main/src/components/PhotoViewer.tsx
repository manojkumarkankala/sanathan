import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';
import type { Photo } from '@/lib/types';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % photos.length);
    setZoomed(false);
  }, [photos.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoomed(false);
  }, [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [next, prev, onClose]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 sm:left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-primary-500 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 sm:right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-primary-500 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative overflow-auto max-h-[75vh] cursor-zoom-in"
          onClick={() => setZoomed(!zoomed)}
        >
          <img
            src={photo.image_url}
            alt={photo.caption || photo.title}
            className={`max-w-full max-h-[75vh] object-contain transition-transform duration-500 ${zoomed ? 'scale-200' : 'scale-100'}`}
            style={{ transform: zoomed ? 'scale(2)' : 'scale(1)' }}
          />
          {!zoomed && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-lg">
              <ZoomIn size={20} />
            </div>
          )}
        </div>
        <div className="mt-4 text-center px-4">
          {photo.caption && (
            <p className="text-cream/90 text-sm font-heading">{photo.caption}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-2 text-cream/60 text-xs">
            <span>{photo.category}</span>
            {photo.year && <span>• {photo.year}</span>}
            <span>• {index + 1} / {photos.length}</span>
            <a
              href={photo.image_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold hover:text-primary-400 transition-colors"
            >
              <Download size={14} /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
