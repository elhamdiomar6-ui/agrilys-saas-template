import type { RegistrationRequest, RequestDecision, RequestedStatus } from '../types/registration';
import type { ResidentReport, ReportStatus } from '../types/report';
import { supabase } from './supabaseClient';

function dbAvailable() {
  return Boolean(supabase);
}

function mapDbDecision(status: string): RequestDecision {
  if (status === 'approved') return 'accepted';
  if (status === 'rejected') return 'rejected';
  if (status === 'under_review') return 'recommended';
  return 'pending';
}

function toDbDecision(status: RequestDecision) {
  if (status === 'accepted') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'under_review';
}

export async function createRegistrationRequest(input: {
  id?: string;
  fullName: string;
  phoneWhatsApp: string;
  douarLink: string;
  requestedStatus: RequestedStatus;
  message: string;
}) {
  if (!dbAvailable() || !supabase) return { savedRemote: false, error: null };

  const { error } = await supabase.from('registration_requests').insert({
    id: input.id,
    full_name: input.fullName,
    phone: input.phoneWhatsApp,
    relationship_to_village: input.douarLink,
    requested_status: input.requestedStatus,
    message: input.message || null,
    status: 'pending',
    visibility: 'internal',
  });

  return { savedRemote: !error, error: error?.message ?? null };
}

export async function fetchRegistrationRequests(): Promise<{ data: RegistrationRequest[]; error: string | null }> {
  if (!dbAvailable() || !supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('registration_requests')
    .select('id,full_name,phone,relationship_to_village,requested_status,message,status,created_at,updated_at')
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };

  return {
    data: (data || []).map((row) => ({
      id: row.id,
      fullName: row.full_name || '',
      phoneWhatsApp: row.phone || '',
      douarLink: row.relationship_to_village || '',
      requestedStatus: (row.requested_status || 'habitant') as RequestedStatus,
      message: row.message || '',
      createdAt: row.created_at,
      status: mapDbDecision(row.status),
      history: [{ status: mapDbDecision(row.status), at: row.updated_at || row.created_at, by: 'system' }],
    })),
    error: null,
  };
}

export async function updateRegistrationDecision(id: string, status: RequestDecision) {
  if (!dbAvailable() || !supabase) return { savedRemote: false, error: null };
  const { error } = await supabase
    .from('registration_requests')
    .update({ status: toDbDecision(status), decided_at: new Date().toISOString() })
    .eq('id', id);
  return { savedRemote: !error, error: error?.message ?? null };
}

export async function createResidentReport(input: Pick<ResidentReport, 'category' | 'level' | 'description'>) {
  if (!dbAvailable() || !supabase) return { savedRemote: false, error: null };
  const { data: authData } = await supabase.auth.getUser();
  const { error } = await supabase.from('resident_reports').insert({
    category: input.category,
    level: input.level,
    description: input.description,
    status: 'sent',
    visibility: 'internal',
    created_by: authData.user?.id || null,
  });
  return { savedRemote: !error, error: error?.message ?? null };
}

export async function fetchResidentReports(): Promise<{ data: ResidentReport[]; error: string | null }> {
  if (!dbAvailable() || !supabase) return { data: [], error: null };
  const { data, error } = await supabase
    .from('resident_reports')
    .select('id,category,level,description,status,internal_note,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return {
    data: (data || []).map((row) => ({
      id: row.id,
      category: row.category,
      level: row.level,
      description: row.description || '',
      status: row.status,
      internalNote: row.internal_note || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    error: null,
  };
}

export async function updateResidentReport(id: string, patch: { status?: ReportStatus; internalNote?: string }) {
  if (!dbAvailable() || !supabase) return { savedRemote: false, error: null };
  const { error } = await supabase.from('resident_reports').update({
    status: patch.status,
    internal_note: patch.internalNote,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  return { savedRemote: !error, error: error?.message ?? null };
}
