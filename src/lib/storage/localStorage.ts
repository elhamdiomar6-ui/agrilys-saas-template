import { siteConfig } from '../../config/site';

export type RegistrationHistoryItem = {
  status: RequestDecision;
  at: string;
  by: 'bureau' | 'president' | 'system';
};

export type RegistrationRequest = {
  id: string;
  fullName: string;
  phoneWhatsApp: string;
  douarLink: string;
  requestedStatus: RequestedStatus;
  message: string;
  createdAt: string;
  status: RequestDecision;
  history?: RegistrationHistoryItem[];
};

export type RequestedStatus = 'habitant' | 'adherent' | 'soutien';
export type RequestDecision = 'pending' | 'recommended' | 'accepted' | 'rejected';

export type GeneratedPinNotice = {
  requestId: string;
  whatsappMessage: string;
  whatsappUrl: string;
  phoneRaw: string;
  phone: string;
  fullName: string;
  displayExpiresAt: string;
};

const siteLockStorageKey = 'agadirnetguida.siteLock.unlocked.v1';
const requestStorageKey = 'agadirnetguida.registrationRequests.v2';
const generatedPinsStorageKey = 'agadirnetguida.generatedPins.v1';
export const generatedPinRetentionMs = 5 * 60 * 1000;

export function readGeneratedPinNotices() {
  try {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem(generatedPinsStorageKey) || '[]') as GeneratedPinNotice[];
    const active = stored.filter((notice) => new Date(notice.displayExpiresAt).getTime() > now);
    if (active.length !== stored.length) {
      if (active.length) localStorage.setItem(generatedPinsStorageKey, JSON.stringify(active));
      else localStorage.removeItem(generatedPinsStorageKey);
    }
    return active;
  } catch {
    localStorage.removeItem(generatedPinsStorageKey);
    return [];
  }
}

export function saveGeneratedPinNotices(notices: GeneratedPinNotice[]) {
  if (notices.length) localStorage.setItem(generatedPinsStorageKey, JSON.stringify(notices));
  else localStorage.removeItem(generatedPinsStorageKey);
}

export function isSiteLockSessionValid() {
  const raw = localStorage.getItem(siteLockStorageKey);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { unlockedAt?: number };
    const unlockedAt = typeof parsed.unlockedAt === 'number' ? parsed.unlockedAt : 0;
    const hours = Number.isFinite(siteConfig.siteLockSessionHours) && siteConfig.siteLockSessionHours > 0
      ? siteConfig.siteLockSessionHours
      : 12;
    return Date.now() - unlockedAt < hours * 60 * 60 * 1000;
  } catch {
    localStorage.removeItem(siteLockStorageKey);
    return false;
  }
}

export function setSiteLockSession() {
  localStorage.setItem(siteLockStorageKey, JSON.stringify({ unlockedAt: Date.now() }));
}

export function clearSiteLockSession() {
  localStorage.removeItem(siteLockStorageKey);
}

export function normalizeRequest(request: RegistrationRequest): RegistrationRequest {
  return {
    ...request,
    status: request.status || 'pending',
    history: request.history || [{ status: request.status || 'pending', at: request.createdAt, by: 'system' }],
  };
}

export function getStoredRequests() {
  return (JSON.parse(localStorage.getItem(requestStorageKey) || '[]') as RegistrationRequest[]).map(normalizeRequest);
}

export function saveStoredRequests(requests: RegistrationRequest[]) {
  localStorage.setItem(requestStorageKey, JSON.stringify(requests));
}

export function persistRequest(request: RegistrationRequest) {
  const existing = getStoredRequests();
  saveStoredRequests([request, ...existing].slice(0, 200));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function requestFingerprint(request: RegistrationRequest) {
  return [
    request.fullName.trim().toLowerCase(),
    request.phoneWhatsApp.trim(),
    request.douarLink.trim().toLowerCase(),
    request.requestedStatus,
    request.message.trim().toLowerCase(),
  ].join('|');
}

function decisionWeight(status: RequestDecision) {
  if (status === 'accepted') return 3;
  if (status === 'rejected') return 3;
  if (status === 'recommended') return 2;
  return 1;
}

function mergeDuplicateRequest(current: RegistrationRequest, next: RegistrationRequest): RegistrationRequest {
  const normalizedCurrent = normalizeRequest(current);
  const normalizedNext = normalizeRequest(next);
  const keepNextStatus = decisionWeight(normalizedNext.status) > decisionWeight(normalizedCurrent.status);
  const keepNextDate = new Date(normalizedNext.createdAt).getTime() > new Date(normalizedCurrent.createdAt).getTime();
  const base = keepNextStatus || (!keepNextStatus && keepNextDate) ? normalizedNext : normalizedCurrent;
  const id = isUuid(normalizedCurrent.id) ? normalizedCurrent.id : normalizedNext.id;
  const history = [...(normalizedCurrent.history || []), ...(normalizedNext.history || [])]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.status === item.status && candidate.at === item.at) === index);
  return { ...base, id, history };
}

export function mergeRegistrationRequests(local: RegistrationRequest[], remote: RegistrationRequest[]) {
  const byId = new Map<string, RegistrationRequest>();
  const byFingerprint = new Map<string, string>();
  [...remote, ...local].forEach((request) => {
    const normalized = normalizeRequest(request);
    const fingerprint = requestFingerprint(normalized);
    const existingId = byFingerprint.get(fingerprint);
    if (existingId) {
      byId.set(existingId, mergeDuplicateRequest(byId.get(existingId) || normalized, normalized));
      return;
    }
    byFingerprint.set(fingerprint, normalized.id);
    byId.set(normalized.id, normalized);
  });
  return [...byId.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 200);
}

export function updateStoredRequestStatus(id: string, status: RequestDecision, by: 'bureau' | 'president' | 'system' = 'president') {
  const updated = getStoredRequests().map((request) => request.id === id ? {
    ...request,
    status,
    history: [...(request.history || []), { status, at: new Date().toISOString(), by }],
  } : request);
  saveStoredRequests(updated);
  return updated;
}
