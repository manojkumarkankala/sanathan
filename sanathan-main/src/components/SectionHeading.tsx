import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  decoration?: boolean;
  light?: boolean;
  children?: ReactNode;
}

export function SectionHeading({ title, subtitle, decoration = true, light = false, children }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      {decoration && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="diya-dot" />
          <span className="text-gold text-xs font-heading uppercase tracking-widest">Sanathan Youth</span>
          <span className="diya-dot" />
        </div>
      )}
      <h2 className={`heading-section section-title-deco ${light ? 'text-cream text-shadow-md' : 'text-gradient-saffron'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg max-w-2xl mx-auto ${light ? 'text-cream/70' : 'text-maroon/60'} font-body`}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
