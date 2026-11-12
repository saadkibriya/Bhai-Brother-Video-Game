export type AdminRole = 'owner' | 'admin';

export interface Admin {
  id: number;
  username: string;
  displayName: string;
  role: AdminRole;
  mustChange: boolean;
}

export interface TeamMember extends Admin {
  disabled: boolean;
  createdAt: number;
  lastLoginAt: number | null;
  passwordChangedAt: number | null;
}

export interface PendingReset {
  id: number;
  adminId: number;
  username: string;
  createdAt: number;
  expiresAt: number;
  issued: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new ApiError(body?.error ?? 'The counter server did not answer.', response.status);
  return body as T;
}

export const adminApi = {
  setupStatus: () => call<{ needsSetup: boolean; keyConfigured: boolean }>('/api/auth/setup'),
  setup: (username: string, password: string, adminKey: string) =>
    call<{ ok: true }>('/api/auth/setup', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
      body: JSON.stringify({ username, password }),
    }),
  me: () => call<{ admin: Admin }>('/api/auth/me'),
  login: (username: string, password: string) =>
    call<{ admin: Admin }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => call<void>('/api/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    call<{ ok: true }>('/api/auth/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  changeUsername: (currentPassword: string, username: string) =>
    call<{ ok: true; admin: Admin }>('/api/auth/username', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, username }),
    }),
  forgot: (username: string) =>
    call<{ ok: true }>('/api/auth/forgot', { method: 'POST', body: JSON.stringify({ username }) }),
  reset: (username: string, code: string, newPassword: string) =>
    call<{ ok: true }>('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ username, code, newPassword }),
    }),
  team: () => call<{ admins: TeamMember[]; pendingResets: PendingReset[] }>('/api/admin/team'),
  createAdmin: (input: { username: string; displayName: string; role: AdminRole; password?: string }) =>
    call<{ admin: TeamMember; tempPassword: string }>('/api/admin/team', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  setDisabled: (id: number, disabled: boolean) =>
    call<{ ok: true }>(`/api/admin/team/${id}/disabled`, {
      method: 'POST',
      body: JSON.stringify({ disabled }),
    }),
  issueReset: (id: number) =>
    call<{ code: string; expiresAt: number }>(`/api/admin/team/${id}/reset-code`, { method: 'POST' }),
  setPassword: (id: number, password: string) =>
    call<{ ok: true; password: string }>(`/api/admin/team/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};
