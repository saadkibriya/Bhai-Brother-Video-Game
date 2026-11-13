import { API_BASE } from './siteMode';

export interface Announcement {
  id: number;
  title: string | null;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface AdminAnnouncement extends Announcement {
  active: boolean;
  createdBy: string | null;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const response = await fetch(`${API_BASE}/api/announcements`, {
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!response.ok) throw new Error('Announcements are unavailable right now.');
  const body = (await response.json()) as { announcements?: Announcement[] };
  return body.announcements ?? [];
}

export function announcementDate(value: number): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Dhaka',
  });
}
