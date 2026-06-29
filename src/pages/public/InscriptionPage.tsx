import { ArrowLeft, CheckCircle2, Link2, MessageSquareText, Phone, UserRound, UsersRound } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../../components/AudioHelp';
import { siteConfig } from '../../config/site';
import { createRegistrationRequest } from '../../lib/mvpSupabase';
import { getStorageKey } from '../../lib/storage/storageUtils';

type Lang = 'fr' | 'ar';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };
type RequestedStatus = 'habitant' | 'adherent' | 'soutien';

const requestStorageKey = getStorageKey('registrationRequests', 'v2');

const text = {
  fr: {
    back: 'Retour',
    inscriptionTitle: 'Demande d\'inscription',
    inscriptionIntro: 'Formulaire public simple pour habitants, adhérents ou personnes de soutien liées au douar.',
    fullName: 'Nom complet',
    phoneWhatsApp: 'Téléphone WhatsApp',
    douarLink: 'Lien avec le douar',
    requestedStatus: 'Statut demandé',
    resident: 'Habitant',
    member: 'Adhérent',
    supporter: 'Soutien',
    optionalMessage: 'Message facultatif',
    submit: 'Envoyer la demande',
    required: 'Nom complet, téléphone WhatsApp, lien avec le douar et statut sont obligatoires.',
    successTitle: 'Demande envoyée',
    successDesc: 'Votre demande a été envoyée. Le bureau la vérifiera avant validation.',
  },
  ar: {
    back: 'رجوع',
    inscriptionTitle: 'طلب الانخراط',
    inscriptionIntro: 'نموذج عمومي بسيط للساكنين والمنخرطين وداعمي الدوار.',
    fullName: 'الاسم الكامل',
    phoneWhatsApp: 'هاتف واتساب',
    douarLink: 'الارتباط بالدوار',
    requestedStatus: 'الحالة المطلوبة',
    resident: 'ساكن',
    member: 'منخرط',
    supporter: 'داعم',
    optionalMessage: 'رسالة اختيارية',
    submit: 'إرسال الطلب',
    required: 'الاسم الكامل ورقم واتساب والارتباط بالدوار والحالة إجباريون.',
    successTitle: 'تم إرسال الطلب',
    successDesc: 'تم إرسال طلبك. سيتحقق المكتب منه قبل التصديق.',
  },
};

function persistRequest(request: any) {
  const existing = (JSON.parse(localStorage.getItem(requestStorageKey) || '[]') as any[]).map(normalizeRequest);
  const normalized = normalizeRequest(request);
  const saveToStorage = (requests: any[]) => {
    localStorage.setItem(requestStorageKey, JSON.stringify(requests));
  };
  saveToStorage([normalized, ...existing].slice(0, 200));
}

function normalizeRequest(request: any) {
  return {
    ...request,
    status: request.status || 'pending',
    history: request.history || [{ status: request.status || 'pending', at: request.createdAt, by: 'system' as const }],
  };
}

function Field({ label, value, onChange, icon, inputMode }: { label: string; value: string; onChange: (value: string) => void; icon?: React.ReactNode; inputMode?: 'tel' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        {icon}
        <input value={value} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

export default function InscriptionPage({ lang, t: propsT, submitted, setSubmitted, onBack }: { lang: Lang; t: TextBundle; submitted: boolean; setSubmitted: (value: boolean) => void; onBack: () => void }) {
  const t = propsT || text[lang];
  const [fullName, setFullName] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [douarLink, setDouarLink] = useState('');
  const [requestedStatus, setRequestedStatus] = useState<RequestedStatus>('habitant');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = useMemo(
    () => fullName.trim().length >= 3 && phoneWhatsApp.trim().length >= 6 && douarLink.trim().length >= 2 && Boolean(requestedStatus),
    [fullName, phoneWhatsApp, douarLink, requestedStatus],
  );

  const submitRequest = async () => {
    if (isSubmitting) return;
    if (!canSubmit) {
      setError(t.required);
      return;
    }
    setError('');
    setIsSubmitting(true);
    const request = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      phoneWhatsApp: phoneWhatsApp.trim(),
      douarLink: douarLink.trim(),
      requestedStatus,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      history: [{ status: 'pending' as const, at: new Date().toISOString(), by: 'system' as const }],
    };
    persistRequest(request);
    const remote = await createRegistrationRequest(request);
    setIsSubmitting(false);
    if (remote.error) {
      setConfirmation(lang === 'ar' ? 'تم حفظ الطلب محليا، ويجب التحقق من المزامنة.' : 'Demande conservée localement, synchronisation à vérifier.');
      setSubmitted(true);
      setError('');
      return;
    }
    setConfirmation(lang === 'ar' ? 'تم حفظ الطلب' : 'Demande enregistrée');
    setSubmitted(true);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitRequest();
  };

  if (submitted) {
    return (
      <section className="panel form-panel registration-only-panel">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
        <div className="success-icon"><CheckCircle2 size={42} /></div>
        <h1>{confirmation || t.successTitle}</h1>
        <p className="intro">{confirmation || t.successDesc}</p>
        <button className="primary-action" onClick={onBack}>{t.back}</button>
      </section>
    );
  }

  return (
    <section className="panel form-panel registration-only-panel">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{t.inscriptionTitle}</h1>
      <p className="place">{lang === 'ar' ? siteConfig.placeAr : siteConfig.place}</p>
      <p className="intro">{t.inscriptionIntro}</p>
      <AudioHelp scriptId="inscription" />

      <form onSubmit={submit} className="registration-form">
        <Field label={t.fullName} value={fullName} onChange={setFullName} icon={<UserRound size={18} />} />
        <Field label={t.phoneWhatsApp} value={phoneWhatsApp} onChange={setPhoneWhatsApp} icon={<Phone size={18} />} inputMode="tel" />
        <Field label={t.douarLink} value={douarLink} onChange={setDouarLink} icon={<Link2 size={18} />} />
        <label className="field">
          <span>{t.requestedStatus}</span>
          <select value={requestedStatus} onChange={(event) => setRequestedStatus(event.target.value as RequestedStatus)}>
            <option value="habitant">{t.resident}</option>
            <option value="adherent">{t.member}</option>
            <option value="soutien">{t.supporter}</option>
          </select>
        </label>
        <label className="field">
          <span>{t.optionalMessage}</span>
          <div className="textarea-wrap">
            <MessageSquareText size={18} />
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} />
          </div>
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-action" type="button" disabled={isSubmitting} onClick={() => void submitRequest()}>{isSubmitting ? 'Envoi...' : t.submit}</button>
      </form>
    </section>
  );
}
