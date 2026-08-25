export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date TBA';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return 'TBA';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeThumb(url: string): string {
  const id = getYouTubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  return '';
}

export function getFestivalStatus(
  startDate: string | null,
  endDate: string | null
): 'upcoming' | 'live' | 'completed' {
  if (!startDate) return 'upcoming';
  const now = new Date();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = endDate ? new Date(endDate) : new Date(startDate);
  end.setHours(23, 59, 59, 999);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'live';
}

export function getMapsUrl(lat: number | null, lng: number | null, address: string): string {
  if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`;
  if (address) return `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  return '';
}

export function getDirectionsUrl(lat: number | null, lng: number | null, address: string): string {
  if (lat && lng) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  if (address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  return '';
}

export function getMapsEmbedUrl(lat: number | null, lng: number | null, address: string): string {
  if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  if (address) return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  return '';
}

export function arrayFromCommaString(str: string): string[] {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return `${n}+`;
}
