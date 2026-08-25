import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Image, Video, Users, Megaphone, Sparkles, Clock, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { Reveal } from '@/components/Reveal';
import { getFestivalStatus, formatDateShort } from '@/lib/utils';
import type { FestivalYear, Announcement } from '@/lib/types';

export function AdminDashboard() {
  const [stats, setStats] = useState({ years: 0, photos: 0, videos: 0, members: 0, programs: 0, announcements: 0 });
  const [upcoming, setUpcoming] = useState<FestivalYear | null>(null);
  const [completed, setCompleted] = useState<FestivalYear[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    (async () => {
      const [y, p, v, m, prog, ann] = await Promise.all([
        supabase.from('festival_years').select('*').order('year', { ascending: false }),
        supabase.from('photos').select('id'),
        supabase.from('videos').select('id'),
        supabase.from('members').select('id'),
        supabase.from('festival_programs').select('id'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      ]);

      setStats({
        years: y.data?.length || 0,
        photos: p.data?.length || 0,
        videos: v.data?.length || 0,
        members: m.data?.length || 0,
        programs: prog.data?.length || 0,
        announcements: ann.data?.length || 0,
      });

      if (y.data) {
        const up = y.data.find(fy => getFestivalStatus(fy.start_date, fy.end_date) !== 'completed');
        setUpcoming(up || null);
        setCompleted(y.data.filter(fy => getFestivalStatus(fy.start_date, fy.end_date) === 'completed'));
      }
      if (ann.data) setRecentAnnouncements(ann.data);
    })();
  }, []);

  const cards = [
    { label: 'Total Years', value: stats.years, icon: Calendar, color: 'from-primary-400 to-primary-600', link: '/admin/years' },
    { label: 'Total Photos', value: stats.photos, icon: Image, color: 'from-gold to-yellow-600', link: '/admin/photos' },
    { label: 'Total Videos', value: stats.videos, icon: Video, color: 'from-accent-400 to-accent-600', link: '/admin/videos' },
    { label: 'Total Members', value: stats.members, icon: Users, color: 'from-success-400 to-success-600', link: '/admin/members' },
    { label: 'Total Programs', value: stats.programs, icon: Sparkles, color: 'from-blue-400 to-blue-600', link: '/admin/programs' },
    { label: 'Announcements', value: stats.announcements, icon: Megaphone, color: 'from-purple-400 to-purple-600', link: '/admin/announcements' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-maroon">Dashboard</h1>
          <p className="text-maroon/50 text-sm mt-1">Welcome back to Sanathan Youth admin panel</p>
        </div>
        <Link to="/admin/years" className="btn-festival">
          <Plus size={18} /> Add Festival Year
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.label} delay={i * 50}>
              <Link to={card.link}>
                <div className="glass-card rounded-2xl p-4 hover:shadow-xl transition-shadow group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="text-2xl font-display font-bold text-maroon">{card.value}</div>
                  <div className="text-xs text-maroon/50 font-heading">{card.label}</div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Festival */}
        <Reveal>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-primary-600" />
              <h2 className="font-heading font-bold text-maroon">Upcoming Festival</h2>
            </div>
            {upcoming ? (
              <Link to={`/vinayaka-chavithi/${upcoming.slug}`} className="block group">
                <div className="rounded-xl overflow-hidden mb-3">
                  <img src={upcoming.banner_url || FESTIVAL_IMAGES.ganesh1} alt={upcoming.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="font-heading font-bold text-maroon">{upcoming.title}</h3>
                <p className="text-maroon/50 text-sm">{formatDateShort(upcoming.start_date)}</p>
                <span className="badge-festival bg-success-100 text-success-700 mt-2">Upcoming</span>
              </Link>
            ) : (
              <p className="text-maroon/40 text-sm">No upcoming festival. Add a new year to get started.</p>
            )}
          </div>
        </Reveal>

        {/* Completed Festivals */}
        <Reveal delay={100}>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-primary-600" />
              <h2 className="font-heading font-bold text-maroon">Completed Festivals</h2>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {completed.map(fy => (
                <Link key={fy.id} to={`/vinayaka-chavithi/${fy.slug}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-primary-50 transition-colors">
                  <span className="font-heading font-medium text-maroon text-sm">{fy.title}</span>
                  <span className="text-xs text-maroon/40">{formatDateShort(fy.start_date)}</span>
                </Link>
              ))}
              {completed.length === 0 && <p className="text-maroon/40 text-sm">No completed festivals yet.</p>}
            </div>
          </div>
        </Reveal>

        {/* Recent Announcements */}
        <Reveal delay={200}>
          <div className="glass-card rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone size={20} className="text-primary-600" />
                <h2 className="font-heading font-bold text-maroon">Recent Announcements</h2>
              </div>
              <Link to="/admin/announcements" className="text-primary-600 text-sm font-heading hover:underline">Manage</Link>
            </div>
            <div className="space-y-3">
              {recentAnnouncements.map(ann => (
                <div key={ann.id} className="p-3 rounded-xl bg-primary-50/50 border-l-4 border-l-primary-500">
                  <h3 className="font-heading font-semibold text-maroon text-sm">{ann.title}</h3>
                  <p className="text-maroon/50 text-xs mt-1 line-clamp-2">{ann.content}</p>
                </div>
              ))}
              {recentAnnouncements.length === 0 && <p className="text-maroon/40 text-sm">No announcements yet.</p>}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
