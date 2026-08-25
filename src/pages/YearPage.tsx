import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Award, ChevronRight, Navigation, Images, Video as VideoIcon, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { FestivalYear, FestivalSchedule, FestivalProgram, Photo, Video } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { Countdown } from '@/components/Countdown';
import { ShareButtons } from '@/components/ShareButtons';
import { PhotoViewer } from '@/components/PhotoViewer';
import { VideoModal } from '@/components/VideoModal';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { getFestivalStatus, formatDate, getDirectionsUrl, getMapsEmbedUrl } from '@/lib/utils';

export function YearPage() {
  const { year: yearSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [festivalYear, setFestivalYear] = useState<FestivalYear | null>(null);
  const [schedules, setSchedules] = useState<FestivalSchedule[]>([]);
  const [programs, setPrograms] = useState<FestivalProgram[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]); // Video type
  const [photoViewerIndex, setPhotoViewerIndex] = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<Video | null>(null); // Video type

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: yearData } = await supabase
        .from('festival_years')
        .select('*')
        .eq('slug', yearSlug)
        .maybeSingle();

      if (!yearData) {
        setLoading(false);
        return;
      }

      setFestivalYear(yearData);

      const [sched, prog, ph, vid] = await Promise.all([
        supabase.from('festival_schedules').select('*').eq('festival_year_id', yearData.id).order('sort_order'),
        supabase.from('festival_programs').select('*').eq('festival_year_id', yearData.id).order('created_at'),
        supabase.from('photos').select('*').eq('festival_year_id', yearData.id).order('sort_order').limit(12),
        supabase.from('videos').select('*').eq('festival_year_id', yearData.id).order('sort_order').limit(6),
      ]);

      if (sched.data) setSchedules(sched.data);
      if (prog.data) setPrograms(prog.data);
      if (ph.data) setPhotos(ph.data);
      if (vid.data) setVideos(vid.data);
      setLoading(false);
    })();
  }, [yearSlug]);

  if (loading) return <LoadingSpinner label={`Loading Vinayaka Chavithi ${yearSlug}...`} />;

  if (!festivalYear) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState icon={Calendar} title="Year Not Found" message={`We couldn't find Vinayaka Chavithi ${yearSlug}.`} />
      </div>
    );
  }

  const status = getFestivalStatus(festivalYear.start_date, festivalYear.end_date);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`Vinayaka Chavithi ${festivalYear.year} | Sanathan Youth`}
        description={festivalYear.description}
        image={festivalYear.banner_url || FESTIVAL_IMAGES.ganesh1}
        url={shareUrl}
      />

      {/* Banner */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <img src={festivalYear.banner_url || FESTIVAL_IMAGES.ganesh1} alt={festivalYear.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/70 via-maroon/50 to-black/90" />
        <div className="absolute inset-0 bg-mandala opacity-10" />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="diya-dot" />
            <span className="text-gold text-sm font-heading uppercase tracking-widest">Sanathan Youth</span>
            <span className="diya-dot" />
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-gold text-shadow-lg mb-3">
            {festivalYear.title}
          </h1>
          <p className="text-cream/80 text-lg font-heading mb-4">{formatDate(festivalYear.start_date)}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-cream/70 text-sm">
            <span className="flex items-center gap-1.5"><Clock size={16} className="text-gold" /> {festivalYear.start_time} — {festivalYear.end_time}</span>
            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gold" /> {festivalYear.location_name}</span>
          </div>
        </div>
      </section>

      <section className="bg-cream bg-pattern py-8">
        <div className="container-festival">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-maroon/60">
              <Link to="/vinayaka-chavithi" className="hover:text-primary-600">All Years</Link>
              <ChevronRight size={14} className="inline mx-1" />
              <span className="text-maroon font-heading font-semibold">{festivalYear.year}</span>
            </div>
            <ShareButtons url={shareUrl} title={`Vinayaka Chavithi ${festivalYear.year}`} text={festivalYear.description} />
          </div>
        </div>
      </section>

      {/* Countdown */}
      {status !== 'completed' && (
        <section className="section-padding bg-gradient-to-br from-maroon to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-mandala opacity-10" />
          <div className="container-festival relative z-10 text-center">
            <Countdown targetDate={festivalYear.start_date} status={status} />
          </div>
        </section>
      )}

      {/* Description */}
      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival max-w-4xl">
          <Reveal>
            <SectionHeading title={`${festivalYear.year} Celebration`} />
            <p className="text-maroon/70 text-lg leading-relaxed text-center">{festivalYear.description}</p>
          </Reveal>
        </div>
      </section>

      {/* Schedule */}
      {schedules.length > 0 && (
        <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
          <div className="container-festival">
            <SectionHeading title="Festival Schedule" subtitle="The complete timeline of the day's events." />
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 to-primary-500 md:-translate-x-1/2" />
                {schedules.map((sched, i) => (
                  <Reveal key={sched.id} delay={i * 80}>
                    <div className={`relative flex items-center gap-4 mb-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary-500 ring-4 ring-cream md:-translate-x-1/2 z-10" />
                      <div className="ml-12 md:ml-0 md:w-1/2" />
                      <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:text-right'}`}>
                        <div className="glass-card rounded-2xl p-4">
                          <span className="text-primary-600 font-heading font-bold text-sm">{sched.start_time}</span>
                          {sched.end_time && <span className="text-maroon/40 text-xs"> — {sched.end_time}</span>}
                          <h3 className="font-heading font-semibold text-maroon mt-1">{sched.title}</h3>
                          {sched.description && <p className="text-maroon/50 text-xs mt-1">{sched.description}</p>}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <section className="section-padding bg-cream bg-pattern">
          <div className="container-festival">
            <SectionHeading title="Special Programs" subtitle="Cultural, devotional, and community programs." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((prog, i) => (
                <Reveal key={prog.id} delay={i * 80}>
                  <div className="card-festival h-full">
                    {prog.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="badge-festival bg-primary-100 text-primary-700 mb-2">{prog.category}</span>
                      <h3 className="font-heading font-bold text-maroon text-lg">{prog.title}</h3>
                      <p className="text-maroon/50 text-xs mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {prog.date} • {prog.time}
                      </p>
                      <p className="text-maroon/50 text-xs mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {prog.location}
                      </p>
                      {prog.description && <p className="text-maroon/60 text-sm mt-2">{prog.description}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Details: Chief Guests, Organizers, Achievements */}
      <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
        <div className="container-festival">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {festivalYear.chief_guests && (
              <Reveal>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Users size={32} className="text-primary-500 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-maroon mb-2">Chief Guests</h3>
                  <p className="text-maroon/60 text-sm">{festivalYear.chief_guests}</p>
                </div>
              </Reveal>
            )}
            {festivalYear.organizers && (
              <Reveal delay={100}>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Sparkles size={32} className="text-gold mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-maroon mb-2">Organizers</h3>
                  <p className="text-maroon/60 text-sm">{festivalYear.organizers}</p>
                </div>
              </Reveal>
            )}
            {festivalYear.achievements && (
              <Reveal delay={200}>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Award size={32} className="text-success-500 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-maroon mb-2">Achievements</h3>
                  <p className="text-maroon/60 text-sm">{festivalYear.achievements}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="section-padding bg-cream bg-pattern">
          <div className="container-festival">
            <SectionHeading title="Photos" subtitle={`Memories from Vinayaka Chavithi ${festivalYear.year}`} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <Reveal key={photo.id} delay={(i % 4) * 60}>
                  <div
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer aspect-square"
                    onClick={() => setPhotoViewerIndex(i)}
                  >
                    <img src={photo.image_url} alt={photo.caption || photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/gallery" className="btn-outline-festival">
                <Images size={18} /> View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
          <div className="container-festival">
            <SectionHeading title="Videos" subtitle={`Watch highlights from ${festivalYear.year}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video, i) => (
                <Reveal key={video.id} delay={(i % 3) * 80}>
                  <div className="card-festival group cursor-pointer" onClick={() => setVideoModal(video)}>
                    <div className="relative h-44 overflow-hidden">
                      <img src={video.thumbnail_url || FESTIVAL_IMAGES.ganesh1} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div className="w-0 h-0 border-l-[18px] border-l-white border-y-[12px] border-y-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-heading font-semibold text-sm text-maroon line-clamp-1">{video.title}</h3>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          <SectionHeading title="Festival Location" subtitle="Join us at the celebration." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <Reveal>
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gold/20 h-full min-h-[300px]">
                <iframe
                  src={getMapsEmbedUrl(festivalYear.latitude, festivalYear.longitude, festivalYear.address)}
                  className="w-full h-full min-h-[300px]"
                  loading="lazy"
                  title="Festival Location"
                />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="glass-card rounded-3xl p-8 flex flex-col justify-center">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={28} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-maroon">{festivalYear.location_name}</h3>
                    <p className="text-maroon/60 text-sm mt-1">{festivalYear.address}</p>
                  </div>
                </div>
                <a
                  href={getDirectionsUrl(festivalYear.latitude, festivalYear.longitude, festivalYear.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-festival w-full"
                >
                  <Navigation size={18} /> Get Directions
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="section-padding bg-gradient-to-br from-maroon to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-10" />
        <div className="container-festival relative z-10 text-center">
          <SectionHeading title={`Share Vinayaka Chavithi ${festivalYear.year}`} light />
          <div className="flex justify-center">
            <ShareButtons url={shareUrl} title={`Vinayaka Chavithi ${festivalYear.year}`} text={festivalYear.description} variant="dark" />
          </div>
        </div>
      </section>

      {photoViewerIndex !== null && (
        <PhotoViewer photos={photos} initialIndex={photoViewerIndex} onClose={() => setPhotoViewerIndex(null)} />
      )}
      {videoModal && <VideoModal video={videoModal} onClose={() => setVideoModal(null)} />}
    </>
  );
}
