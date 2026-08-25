import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';

export function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => { map[item.key] = item.value; });
        setSettings(map);
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would send to a backend. For now, show success.
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      <SEO
        title="Contact — Sanathan Youth"
        description="Get in touch with Sanathan Youth for Vinayaka Chavithi festival inquiries."
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <section className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden">
        <img src={FESTIVAL_IMAGES.diya1} alt="Contact" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/70 to-black/90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-gold text-shadow-lg">CONTACT US</h1>
          <p className="text-cream/80 font-heading mt-2">We'd love to hear from you</p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Reveal>
              <div>
                <SectionHeading title="Get In Touch" subtitle="For festival inquiries, volunteer opportunities, or community questions." />
                <div className="space-y-4 mt-8">
                  {settings.contact_email && (
                    <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-4 glass-card rounded-2xl p-5 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Mail size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-maroon/40 font-heading uppercase">Email</p>
                        <p className="text-maroon font-heading font-semibold">{settings.contact_email}</p>
                      </div>
                    </a>
                  )}
                  {settings.contact_phone && (
                    <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-4 glass-card rounded-2xl p-5 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                        <Phone size={24} className="text-success-600" />
                      </div>
                      <div>
                        <p className="text-xs text-maroon/40 font-heading uppercase">Phone</p>
                        <p className="text-maroon font-heading font-semibold">{settings.contact_phone}</p>
                      </div>
                    </a>
                  )}
                  {settings.contact_address && (
                    <div className="flex items-center gap-4 glass-card rounded-2xl p-5">
                      <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                        <MapPin size={24} className="text-accent-600" />
                      </div>
                      <div>
                        <p className="text-xs text-maroon/40 font-heading uppercase">Address</p>
                        <p className="text-maroon font-heading font-semibold">{settings.contact_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="glass-card rounded-3xl p-8">
                <h3 className="font-heading font-bold text-xl text-maroon mb-6">Send a Message</h3>
                {sent && (
                  <div className="mb-4 p-4 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-heading">
                    Thank you! Your message has been sent.
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-heading text-maroon/70 block mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input-festival"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading text-maroon/70 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="input-festival"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading text-maroon/70 block mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="input-festival resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button type="submit" className="btn-festival w-full">
                    <Send size={18} /> Send Message
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
