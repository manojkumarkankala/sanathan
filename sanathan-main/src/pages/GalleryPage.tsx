import { useEffect, useState } from 'react';
import { Images, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Photo, FestivalYear } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { PhotoViewer } from '@/components/PhotoViewer';
import { LoadingSpinner, EmptyState } from '@/components/States';

const CATEGORIES = ['All', 'Ganesh Idol', 'Decorations', 'Puja', 'Procession', 'Cultural Programs', 'Youth Activities', 'Community Activities', 'Special Moments', 'Festival Night', 'Dance', 'Music'];

export function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: photosData }, { data: yearsData }] = await Promise.all([
        supabase.from('photos').select('*').order('year', { ascending: false }).order('sort_order'),
        supabase.from('festival_years').select('year').order('year', { ascending: false }),
      ]);
      if (photosData) setPhotos(photosData);
      if (yearsData) setYears(yearsData.map(y => y.year));
      setLoading(false);
    })();
  }, []);

  const filtered = photos.filter(p => {
    if (yearFilter !== 'All' && p.year !== parseInt(yearFilter)) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    return true;
  });

  if (loading) return <LoadingSpinner label="Loading gallery..." />;

  return (
    <>
      <SEO
        title="Photo Gallery — Vinayaka Chavithi | Sanathan Youth"
        description="Browse our complete photo gallery of Vinayaka Chavithi celebrations across all years."
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <section className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <img src={FESTIVAL_IMAGES.flowers1} alt="Gallery" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/70 to-black/90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-gold text-shadow-lg">VINAYAKA CHAVITHI GALLERY</h1>
          <p className="text-cream/80 font-heading mt-2">Every photo tells a story of devotion</p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          {photos.length === 0 ? (
            <EmptyState icon={Images} title="No Photos Yet" message="Photos will appear here once they're uploaded." />
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-outline-festival lg:hidden"
                >
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
                {CATEGORIES.map(cat => (
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

              <p className="text-center text-maroon/50 text-sm mb-6">{filtered.length} photos</p>

              {filtered.length === 0 ? (
                <EmptyState icon={Images} title="No Photos Match" message="Try different filters." />
              ) : (
                <div className="masonry-grid">
                  {filtered.map((photo, i) => (
                    <Reveal key={photo.id} delay={(i % 8) * 50}>
                      <div
                        className="masonry-item group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                        onClick={() => setViewerIndex(i)}
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption || photo.title}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-cream text-xs font-heading">{photo.caption || photo.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge-festival bg-gold/80 text-maroon text-[10px]">{photo.year}</span>
                            <span className="badge-festival bg-primary-500/80 text-white text-[10px]">{photo.category}</span>
                          </div>
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

      {viewerIndex !== null && (
        <PhotoViewer photos={filtered} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>
  );
}
