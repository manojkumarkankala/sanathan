export interface FestivalYear {
  id: string;
  year: number;
  title: string;
  slug: string;
  description: string;
  banner_url: string;
  start_date: string | null;
  end_date: string | null;
  start_time: string;
  end_time: string;
  location_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  chief_guests: string;
  organizers: string;
  achievements: string;
  published: boolean;
  created_at: string;
}

export interface FestivalSchedule {
  id: string;
  festival_year_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

export interface FestivalProgram {
  id: string;
  festival_year_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  category: string;
}

export interface Member {
  id: string;
  name: string;
  slug: string;
  profile_image: string;
  role: string;
  bio: string;
  skills: string;
  achievements: string;
  activities: string;
  festival_participation: string;
  mobile: string;
  email: string;
  show_mobile: boolean;
  published: boolean;
  created_at: string;
}

export interface MemberLink {
  id: string;
  member_id: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface Photo {
  id: string;
  title: string;
  image_url: string;
  year: number | null;
  album: string;
  category: string;
  festival_year_id: string | null;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  year: number | null;
  category: string;
  festival_year_id: string | null;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
}

export interface SiteSettings {
  [key: string]: string;
}
