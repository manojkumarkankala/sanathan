import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Images, Video, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { FestivalYear } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { getFestivalStatus, formatDateShort } from '@/lib/utils';

export function AllYearsPage() {
  const [years, setYears] = useState<FestivalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoCounts, setPhotoCounts] = useState<Record<number, number>>({});
  const [videoCounts, setVideoCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    (async () => {
      const [{ data: yearsData }, { data: photos }, { data: videos }] = await Promise.all([
        supabase.from('festival_years').select('*').order('year', { ascending: false }),
        supabase.from('photos').select('year'),
        supabase.from('videos').select('year'),
      ]);

      if (yearsData) setYears(yearsData);
      if (photos) {
        const counts: Record<number, number> = {};
        photos.forEach(p => { if (p.year) counts[p.year] = (counts[p.year] || 0) + 1; });
        setPhotoCounts(counts);
      }
      if (videos) {
        const counts: Record<number, number> = {};
        videos.forEach(v => { if (v.year) counts[v.year] = (counts[v.year] || 0) + 1; });
        setVideoCounts(counts);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading festival years..." />;

  return (
    <>
      <SEO
        title="All Years — Vinayaka Chavithi | Sanathan Youth"
        description="Explore every year of our Vinayaka Chavithi celebrations. A complete archive of festival memories."
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img src={FESTIVAL_IMAGES.hero} alt="All Years" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/80 to-black/90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-gold text-shadow-lg mb-2">
            VINAYAKA CHAVITHI
          </h1>
          <p className="text-cream/80 font-heading">All Years • Complete Festival Archive</p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          {years.length === 0 ? (
            <EmptyState icon={Calendar} title="No Festival Years Yet" message="Check back soon for our festival archive." />
          ) : (
            <>
              <SectionHeading
                title="Every Celebration, Every Year"
                subtitle="Click any year to explore its complete festival page — photos, videos, schedule, and memories."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {years.map((year, i) => {
                  const status = getFestivalStatus(year.start_date, year.end_date);
                  return (
                    <Reveal key={year.id} delay={i * 100}>
                      <Link to={`/vinayaka-chavithi/${year.slug}`}>
                        <div className="card-festival group h-full flex flex-col">
                          <div className="relative h-64 overflow-hidden">
                            <img
                              src={year.banner_url || FESTIVAL_IMAGES.ganesh1}
                              alt={year.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            <div className="absolute top-4 left-4 flex gap-2">
                              <span className="badge-festival bg-gold/90 text-maroon">{year.year}</span>
                              {status === 'live' && (
                                <span className="badge-festival bg-accent-500 text-white animate-pulse">LIVE</span>
                              )}
                              {status === 'upcoming' && (
                                <span className="badge-festival bg-success-500 text-white">UPCOMING</span>
                              )}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="font-display font-bold text-2xl text-white text-shadow-md">{year.title}</h3>
                              <p className="text-cream/80 text-sm mt-1">{formatDateShort(year.start_date)}</p>
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <p className="text-maroon/60 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                              {year.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-maroon/50 mb-4">
                              <span className="flex items-center gap-1">
                                <Images size={14} /> {photoCounts[year.year] || 0} Photos
                              </span>
                              <span className="flex items-center gap-1">
                                <Video size={14} /> {videoCounts[year.year] || 0} Videos
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={14} /> {year.location_name}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="flex-1 text-center py-2 rounded-xl bg-primary-50 text-primary-700 font-heading font-semibold text-xs group-hover:bg-primary-500 group-hover:text-white transition-colors flex items-center justify-center gap-1">
                                View Memories <ArrowRight size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
