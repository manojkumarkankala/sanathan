import { useEffect, useState } from 'react';
import { Heart, Users, Sparkles, Award, Calendar, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FESTIVAL_IMAGES } from '@/lib/festivalData';
import { SEO } from '@/components/SEO';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';

export function AboutPage() {
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const item = data.find((d: { key: string; value: string }) => d.key === 'about_text');
        if (item) setAboutText(item.value);
      }
    });
  }, []);

  const values = [
    { icon: Heart, title: 'Devotion', description: 'Our celebrations are rooted in deep devotion to Lord Ganesh and our traditions.' },
    { icon: Users, title: 'Community', description: 'We bring the entire village together, strengthening bonds across generations.' },
    { icon: Sparkles, title: 'Culture', description: 'We preserve and celebrate our rich cultural heritage through festivals and programs.' },
    { icon: Target, title: 'Youth', description: 'We empower young people to lead, organize, and carry traditions forward.' },
  ];

  return (
    <>
      <SEO
        title="About — Sanathan Youth"
        description="Learn about Sanathan Youth, our mission, and our dedication to celebrating Vinayaka Chavithi."
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img src={FESTIVAL_IMAGES.community1} alt="About" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/70 to-black/90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-gold text-shadow-lg">ABOUT SANATHAN YOUTH</h1>
          <p className="text-cream/80 font-heading mt-2">Together • Culture • Community • Youth</p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival max-w-4xl">
          <Reveal>
            <SectionHeading title="Our Story" subtitle="The journey of Sanathan Youth" />
            <p className="text-maroon/70 text-lg leading-relaxed text-center mb-6">
              {aboutText || 'Sanathan Youth is a village-based cultural collective dedicated to preserving and celebrating our traditions. Our Vinayaka Chavithi festival brings the entire community together in devotion, joy, and unity.'}
            </p>
            <p className="text-marong/60 text-base leading-relaxed text-center">
              What started as a small gathering in 2021 has grown into the most anticipated event in our village. Each year, our youth members dedicate weeks to planning, decorating, and organizing a celebration that honors both our traditions and our community spirit.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-cream to-orange-50/30">
        <div className="container-festival">
          <SectionHeading title="Our Values" subtitle="What drives us forward" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={i * 100}>
                  <div className="glass-card rounded-2xl p-6 text-center h-full">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg">
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-maroon text-lg mb-2">{value.title}</h3>
                    <p className="text-maroon/60 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-maroon relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-10" />
        <div className="container-festival relative z-10 max-w-4xl">
          <SectionHeading title="Our Mission" light />
          <p className="text-cream/80 text-lg leading-relaxed text-center">
            To create a digital home for our Vinayaka Chavithi memories — a place where every celebration, every smile, and every moment of devotion is preserved for generations to come. Through this platform, we connect our village's past, present, and future in one continuous thread of cultural pride.
          </p>
        </div>
      </section>

      <section className="section-padding bg-cream bg-pattern">
        <div className="container-festival max-w-4xl">
          <Reveal>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src={FESTIVAL_IMAGES.village1} alt="Our Village" className="w-full h-64 md:h-80 object-cover" />
            </div>
            <p className="text-center text-maroon/60 mt-4 text-sm font-heading italic">
              "Our village is not just a place — it's a feeling that comes alive during Vinayaka Chavithi."
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
