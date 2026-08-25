import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Video } from '@/lib/types';
import { getYouTubeId } from '@/lib/utils';

interface VideoModalProps {
  video: Video;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    const ytId = getYouTubeId(video.video_url);
    if (ytId) {
      setEmbedUrl(`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`);
    } else {
      setEmbedUrl(video.video_url);
    }
  }, [video]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        aria-label="Close"
      >
        <X size={24} />
      </button>
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
          {embedUrl.includes('youtube.com/embed') ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={embedUrl} controls autoPlay className="w-full h-full" />
          )}
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-cream font-heading font-bold text-xl">{video.title}</h3>
          {video.description && (
            <p className="text-cream/70 text-sm mt-1">{video.description}</p>
          )}
          <div className="flex items-center justify-center gap-3 mt-2 text-cream/50 text-xs">
            <span>{video.category}</span>
            {video.year && <span>• {video.year}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
