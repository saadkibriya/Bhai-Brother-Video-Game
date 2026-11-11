export type StationStatus = 'free' | 'busy' | 'blocked';
export type StationAction = 'start' | 'stop' | 'block' | 'unblock';

export interface StationState {
  id: string;
  name: string;
  platform: string;
  status: StationStatus;
  startedAt: number | null;
  note: string | null;
  updatedAt: number;
}

export interface SessionRecord {
  stationId: string;
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
  const response = await fetch('/api/status', { cache: 'no-store' });
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
  key: string,
  id: string,
  action: StationAction
): Promise<ShopState> {
  const response = await fetch('/api/station', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify({ id, action }),
    cache: 'no-store',
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

export function statusLabel(status: StationStatus): string {
  if (status === 'busy') return 'In use';
  if (status === 'blocked') return 'Blocked';
  return 'Free';
}
