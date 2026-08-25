import { useEffect, useState } from 'react';
import { Video, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Video as VideoType, FestivalYear } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { VideoModal } from '@/components/VideoModal';
import { LoadingSpinner, EmptyState } from '@/components/States';

const VIDEO_CATEGORIES = ['All', 'Festival Videos', 'Puja Videos', 'Cultural Programs', 'Dance', 'Music', 'Procession', 'Youth Activities', 'Special Moments', 'Interviews', 'Short Videos', 'Previous Years'];

export function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: vids }, { data: yrs }] = await Promise.all([
        supabase.from('videos').select('*').order('year', { ascending: false }).order('sort_order'),
        supabase.from('festival_years').select('year').order('year', { ascending: false }),
      ]);
      if (vids) setVideos(vids);
      if (yrs) setYears(yrs.map(y => y.year));
      setLoading(false);
    })();
  }, []);

  const filtered = videos.filter(v => {
    if (yearFilter !== 'All' && v.year !== parseInt(yearFilter)) return false;
    if (categoryFilter !== 'All' && v.category !== categoryFilter) return false;
    return true;
  });

  if (loading) return <LoadingSpinner label="Loading videos..." />;

  return (
    <>
      <SEO
        title="Videos — Vinayaka Chavithi | Sanathan Youth"
        description="Watch videos from our Vinayaka Chavithi celebrations — cultural programs, pujas, processions, and more."
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <section className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <img src={FESTIVAL_IMAGES.dance1} alt="Videos" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/70 to-black/90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-gold text-shadow-lg">VINAYAKA CHAVITHI VIDEOS</h1>
          <p className="text-cream/80 font-heading mt-2">Relive the celebration in motion</p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          {videos.length === 0 ? (
            <EmptyState icon={Video} title="No Videos Yet" message="Videos will appear here once they're uploaded." />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <button onClick={() => setShowFilters(!showFilters)} className="btn-outline-festival lg:hidden">
                  <Filter size={16} /> Filters
                </button>
                <div className={`flex flex-wrap items-center justify-center gap-2 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                  <span className="text-sm font-heading text-maroon/60 mr-2">Year:</span>
                  {['All', ...years.map(String)].map(y => (
                    <button
                      key={y}
                      onClick={() => setYearFilter(y)}
                      className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-all ${
                        yearFilter === y ? 'bg-primary-500 text-white shadow-lg' : 'bg-white text-maroon/60 hover:bg-primary-100'
                      }`}
                    >
                      {y === 'All' ? 'All Years' : y}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`flex flex-wrap items-center justify-center gap-2 mb-8 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                <span className="text-sm font-heading text-maroon/60 mr-2">Category:</span>
                {VIDEO_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-heading font-medium transition-all ${
                      categoryFilter === cat ? 'bg-gold text-maroon shadow-lg' : 'bg-white text-maroon/60 hover:bg-gold/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <EmptyState icon={Video} title="No Videos Match" message="Try different filters." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((video, i) => (
                    <Reveal key={video.id} delay={(i % 3) * 80}>
                      <div className="card-festival group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={video.thumbnail_url || FESTIVAL_IMAGES.ganesh1}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500/50 transition-all">
                              <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[14px] border-y-transparent ml-1" />
                            </div>
                          </div>
                          <span className="absolute top-2 right-2 badge-festival bg-black/60 text-cream">{video.year}</span>
                          <span className="absolute top-2 left-2 badge-festival bg-primary-500/80 text-white">{video.category}</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-heading font-bold text-maroon line-clamp-1">{video.title}</h3>
                          {video.description && <p className="text-maroon/50 text-xs mt-1 line-clamp-2">{video.description}</p>}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </>
  );
}
