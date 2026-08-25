import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Phone, Mail, Sparkles, Award, Activity, Calendar, ArrowLeft, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Member, MemberLink, Photo, Video } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { ShareButtons } from '@/components/ShareButtons';
import { PhotoViewer } from '@/components/PhotoViewer';
import { VideoModal } from '@/components/VideoModal';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { arrayFromCommaString } from '@/lib/utils';

export function PortfolioPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [links, setLinks] = useState<MemberLink[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [photoViewerIndex, setPhotoViewerIndex] = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<Video | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: mem } = await supabase
        .from('members')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!mem) {
        setLoading(false);
        return;
      }

      setMember(mem);

      const [lnks, phs, vids] = await Promise.all([
        supabase.from('member_links').select('*').eq('member_id', mem.id).order('sort_order'),
        supabase.from('photos').select('*').eq('year', null).order('created_at', { ascending: false }).limit(6),
        supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(4),
      ]);

      if (lnks.data) setLinks(lnks.data);
      // Use festival photos as member participation photos
      const { data: festPhotos } = await supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(6);
      if (festPhotos) setPhotos(festPhotos);
      if (vids.data) setVideos(vids.data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <LoadingSpinner label="Loading portfolio..." />;

  if (!member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState icon={Sparkles} title="Member Not Found" message={`We couldn't find a member with the slug "${slug}".`} />
      </div>
    );
  }

  const skills = arrayFromCommaString(member.skills);
  const achievements = arrayFromCommaString(member.achievements);
  const activities = arrayFromCommaString(member.activities);
  const participation = arrayFromCommaString(member.festival_participation);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`${member.name} — ${member.role} | Sanathan Youth`}
        description={member.bio}
        image={member.profile_image || FESTIVAL_IMAGES.ganesh1}
        url={shareUrl}
      />

      {/* Banner */}
      <section className="relative h-64 md:h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-600 to-maroon" />
        <div className="absolute inset-0 bg-mandala opacity-15" />
        <div className="absolute top-4 left-4 z-10">
          <Link to="/members" className="flex items-center gap-2 text-cream/80 hover:text-gold transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Members
          </Link>
        </div>
      </section>

      <section className="bg-cream bg-pattern pb-8 -mt-20 relative z-10">
        <div className="container-festival">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-gold/40 shadow-2xl flex-shrink-0 bg-white">
                <img src={member.profile_image || FESTIVAL_IMAGES.ganesh1} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h1 className="font-display font-bold text-2xl md:text-4xl text-maroon">{member.name}</h1>
                <p className="text-primary-600 font-heading font-medium text-lg mt-1">{member.role}</p>
                <p className="text-maroon/60 mt-3 leading-relaxed">{member.bio}</p>
                <div className="mt-4">
                  <ShareButtons url={shareUrl} title={`${member.name} — ${member.role}`} text={member.bio} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {skills.length > 0 && (
              <Reveal>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={20} className="text-gold" />
                    <h3 className="font-heading font-bold text-maroon">Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill} className="badge-festival bg-primary-100 text-primary-700">{skill}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {achievements.length > 0 && (
              <Reveal delay={100}>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={20} className="text-success-500" />
                    <h3 className="font-heading font-bold text-maroon">Achievements</h3>
                  </div>
                  <ul className="space-y-2">
                    {achievements.map((ach, i) => (
                      <li key={i} className="text-maroon/70 text-sm flex items-start gap-2">
                        <span className="text-gold mt-1">•</span> {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {activities.length > 0 && (
              <Reveal delay={200}>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={20} className="text-primary-500" />
                    <h3 className="font-heading font-bold text-maroon">Activities</h3>
                  </div>
                  <ul className="space-y-2">
                    {activities.map((act, i) => (
                      <li key={i} className="text-maroon/70 text-sm flex items-start gap-2">
                        <span className="text-primary-400 mt-1">•</span> {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          {/* Festival Participation */}
          {participation.length > 0 && (
            <div className="mt-8">
              <Reveal>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={20} className="text-primary-500" />
                    <h3 className="font-heading font-bold text-maroon">Vinayaka Chavithi Participation</h3>
                  </div>
                  <ul className="space-y-2">
                    {participation.map((p, i) => (
                      <li key={i} className="text-maroon/70 text-sm flex items-start gap-2">
                        <Sparkles size={14} className="text-gold mt-1 flex-shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          )}

          {/* Contact */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {member.show_mobile && member.mobile && (
              <Reveal>
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                    <Phone size={22} className="text-success-600" />
                  </div>
                  <div>
                    <p className="text-xs text-maroon/40 font-heading uppercase tracking-wider">Mobile</p>
                    <a href={`tel:${member.mobile}`} className="text-maroon font-heading font-semibold hover:text-primary-600">{member.mobile}</a>
                  </div>
                </div>
              </Reveal>
            )}
            {member.email && (
              <Reveal delay={100}>
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Mail size={22} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-maroon/40 font-heading uppercase tracking-wider">Email</p>
                    <a href={`mailto:${member.email}`} className="text-maroon font-heading font-semibold hover:text-primary-600 break-all">{member.email}</a>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Social Links */}
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-outline-festival">
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Festival Photos */}
          {photos.length > 0 && (
            <div className="mt-12">
              <SectionHeading title="Festival Photos" subtitle={`Photos featuring ${member.name}`} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <Reveal key={photo.id} delay={(i % 4) * 60}>
                    <div
                      className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer aspect-square"
                      onClick={() => setPhotoViewerIndex(i)}
                    >
                      <img src={photo.image_url} alt={photo.caption || photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Festival Videos */}
          {videos.length > 0 && (
            <div className="mt-12">
              <SectionHeading title="Festival Videos" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, i) => (
                  <Reveal key={video.id} delay={(i % 3) * 80}>
                    <div className="card-festival group cursor-pointer" onClick={() => setVideoModal(video)}>
                      <div className="relative h-40 overflow-hidden">
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
          )}
        </div>
      </section>

      {photoViewerIndex !== null && (
        <PhotoViewer photos={photos} initialIndex={photoViewerIndex} onClose={() => setPhotoViewerIndex(null)} />
      )}
      {videoModal && <VideoModal video={videoModal} onClose={() => setVideoModal(null)} />}
    </>
  );
}
