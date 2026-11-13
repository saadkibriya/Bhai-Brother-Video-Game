import { API_BASE } from './siteMode';

export type StationStatus = 'free' | 'busy' | 'blocked';
export type StationAction = 'start' | 'stop' | 'cancel' | 'block' | 'unblock';

export interface StationState {
  id: string;
  name: string;
  platform: string;
  status: StationStatus;
  startedAt: number | null;
  endsAt: number | null;
  minutes: number | null;
  player: string | null;
  note: string | null;
  updatedAt: number;
}

export interface SessionRecord {
  stationId: string;
  player: string | null;
  plannedMinutes: number | null;
  startedAt: number;
  endedAt: number;
  minutes: number;
}

export interface ShopState {
  now: number;
  adminConfigured: boolean;
  sessionsToday: number;
  minutesToday: number;
  stations: StationState[];
  recentSessions: SessionRecord[];
}

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? 'The counter API did not answer.';
}

export async function fetchState(): Promise<ShopState> {
  const response = await fetch(`${API_BASE}/api/status`, { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as ShopState;
}

export async function adminVerify(key: string): Promise<void> {
  const response = await fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'x-admin-key': key },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(await readError(response));
}

export async function adminAction(
  id: string,
  action: StationAction,
  details: { player?: string; minutes?: number } = {}
): Promise<ShopState> {
  const response = await fetch(`${API_BASE}/api/station`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, action, ...details }),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as ShopState;
}

/** "04:32" under an hour, "1:04:32" above it. */
export function elapsedLabel(startedAt: number, now: number): string {
  const total = Math.max(0, Math.floor((now - startedAt) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export const ALERT_MINUTES = [10, 5, 0] as const;
export type AlertKind = 'ten' | 'five' | 'end';

export const SESSION_LENGTHS = [30, 60, 90, 120, 180] as const;

/** Alerts that have come due and have not been shown for this session yet. */
export function alertsFor(endsAt: number, now: number, fired: AlertKind[]): AlertKind[] {
  const left = endsAt - now;
  const due: AlertKind[] = [];
  if (left <= 10 * 60_000 && !fired.includes('ten')) due.push('ten');
  if (left <= 5 * 60_000 && !fired.includes('five')) due.push('five');
  if (left <= 0 && !fired.includes('end')) due.push('end');
  return due;
}

/** "38 min left", "4 min left", or "Time is up". */
export function remainingLabel(endsAt: number, now: number): string {
  const left = endsAt - now;
  if (left <= 0) return 'Time is up';
  const minutes = Math.ceil(left / 60_000);
  return `${minutes} min left`;
}

export function formatDayTime(value: number): string {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
}

export function clockLabel(endsAt: number): string {
  return new Date(endsAt).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  });
}

export function statusLabel(status: StationStatus): string {
  if (status === 'busy') return 'In use';
  if (status === 'blocked') return 'Blocked';
  return 'Free';
}
