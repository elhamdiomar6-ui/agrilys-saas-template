import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardList, LockKeyhole, ThumbsUp, XCircle } from 'lucide-react';
import AudioHelp from '../../components/AudioHelp';
import WhatsAppMessageCard from '../../components/WhatsAppMessageCard';
import PinConfirmationModal from '../../components/PinConfirmationModal';
import { approveHabitantRequest, rejectHabitantRequest, recommendHabitantRequest } from '../../lib/habitants';
import { fetchRegistrationRequests, createRegistrationRequest } from '../../lib/mvpSupabase';
import { getStorageKey } from '../../lib/storage/storageUtils';
import type { UserRole } from '../../types/roles';

type Lang = 'fr' | 'ar';
type RequestedStatus = 'habitant' | 'adherent' | 'soutien';
type RequestDecision = 'pending' | 'recommended' | 'accepted' | 'rejected';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };

type RegistrationHistoryItem = {
  status: RequestDecision;
  at: string;
  by: 'bureau' | 'president' | 'system';
};

type RegistrationRequest = {
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

type GeneratedPinNotice = {
  requestId: string;
  whatsappMessage: string;
  whatsappUrl: string;
  phoneRaw: string;
  phone: string;
  fullName: string;
  displayExpiresAt: string;
};

const requestStorageKey = getStorageKey('registrationRequests', 'v2');
const generatedPinsStorageKey = getStorageKey('generatedPins', 'v1');
const generatedPinRetentionMs = 5 * 60 * 1000;

const text = {
  fr: {
    back: 'Retour',
    bureauTitle: 'Demandes d\'inscription',
    bureauIntro: 'Valider et traiter les demandes d\'inscription. Le bureau recommande, la présidence crée les comptes.',
    internalPrivacy: 'Espace privé. Données sensibles. Les demandes sont validées avant activation.',
    totalRequests: 'Total',
    pendingRequests: 'En attente',
    recommendedRequests: 'Recommandées',
    acceptedRequests: 'Acceptées',
    rejectedRequests: 'Rejetées',
    noRequests: 'Aucune demande pour le moment.',
    applicant: 'Demandeur',
    phoneWhatsApp: 'Téléphone WhatsApp',
    douarLink: 'Lien avec le douar',
    requestedStatus: 'Statut demandé',
    sentAt: 'Date d\'envoi',
    decisionHistory: 'Historique',
    recommend: 'Recommander',
    accept: 'Créer le compte',
    reject: 'Rejeter',
    resident: 'Habitant',
    member: 'Adhérent',
    supporter: 'Soutien',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    recommended: 'Recommandée',
    pending: 'En attente',
  },
  ar: {
    back: 'رجوع',
    bureauTitle: 'طلبات الانخراط',
    bureauIntro: 'التحقق من طلبات الانخراط ومعالجتها. يوصي المكتب، والرئيس ينشئ الحسابات.',
    internalPrivacy: 'مساحة خاصة. بيانات حساسة. يتم التحقق من الطلبات قبل التفعيل.',
    totalRequests: 'الإجمالي',
    pendingRequests: 'قيد الانتظار',
    recommendedRequests: 'الموصى بها',
    acceptedRequests: 'المقبولة',
    rejectedRequests: 'المرفوضة',
    noRequests: 'لا توجد طلبات في الوقت الحالي.',
    applicant: 'المتقدم',
    phoneWhatsApp: 'هاتف واتساب',
    douarLink: 'الارتباط بالدوار',
    requestedStatus: 'الحالة المطلوبة',
    sentAt: 'تاريخ الإرسال',
    decisionHistory: 'السجل',
    recommend: 'توصية',
    accept: 'إنشاء حساب',
    reject: 'رفض',
    resident: 'ساكن',
    member: 'منخرط',
    supporter: 'داعم',
    accepted: 'مقبولة',
    rejected: 'مرفوضة',
    recommended: 'موصى بها',
    pending: 'قيد الانتظار',
  },
};

function readGeneratedPinNotices() {
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

function saveGeneratedPinNotices(notices: GeneratedPinNotice[]) {
  if (notices.length) localStorage.setItem(generatedPinsStorageKey, JSON.stringify(notices));
  else localStorage.removeItem(generatedPinsStorageKey);
}

function getStoredRequests() {
  return (JSON.parse(localStorage.getItem(requestStorageKey) || '[]') as RegistrationRequest[]).map(normalizeRequest);
}

function saveStoredRequests(requests: RegistrationRequest[]) {
  localStorage.setItem(requestStorageKey, JSON.stringify(requests));
}

function persistRequest(request: RegistrationRequest) {
  const existing = getStoredRequests();
  saveStoredRequests([request, ...existing].slice(0, 200));
}

function normalizeRequest(request: RegistrationRequest): RegistrationRequest {
  return {
    ...request,
    status: request.status || 'pending',
    history: request.history || [{ status: request.status || 'pending', at: request.createdAt, by: 'system' }],
  };
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

function mergeRegistrationRequests(local: RegistrationRequest[], remote: RegistrationRequest[]) {
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

function updateStoredRequestStatus(id: string, status: RequestDecision, by: 'bureau' | 'president' | 'system' = 'president') {
  const updated = getStoredRequests().map((request) => request.id === id ? {
    ...request,
    status,
    history: [...(request.history || []), { status, at: new Date().toISOString(), by }],
  } : request);
  saveStoredRequests(updated);
  return updated;
}

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function statusLabel(status: RequestedStatus, t: TextBundle) {
  if (status === 'adherent') return t.member;
  if (status === 'soutien') return t.supporter;
  return t.resident;
}

function decisionLabel(status: RequestDecision, t: TextBundle) {
  if (status === 'accepted') return t.accepted;
  if (status === 'rejected') return t.rejected;
  if (status === 'recommended') return t.recommended;
  return t.pending;
}

export default function BureauInscriptionsPage({ lang, t: propsT, currentRole, onBack }: { lang: Lang; t: TextBundle; currentRole: UserRole | null; onBack: () => void }) {
  const t = propsT || text[lang];
  const [requests, setRequests] = useState<RegistrationRequest[]>(getStoredRequests);
  const [remoteError, setRemoteError] = useState('');
  const [busyRequestId, setBusyRequestId] = useState('');
  const [pinNotices, setPinNotices] = useState<GeneratedPinNotice[]>(readGeneratedPinNotices);
  const activePinNotice = pinNotices[0] || null;
  const generatedPins = useMemo(
    () => Object.fromEntries(pinNotices.map((notice) => [notice.requestId, notice])),
    [pinNotices],
  );

  useEffect(() => {
    let mounted = true;
    fetchRegistrationRequests().then((result) => {
      if (!mounted) return;
      if (result.error) {
        setRemoteError(result.error);
        return;
      }
      if (result.data.length) {
        const merged = mergeRegistrationRequests(getStoredRequests(), result.data);
        saveStoredRequests(merged);
        setRequests(merged);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!pinNotices.length) return;
    const nextExpiration = Math.min(...pinNotices.map((notice) => new Date(notice.displayExpiresAt).getTime()));
    const timeout = window.setTimeout(() => {
      setPinNotices((current) => {
        const active = current.filter((notice) => new Date(notice.displayExpiresAt).getTime() > Date.now());
        saveGeneratedPinNotices(active);
        return active;
      });
    }, Math.max(0, nextExpiration - Date.now()) + 50);
    return () => window.clearTimeout(timeout);
  }, [pinNotices]);

  useEffect(() => {
    if (!activePinNotice) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const blockEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') event.preventDefault();
    };
    document.addEventListener('keydown', blockEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', blockEscape);
    };
  }, [activePinNotice]);

  const setDecision = async (id: string, status: RequestDecision) => {
    setBusyRequestId(id);
    setRemoteError('');
    try {
      if (status === 'recommended') {
        await recommendHabitantRequest(id);
        const updated = updateStoredRequestStatus(id, 'recommended', 'bureau');
        setRequests(updated);
      } else if (status === 'accepted') {
        const result = await approveHabitantRequest(id);
        const updated = updateStoredRequestStatus(id, 'accepted', 'president');
        setRequests(updated);
        const notice: GeneratedPinNotice = {
          requestId: id,
          whatsappMessage: result.whatsappMessage,
          whatsappUrl: result.whatsappUrl,
          phoneRaw: result.phoneRaw,
          phone: result.phone,
          fullName: result.fullName,
          displayExpiresAt: new Date(Date.now() + generatedPinRetentionMs).toISOString(),
        };
        setPinNotices((current) => {
          const next = [notice, ...current.filter((item) => item.requestId !== id)];
          saveGeneratedPinNotices(next);
          return next;
        });
      } else {
        await rejectHabitantRequest(id);
        const updated = updateStoredRequestStatus(id, 'rejected', currentRole === 'bureau' ? 'bureau' : 'president');
        setRequests(updated);
      }
    } catch (decisionError) {
      setRemoteError(decisionError instanceof Error ? decisionError.message : 'Décision impossible.');
    } finally {
      setBusyRequestId('');
    }
  };

  const confirmPinNoted = () => {
    if (!activePinNotice) return;
    setPinNotices((current) => {
      const next = current.filter((notice) => notice.requestId !== activePinNotice.requestId);
      saveGeneratedPinNotices(next);
      return next;
    });
  };

  const pending = requests.filter((request) => request.status === 'pending').length;
  const recommended = requests.filter((request) => request.status === 'recommended').length;
  const accepted = requests.filter((request) => request.status === 'accepted').length;
  const rejected = requests.filter((request) => request.status === 'rejected').length;

  return (
    <section className="panel bureau-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><ClipboardList size={28} /></div>
      <h1>{t.bureauTitle}</h1>
      <p className="intro">{t.bureauIntro}</p>
      <AudioHelp scriptId="bureau-inscriptions" />
      <p className="privacy-note"><LockKeyhole size={18} /> {t.internalPrivacy}</p>
      {remoteError ? (
        <div className="approval-api-error" role="alert">
          <strong>{lang === 'ar' ? 'خطأ المصادقة على الطلب' : 'Erreur exacte de l\'approbation'}</strong>
          <code>{remoteError}</code>
        </div>
      ) : null}

      <div className="bureau-stats">
        <StatCard label={t.totalRequests} value={requests.length} />
        <StatCard label={t.pendingRequests} value={pending} tone="gold" />
        <StatCard label={t.recommendedRequests} value={recommended} tone="gold" />
        <StatCard label={t.acceptedRequests} value={accepted} />
        <StatCard label={t.rejectedRequests} value={rejected} tone="soft" />
      </div>

      <div className="bureau-list">
        {requests.length === 0 ? <p className="empty-state">{t.noRequests}</p> : null}
        {requests.map((request) => (
          <article className="bureau-request" key={request.id}>
            <div className="bureau-request-head">
              <div>
                <span>{t.applicant}</span>
                <strong>{request.fullName}</strong>
              </div>
              <span className={`decision-pill ${request.status}`}>{decisionLabel(request.status, t)}</span>
            </div>
            <div className="bureau-request-grid">
              <div><span>{t.phoneWhatsApp}</span><strong>{request.phoneWhatsApp}</strong></div>
              <div><span>{t.douarLink}</span><strong>{request.douarLink}</strong></div>
              <div><span>{t.requestedStatus}</span><strong>{statusLabel(request.requestedStatus, t)}</strong></div>
              <div><span>{t.sentAt}</span><strong>{formatDate(request.createdAt, lang)}</strong></div>
            </div>
            {request.message ? <p className="bureau-message">{request.message}</p> : null}
            <div className="bureau-history">
              <span>{t.decisionHistory}</span>
              <strong>{(request.history || []).map((item) => `${decisionLabel(item.status, t)} - ${formatDate(item.at, lang)}`).join(' | ')}</strong>
            </div>
            {generatedPins[request.id] ? (
              <WhatsAppMessageCard
                message={generatedPins[request.id].whatsappMessage}
                url={generatedPins[request.id].whatsappUrl}
                phone={generatedPins[request.id].phone}
              />
            ) : null}
            <div className="bureau-actions">
              {currentRole === 'bureau' && request.status === 'pending' ? (
                <button type="button" onClick={() => setDecision(request.id, 'recommended')} disabled={busyRequestId === request.id}>
                  <ThumbsUp size={18} /> {busyRequestId === request.id
                    ? (lang === 'ar' ? 'جاري...' : 'En cours...')
                    : t.recommend}
                </button>
              ) : null}
              {currentRole === 'president' ? (
                <button type="button" onClick={() => setDecision(request.id, 'accepted')} disabled={busyRequestId === request.id || request.status === 'rejected'}>
                  <CheckCircle2 size={18} /> {busyRequestId === request.id
                    ? (lang === 'ar' ? 'جاري الإنشاء...' : 'Création...')
                    : request.status === 'accepted'
                      ? (lang === 'ar' ? 'كود جديد' : 'Régénérer le PIN')
                      : t.accept}
                </button>
              ) : null}
              <button
                type="button"
                className="danger-action"
                onClick={() => setDecision(request.id, 'rejected')}
                disabled={busyRequestId === request.id || (currentRole === 'bureau' ? request.status !== 'pending' : request.status === 'accepted')}
              >
                <XCircle size={18} /> {t.reject}
              </button>
            </div>
          </article>
        ))}
      </div>

      {activePinNotice ? (
        <PinConfirmationModal
          fullName={activePinNotice.fullName}
          phone={activePinNotice.phone}
          whatsappMessage={activePinNotice.whatsappMessage}
          whatsappUrl={activePinNotice.whatsappUrl}
          onConfirm={confirmPinNoted}
        />
      ) : null}
    </section>
  );
}

function StatCard({ label, value, tone = 'green' }: { label: string; value: string | number; tone?: 'green' | 'gold' | 'soft' }) {
  return (
    <div className={`bureau-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
