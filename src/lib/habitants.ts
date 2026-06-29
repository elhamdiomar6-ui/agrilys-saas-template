import { supabase } from './supabaseClient';
import * as Sentry from '@sentry/react';

export type HabitantProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: 'pending' | 'active' | 'suspended' | 'archived';
  membership_status: 'pending' | 'active' | 'suspended' | 'expired';
  address_in_village: string | null;
  birth_date: string | null;
  gender: 'homme' | 'femme' | 'non_precisé' | null;
  household_id: string | null;
  pin_expires_at: string | null;
  cotisationStatus: string;
};

export type HabitantReport = {
  id: string;
  category: string;
  level: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ApiError = { error?: string };

async function authenticatedPost<T>(body: Record<string, unknown>): Promise<T> {
  try {
    if (!supabase) throw new Error('Supabase non configuré.');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Session requise.');
    const response = await fetch('/api/habitants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const raw = await response.text();
    let payload: T & ApiError;
    try {
      payload = raw ? JSON.parse(raw) as T & ApiError : {} as T & ApiError;
    } catch (parseError) {
      const error = new Error(`HTTP ${response.status} — ${raw || response.statusText || 'Réponse API illisible.'}`);
      Sentry.captureException(error, { contexts: { api: { endpoint: '/api/habitants', body, action: (body as any).action } } });
      throw error;
    }
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status} — ${payload.error || response.statusText || 'Opération impossible.'}`);
      Sentry.captureException(error, { contexts: { api: { endpoint: '/api/habitants', body, action: (body as any).action, statusCode: response.status } } });
      throw error;
    }
    return payload;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}

export async function approveHabitantRequest(requestId: string) {
  return authenticatedPost<{
    whatsappMessage: string;
    whatsappUrl: string;
    phoneRaw: string;
    phone: string;
    fullName: string;
    regenerated: boolean;
  }>({ action: 'approve', requestId });
}

export async function rejectHabitantRequest(requestId: string) {
  return authenticatedPost<{ rejected: true }>({ action: 'reject', requestId });
}

export async function recommendHabitantRequest(requestId: string) {
  return authenticatedPost<{ recommended: true }>({ action: 'recommend', requestId });
}

export async function requestHabitantSession(phone: string, pin: string) {
  try {
    const response = await fetch('/api/habitants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', phone, pin }),
    });
    const payload = await response.json() as { tokenHash?: string; fullName?: string; error?: string };
    if (!response.ok || !payload.tokenHash) {
      const error = new Error(payload.error || 'Connexion impossible.');
      Sentry.captureException(error, { contexts: { api: { endpoint: '/api/habitants', action: 'login', statusCode: response.status } } });
      throw error;
    }
    return { tokenHash: payload.tokenHash, fullName: payload.fullName || '' };
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}

export async function loadHabitantDashboard() {
  return authenticatedPost<{
    profile: HabitantProfile;
    reports: HabitantReport[];
  }>({ action: 'profile' });
}

export async function updateHabitantContact(phone: string, addressInVillage: string) {
  return authenticatedPost<{ phone: string; addressInVillage: string }>({
    action: 'update-profile',
    phone,
    addressInVillage,
  });
}
