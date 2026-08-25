import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, Images, Video as VideoIcon, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { FestivalYear, Photo, Video, Member, FestivalProgram } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import { LoadingSpinner, EmptyState } from '@/components/States';

interface SearchResult {
  type: 'year' | 'photo' | 'video' | 'member' | 'program';
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const q = query.toLowerCase();
      const [years, photos, videos, members, programs] = await Promise.all([
        supabase.from('festival_years').select('*'),
        supabase.from('photos').select('*').limit(50),
        supabase.from('videos').select('*').limit(50),
        supabase.from('members').select('*').eq('published', true),
        supabase.from('festival_programs').select('*'),
      ]);

      const found: SearchResult[] = [];

      years.data?.forEach((y: FestivalYear) => {
        if (y.title.toLowerCase().includes(q) || y.description.toLowerCase().includes(q) || String(y.year).includes(q)) {
          found.push({
            type: 'year',
            id: y.id,
            title: y.title,
            subtitle: y.description.slice(0, 80),
            image: y.banner_url || FESTIVAL_IMAGES.ganesh1,
            link: `/vinayaka-chavithi/${y.slug}`,
          });
        }
      });

      photos.data?.forEach((p: Photo) => {
        if (p.title.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.year && String(p.year).includes(q))) {
          found.push({
            type: 'photo',
            id: p.id,
            title: p.caption || p.title || `Photo ${p.year || ''}`,
            subtitle: `${p.category} • ${p.year || ''}`,
            image: p.image_url,
            link: '/gallery',
          });
        }
      });

      videos.data?.forEach((v: Video) => {
        if (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || (v.year && String(v.year).includes(q))) {
          found.push({
            type: 'video',
            id: v.id,
            title: v.title,
            subtitle: `${v.category} • ${v.year || ''}`,
            image: v.thumbnail_url || FESTIVAL_IMAGES.ganesh1,
            link: '/videos',
          });
        }
      });

      members.data?.forEach((m: Member) => {
        if (m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.bio.toLowerCase().includes(q) || m.skills.toLowerCase().includes(q)) {
          found.push({
            type: 'member',
            id: m.id,
            title: m.name,
            subtitle: m.role,
            image: m.profile_image || FESTIVAL_IMAGES.ganesh1,
            link: `/portfolio/${m.slug}`,
          });
        }
      });

      programs.data?.forEach((p: FestivalProgram) => {
        if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
          found.push({
            type: 'program',
            id: p.id,
            title: p.title,
            subtitle: `${p.category} • ${p.date}`,
            image: p.image_url || FESTIVAL_IMAGES.ganesh1,
            link: '/vinayaka-chavithi',
          });
        }
      });

      setResults(found);
      setLoading(false);
    })();
  }, [query]);

  const typeIcons = {
    year: Calendar,
    photo: Images,
    video: VideoIcon,
    member: Users,
    program: Sparkles,
  };

  const typeLabels = {
    year: 'Festival Year',
    photo: 'Photo',
    video: 'Video',
    member: 'Member',
    program: 'Program',
  };

  return (
    <>
      <SEO
        title={`Search: ${query} — Sanathan Youth`}
        description={`Search results for "${query}" on Sanathan Youth Vinayaka Chavithi.`}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <section className="pt-12 pb-8 bg-gradient-to-b from-cream to-orange-50/30">
        <div className="container-festival">
          <div className="flex items-center gap-3 mb-2">
            <Search size={28} className="text-primary-600" />
            <h1 className="font-display font-bold text-2xl md:text-3xl text-maroon">Search Results</h1>
          </div>
          <p className="text-maroon/60">Searching for "<span className="font-heading font-semibold text-primary-600">{query}</span>" — {loading ? '...' : `${results.length} results`}</p>
        </div>
      </section>

      <section className="pb-20 bg-cream bg-pattern min-h-[50vh]">
        <div className="container-festival">
          {loading ? (
            <LoadingSpinner label="Searching..." />
          ) : results.length === 0 ? (
            <EmptyState icon={Search} title="No Results Found" message={`We couldn't find anything matching "${query}". Try a different search term.`} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, i) => {
                const Icon = typeIcons[result.type];
                return (
                  <Reveal key={`${result.type}-${result.id}`} delay={i * 50}>
                    <Link to={result.link}>
                      <div className="card-festival group h-full flex">
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                          <img src={result.image} alt={result.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-4 flex-1">
                          <span className="flex items-center gap-1 text-xs text-primary-600 font-heading font-semibold mb-1">
                            <Icon size={12} /> {typeLabels[result.type]}
                          </span>
                          <h3 className="font-heading font-bold text-sm text-maroon line-clamp-1">{result.title}</h3>
                          <p className="text-maroon/50 text-xs mt-1 line-clamp-2">{result.subtitle}</p>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
