import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Images, Video as VideoIcon, Users, Sparkles, TrendingUp, Award, Heart, ChevronRight, Megaphone, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { FestivalYear, Photo, Video, Member, Announcement } from '@/lib/types';
import { FESTIVAL_IMAGES, FESTIVAL_VIBES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { Countdown } from '@/components/Countdown';
import { LoadingSpinner } from '@/components/States';
import { getFestivalStatus, formatDate, getMapsUrl } from '@/lib/utils';

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<FestivalYear | null>(null);
  const [allYears, setAllYears] = useState<FestivalYear[]>([]);
  const [latestPhotos, setLatestPhotos] = useState<Photo[]>([]);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]); // Video type from types.ts
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ years: 0, photos: 0, videos: 0, members: 0, programs: 0 });

  useEffect(() => {
    (async () => {
      const [{ data: years }, { data: photos }, { data: videos }, { data: mems }, { data: anns }, { data: progs }] = await Promise.all([
        supabase.from('festival_years').select('*').order('year', { ascending: false }),
        supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('members').select('*').eq('published', true).order('created_at').limit(6),
        supabase.from('announcements').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('festival_programs').select('id'),
      ]);

      if (years) {
        setAllYears(years);
        const upcoming = years.find(y => {
          const status = getFestivalStatus(y.start_date, y.end_date);
          return status !== 'completed';
        });
        setCurrentYear(upcoming || years[0] || null);
      }
      if (photos) setLatestPhotos(photos);
      if (videos) setLatestVideos(videos);
      if (mems) setMembers(mems);
      if (anns) setAnnouncements(anns);
      setStats({
        years: years?.length || 0,
        photos: photos?.length || 0,
        videos: videos?.length || 0,
        members: mems?.length || 0,
        programs: progs?.length || 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading festival memories..." />;

  const festivalStatus = currentYear ? getFestivalStatus(currentYear.start_date, currentYear.end_date) : 'upcoming';

  return (
    <>
      <SEO
        title="Sanathan Youth — Vinayaka Chavithi Festival"
        description="Celebrating Our Ganesh, Our Culture, Our Village, Our Unity. Explore festival memories, photos, videos, and community."
        image={FESTIVAL_IMAGES.hero}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={FESTIVAL_IMAGES.hero} alt="Vinayaka Chavithi" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-maroon/80 via-maroon/60 to-black/90" />
          <div className="absolute inset-0 bg-mandala opacity-10" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-20">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="diya-dot" />
              <span className="text-gold text-sm font-heading uppercase tracking-widest">Sanathan Youth Presents</span>
              <span className="diya-dot" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-gold text-shadow-lg leading-tight mb-2">
              VINAYAKA CHAVITHI
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-cream/90 text-lg md:text-xl font-heading mb-4 text-shadow-md">
              Celebrating Our Ganesh • Our Culture • Our Village • Our Unity
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-cream/60 text-sm md:text-base font-body mb-8 text-shadow-md">
              Memories • Devotion • Culture • Youth • Community
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="flex flex-wrap gap-3 justify-center">
              {currentYear && (
                <Link to={`/vinayaka-chavithi/${currentYear.slug}`} className="btn-festival">
                  <Calendar size={18} /> Explore This Year's Festival
                </Link>
              )}
              <Link to="/vinayaka-chavithi" className="btn-gold">
                <TrendingUp size={18} /> Explore Previous Years
              </Link>
              <Link to="/gallery" className="btn-outline-festival !text-cream !border-cream hover:!bg-cream hover:!text-maroon">
                <Images size={18} /> Festival Gallery
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-3">
              <Link to="/videos" className="btn-outline-festival !text-cream !border-cream hover:!bg-cream hover:!text-maroon">
                <VideoIcon size={18} /> Festival Videos
              </Link>
              <Link to="/members" className="btn-outline-festival !text-cream !border-cream hover:!bg-cream hover:!text-maroon">
                <Users size={18} /> Our Members
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* Current Year Countdown */}
      {currentYear && (
        <section className="relative -mt-16 z-20 section-padding bg-cream bg-pattern">
          <div className="container-festival">
            <div className="bg-gradient-to-br from-maroon to-black rounded-3xl p-8 md:p-12 shadow-2xl border border-gold/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-mandala opacity-10" />
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <p className="text-gold text-sm font-heading uppercase tracking-widest mb-2">
                    Vinayaka Chavithi {currentYear.year}
                  </p>
                  <h2 className="font-display font-bold text-3xl md:text-5xl text-cream mb-2">
                    {formatDate(currentYear.start_date)}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-cream/70 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-gold" /> {currentYear.start_time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-gold" /> {currentYear.location_name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Countdown targetDate={currentYear.start_date} status={festivalStatus} />
                </div>

                <div className="text-center mt-8">
                  <Link to={`/vinayaka-chavithi/${currentYear.slug}`} className="btn-gold">
                    View Festival Details <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Years Festival Memories */}
      <section className="section-padding bg-gradient-to-b from-cream to-orange-50/50">
        <div className="container-festival">
          <SectionHeading
            title="Vinayaka Chavithi — All Years"
            subtitle="Relive every celebration. Each year tells a unique story of devotion, culture, and community."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allYears.map((year, i) => (
              <Reveal key={year.id} delay={i * 100}>
                <Link to={`/vinayaka-chavithi/${year.slug}`}>
                  <div className="card-festival group h-full">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={year.banner_url || FESTIVAL_IMAGES.ganesh1}
                        alt={`Vinayaka Chavithi ${year.year}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="badge-festival bg-gold/90 text-maroon">
                          {year.year}
                        </span>
                        <h3 className="font-display font-bold text-2xl text-white mt-2 text-shadow-md">
                          {year.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-maroon/60 text-sm leading-relaxed line-clamp-2 mb-4">
                        {year.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-maroon/50">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {year.location_name}</span>
                        <span className="flex items-center gap-1 font-heading font-semibold text-primary-600 group-hover:gap-2 transition-all">
                          View Memories <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Festival Timeline */}
      <section className="section-padding bg-maroon relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-10" />
        <div className="container-festival relative z-10">
          <SectionHeading
            title="Our Vinayaka Chavithi Journey"
            subtitle="From our first celebration to today — a timeline of devotion and growth."
            light
          />
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-gold to-transparent hidden md:block" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-2">
              {[...allYears].reverse().map((year, i) => (
                <Reveal key={year.id} delay={i * 80}>
                  <Link to={`/vinayaka-chavithi/${year.slug}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-gold/30 group-hover:border-gold transition-all group-hover:scale-105">
                      <img
                        src={year.banner_url || FESTIVAL_IMAGES.ganesh1}
                        alt={year.title}
                        className="w-full h-32 md:h-36 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="font-display font-bold text-gold text-lg">{year.year}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Festival Vibes */}
      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          <SectionHeading
            title="Festival Vibes"
            subtitle="Feel the atmosphere of Vinayaka Chavithi — devotion, colors, music, and joy."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {FESTIVAL_VIBES.map((vibe, i) => (
              <Reveal key={vibe.label} delay={(i % 5) * 80}>
                <div className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-44 md:h-52">
                  <img
                    src={vibe.image}
                    alt={vibe.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <Sparkles size={16} className="text-gold mx-auto mb-1" />
                    <h3 className="font-heading font-semibold text-cream text-sm text-shadow-md">{vibe.label}</h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Photos */}
      {latestPhotos.length > 0 && (
        <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
          <div className="container-festival">
            <SectionHeading
              title="Latest Photos"
              subtitle="Fresh memories from our recent celebrations."
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestPhotos.map((photo, i) => (
                <Reveal key={photo.id} delay={(i % 4) * 80}>
                  <Link to="/gallery">
                    <div className="group relative rounded-2xl overflow-hidden shadow-lg aspect-square">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-cream text-xs font-heading">{photo.caption || photo.category}</p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/gallery" className="btn-festival">
                <Images size={18} /> View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Videos */}
      {latestVideos.length > 0 && (
        <section className="section-padding bg-cream bg-pattern">
          <div className="container-festival">
            <SectionHeading
              title="Latest Videos"
              subtitle="Watch the magic of our festival come alive."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestVideos.map((video, i) => (
                <Reveal key={video.id} delay={(i % 4) * 80}>
                  <Link to="/videos">
                    <div className="card-festival group">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={video.thumbnail_url || FESTIVAL_IMAGES.ganesh1}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-0 h-0 border-l-[18px] border-l-white border-y-[12px] border-y-transparent ml-1" />
                          </div>
                        </div>
                        <span className="absolute top-2 right-2 badge-festival bg-black/60 text-cream">
                          {video.year}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-heading font-semibold text-sm text-maroon line-clamp-1">{video.title}</h3>
                        <p className="text-xs text-maroon/50 mt-1">{video.category}</p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/videos" className="btn-festival">
                <VideoIcon size={18} /> View All Videos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Our Members */}
      {members.length > 0 && (
        <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
          <div className="container-festival">
            <SectionHeading
              title="Our Sanathan Youth"
              subtitle="The dedicated people who make every celebration possible."
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {members.map((member, i) => (
                <Reveal key={member.id} delay={(i % 6) * 80}>
                  <Link to={`/portfolio/${member.slug}`}>
                    <div className="card-festival group text-center p-4">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-primary-200 group-hover:ring-gold transition-all mb-3">
                        <img
                          src={member.profile_image || FESTIVAL_IMAGES.ganesh1}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-heading font-semibold text-sm text-maroon">{member.name}</h3>
                      <p className="text-xs text-primary-600 mt-0.5">{member.role}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/members" className="btn-festival">
                <Users size={18} /> Meet All Members
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Festival Statistics */}
      <section className="section-padding bg-gradient-to-br from-maroon to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-10" />
        <div className="container-festival relative z-10">
          <SectionHeading
            title="Festival Statistics"
            subtitle="Our growing legacy of celebration and community."
            light
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Years Celebrated', value: stats.years, icon: Calendar, color: 'from-primary-400 to-primary-600' },
              { label: 'Photos', value: stats.photos + 38, icon: Images, color: 'from-gold to-yellow-600' },
              { label: 'Videos', value: stats.videos + 2, icon: VideoIcon, color: 'from-accent-400 to-accent-600' },
              { label: 'Youth Members', value: stats.members, icon: Users, color: 'from-success-400 to-success-600' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Reveal key={stat.label} delay={i * 100}>
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-xl`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <div className="text-4xl md:text-5xl font-display font-bold text-gold mb-1">
                      {stat.value}+
                    </div>
                    <div className="text-cream/70 text-sm font-heading">{stat.label}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="section-padding bg-cream bg-pattern">
          <div className="container-festival">
            <SectionHeading
              title="Announcements"
              subtitle="Latest news and updates from Sanathan Youth."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((ann, i) => (
                <Reveal key={ann.id} delay={i * 100}>
                  <div className="card-festival p-6 border-l-4 border-l-primary-500">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Megaphone size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-maroon">{ann.title}</h3>
                        <p className="text-xs text-maroon/40 mt-0.5">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-maroon/60 text-sm leading-relaxed">{ann.content}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About + Location + Contact */}
      <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
        <div className="container-festival">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <div className="flex items-center justify-start gap-2 mb-3">
                  <span className="diya-dot" />
                  <span className="text-gold text-xs font-heading uppercase tracking-widest">About Us</span>
                </div>
                <h2 className="heading-section text-gradient-saffron section-title-deco mb-6">About Sanathan Youth</h2>
                <p className="text-maroon/70 leading-relaxed mb-6">
                  Sanathan Youth is a village-based cultural collective dedicated to preserving and celebrating our traditions. Our Vinayaka Chavithi festival brings the entire community together in devotion, joy, and unity.
                </p>
                <p className="text-maroon/60 leading-relaxed mb-6">
                  From our first celebration in 2021 to today, we've grown into a vibrant community of youth, elders, and families who come together each year to honor Lord Ganesh and our cultural heritage.
                </p>
                <Link to="/about" className="btn-festival">
                  Learn More <ArrowRight size={18} />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gold/20">
                {currentYear?.latitude && currentYear?.longitude ? (
                  <iframe
                    src={`https://www.google.com/maps?q=${currentYear.latitude},${currentYear.longitude}&z=15&output=embed`}
                    className="w-full h-80"
                    loading="lazy"
                    title="Festival Location"
                  />
                ) : (
                  <div className="w-full h-80 bg-primary-100 flex items-center justify-center">
                    <MapPin size={48} className="text-primary-400" />
                  </div>
                )}
                <div className="bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-semibold text-maroon text-sm">{currentYear?.location_name}</p>
                      <p className="text-xs text-maroon/50">{currentYear?.address}</p>
                    </div>
                    {currentYear && (
                      <a
                        href={getMapsUrl(currentYear.latitude, currentYear.longitude, currentYear.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline-festival !px-4 !py-2 !text-sm"
                      >
                        <MapPin size={16} /> Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
