import { useState } from 'react';
import { Copy, Facebook, MessageCircle, Mail, Share2, Send, Check } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  text?: string;
  variant?: 'light' | 'dark';
}

export function ShareButtons({ url, title, text = '', variant = 'light' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title}${text ? ' — ' + text : ''}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(shareText);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {
        // User cancelled
      }
    } else {
      copyLink();
    }
  };

  const baseClass = variant === 'dark'
    ? 'w-10 h-10 rounded-full bg-white/10 hover:bg-primary-500 text-cream flex items-center justify-center transition-all hover:scale-110'
    : 'w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-500 text-primary-700 hover:text-white flex items-center justify-center transition-all hover:scale-110';

  const links = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-success-500',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: 'hover:bg-blue-600',
    },
    {
      icon: Send,
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-blue-500',
    },
    {
      icon: Mail,
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + url)}`,
      color: 'hover:bg-primary-600',
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-sm font-heading font-medium flex items-center gap-1.5 ${variant === 'dark' ? 'text-cream/70' : 'text-maroon/70'}`}>
        <Share2 size={16} /> Share:
      </span>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClass}
            aria-label={link.label}
          >
            <Icon size={18} />
          </a>
        );
      })}
      <button onClick={copyLink} className={baseClass} aria-label="Copy link">
        {copied ? <Check size={18} className="text-success-500" /> : <Copy size={18} />}
      </button>
      <button onClick={nativeShare} className={baseClass} aria-label="Share">
        <Share2 size={18} />
      </button>
    </div>
  );
}
