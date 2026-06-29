import { ArrowLeft, CheckCircle2, Clock3, Send, ShieldCheck } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { readReports, saveReports } from '../data/reports';
import { createResidentReport, fetchResidentReports } from '../lib/mvpSupabase';
import type { ReportCategory, ReportLevel, ResidentReport } from '../types/report';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  category: string;
  description: string;
  level: string;
  submit: string;
  required: string;
  sent: string;
  localFallback: string;
  privacy: string;
  noUploadGps: string;
  latest: string;
  empty: string;
  categories: Record<ReportCategory, string>;
  levels: Record<ReportLevel, string>;
  statuses: Record<ResidentReport['status'], string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Signalement habitant',
    intro: 'Envoyer un signalement simple au bureau, sans photo, sans GPS et sans donnée sensible.',
    category: 'Catégorie',
    description: 'Description courte',
    level: 'Niveau',
    submit: 'Envoyer le signalement',
    required: 'Catégorie, niveau et description courte sont obligatoires.',
    sent: 'Signalement envoyé. Le bureau le consultera avant toute action.',
    localFallback: 'Signalement enregistré sur cet appareil. La synchronisation Supabase devra être vérifiée par le bureau.',
    privacy: 'Ne pas saisir de nom de famille, information privée ou document sensible.',
    noUploadGps: 'Aucun upload réel et aucune localisation GPS ne sont utilisés pour l instant.',
    latest: 'Derniers signalements envoyés depuis cet appareil',
    empty: 'Aucun signalement envoyé depuis cet appareil.',
    categories: {
      eau: 'Eau',
      eclairage: 'Éclairage',
      route: 'Route',
      proprete: 'Propreté',
      securite: 'Sécurité',
      autre: 'Autre',
    },
    levels: {
      normal: 'Normal',
      important: 'Important',
      urgent: 'Urgent',
    },
    statuses: {
      sent: 'Envoyé',
      in_progress: 'En cours',
      resolved: 'Résolu',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تبليغ الساكنة',
    intro: 'إرسال تبليغ بسيط إلى المكتب، بدون صورة، بدون GPS، وبدون معطيات حساسة.',
    category: 'الصنف',
    description: 'وصف قصير',
    level: 'المستوى',
    submit: 'إرسال التبليغ',
    required: 'الصنف والمستوى والوصف القصير ضرورية.',
    sent: 'تم إرسال التبليغ. سيقوم المكتب بالاطلاع عليه قبل أي إجراء.',
    localFallback: 'تم حفظ التبليغ على هذا الجهاز. يجب على المكتب التحقق من مزامنة Supabase.',
    privacy: 'لا تدخل أسماء عائلية أو معلومات خاصة أو وثائق حساسة.',
    noUploadGps: 'لا يوجد أي رفع ملفات حقيقي ولا أي استعمال للموقع GPS حاليا.',
    latest: 'آخر التبليغات المرسلة من هذا الجهاز',
    empty: 'لا يوجد أي تبليغ مرسل من هذا الجهاز.',
    categories: {
      eau: 'الماء',
      eclairage: 'الإنارة',
      route: 'الطريق',
      proprete: 'النظافة',
      securite: 'السلامة',
      autre: 'أخرى',
    },
    levels: {
      normal: 'عادي',
      important: 'مهم',
      urgent: 'مستعجل',
    },
    statuses: {
      sent: 'مرسل',
      in_progress: 'قيد المعالجة',
      resolved: 'تم الحل',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function SignalementPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [reports, setReports] = useState<ResidentReport[]>(readReports);
  const [category, setCategory] = useState<ReportCategory>('eau');
  const [level, setLevel] = useState<ReportLevel>('normal');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sorted = useMemo(() => [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [reports]);

  useEffect(() => {
    let mounted = true;
    fetchResidentReports().then((result) => {
      if (!mounted) return;
      if (result.data.length) {
        setReports(result.data);
        saveReports(result.data);
      }
    });
    return () => { mounted = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim()) {
      setError(t.required);
      return;
    }
    setIsSubmitting(true);
    const now = new Date().toISOString();
    const next: ResidentReport = {
      id: `SIG-${Date.now()}`,
      category,
      level,
      description: description.trim(),
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [next, ...reports].slice(0, 100);
    setReports(updated);
    saveReports(updated);

    const remote = await createResidentReport({ category, level, description: description.trim() });
    setIsSubmitting(false);
    setDescription('');
    setLevel('normal');
    setCategory('eau');
    setError('');
    setMessage(remote.error ? t.localFallback : t.sent);
  };

  return (
    <main role="main" className="panel report-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><ShieldCheck size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="signalement" />

      <form className="report-form" onSubmit={submit}>
        <div className="report-form-grid">
          <label className="field">
            <span>{t.category}</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as ReportCategory)}>
              {Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.level}</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as ReportLevel)}>
              {Object.entries(t.levels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>{t.description}</span>
          <textarea value={description} rows={4} onChange={(event) => setDescription(event.target.value)} />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-note"><CheckCircle2 size={18} /> {message}</p> : null}
        <button className="primary-action" type="submit" disabled={isSubmitting}><Send size={18} /> {isSubmitting ? 'Envoi...' : t.submit}</button>
      </form>

      <div className="resident-info-grid">
        <div className="status-item"><div className="status-icon"><ShieldCheck size={20} /></div><div><strong>{t.privacy}</strong><span>{t.noUploadGps}</span></div></div>
      </div>

      <div className="report-list">
        <h2>{t.latest}</h2>
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((report) => (
          <article className={`report-card ${report.level}`} key={report.id}>
            <div className="report-topline">
              <span>{t.categories[report.category]}</span>
              <strong>{t.levels[report.level]}</strong>
            </div>
            <p>{report.description}</p>
            <CardListenButton text={`${t.categories[report.category]}. ${report.description}`} lang={lang} />
            <div className="report-meta"><Clock3 size={16} /> {formatDate(report.createdAt, lang)} - {t.statuses[report.status]}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
