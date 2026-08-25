import { Link } from 'react-router-dom';
import { Home, Calendar, Images, Video, Users, Info, Mail, Phone, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => {
          map[item.key] = item.value;
        });
        setSettings(map);
      }
    });
  }, []);

  const links = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Vinayaka Chavithi', path: '/vinayaka-chavithi', icon: Calendar },
    { label: 'Gallery', path: '/gallery', icon: Images },
    { label: 'Videos', path: '/videos', icon: Video },
    { label: 'Members', path: '/members', icon: Users },
    { label: 'About', path: '/about', icon: Info },
  ];

  return (
    <footer className="bg-gradient-to-b from-maroon to-black text-cream relative overflow-hidden">
      <div className="absolute inset-0 bg-mandala opacity-20" />
      <div className="container-festival py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg">
                ॐ
              </div>
              <div>
                <div className="font-display font-bold text-xl text-gold">SANATHAN YOUTH</div>
                <div className="text-xs text-primary-300 tracking-widest">VINAYAKA CHAVITHI</div>
              </div>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed mb-4">
              Together • Culture • Community • Youth
            </p>
            <p className="text-cream/60 text-sm leading-relaxed">
              The official digital home and memory archive of Sanathan Youth's Vinayaka Chavithi celebrations.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-gold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <Link to={link.path} className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors text-sm">
                      <Icon size={16} className="text-primary-400" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-gold mb-4 uppercase tracking-wider text-sm">Connect With Us</h3>
            <div className="space-y-3 mb-6">
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors text-sm">
                  <Mail size={16} className="text-primary-400" />
                  {settings.contact_email}
                </a>
              )}
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors text-sm">
                  <Phone size={16} className="text-primary-400" />
                  {settings.contact_phone}
                </a>
              )}
              <p className="flex items-start gap-2 text-cream/60 text-sm">
                {settings.contact_address}
              </p>
            </div>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary-500 flex items-center justify-center transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary-500 flex items-center justify-center transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary-500 flex items-center justify-center transition-colors">
                  <Youtube size={18} />
                </a>
              )}
              {settings.whatsapp_url && (
                <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-success-500 flex items-center justify-center transition-colors">
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-cream/50 text-sm">© Sanathan Youth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
