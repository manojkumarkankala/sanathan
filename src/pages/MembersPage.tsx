import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Sparkles, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Member } from '@/lib/types';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { arrayFromCommaString } from '@/lib/utils';

export function MembersPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    supabase
      .from('members')
      .select('*')
      .eq('published', true)
      .order('created_at')
      .then(({ data }) => {
        if (data) setMembers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Loading members..." />;

  const roles = ['All', ...Array.from(new Set(members.map(m => m.role).filter(Boolean)))];

  const filtered = roleFilter === 'All' ? members : members.filter(m => m.role === roleFilter);

  return (
    <>
      <SEO
        title="Our Members — Sanathan Youth"
        description="Meet the dedicated members of Sanathan Youth who make every Vinayaka Chavithi celebration possible."
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <section className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <img src={FESTIVAL_IMAGES.community3} alt="Members" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/70 to-black/90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-gold text-shadow-lg">OUR SANATHAN YOUTH</h1>
          <p className="text-cream/80 font-heading mt-2">The hearts and hands behind the celebration</p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          {members.length === 0 ? (
            <EmptyState icon={Users} title="No Members Yet" message="Member profiles will appear here soon." />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-1.5 rounded-full text-sm font-heading font-medium transition-all ${
                      roleFilter === role ? 'bg-primary-500 text-white shadow-lg' : 'bg-white text-maroon/60 hover:bg-primary-100'
                    }`}
                  >
                    {role === 'All' ? 'All Roles' : role}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((member, i) => {
                  const skills = arrayFromCommaString(member.skills);
                  return (
                    <Reveal key={member.id} delay={i * 80}>
                      <Link to={`/portfolio/${member.slug}`}>
                        <div className="card-festival group h-full">
                          <div className="relative h-32 bg-gradient-to-br from-primary-400 to-primary-700 overflow-hidden">
                            <div className="absolute inset-0 bg-mandala opacity-20" />
                          </div>
                          <div className="px-5 pb-5 -mt-12 relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-xl mb-3 bg-white">
                              <img
                                src={member.profile_image || FESTIVAL_IMAGES.ganesh1}
                                alt={member.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <h3 className="font-heading font-bold text-lg text-maroon">{member.name}</h3>
                            <p className="text-primary-600 text-sm font-heading">{member.role}</p>
                            <p className="text-maroon/60 text-xs mt-2 line-clamp-2">{member.bio}</p>
                            {skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {skills.slice(0, 3).map(skill => (
                                  <span key={skill} className="badge-festival bg-primary-50 text-primary-700 text-[10px]">{skill}</span>
                                ))}
                              </div>
                            )}
                            <div className="mt-4 flex items-center gap-1 text-primary-600 font-heading font-semibold text-sm group-hover:gap-2 transition-all">
                              View Portfolio <ArrowRight size={16} />
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
