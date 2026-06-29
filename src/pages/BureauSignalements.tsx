import { ArrowLeft, CheckCircle2, Clock3, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readReports, saveReports } from '../data/reports';
import { fetchResidentReports, updateResidentReport } from '../lib/mvpSupabase';
import type { ReportCategory, ReportLevel, ReportStatus, ResidentReport } from '../types/report';

type Lang = 'fr' | 'ar';
type FilterStatus = 'all' | ReportStatus;

type Copy = {
  back: string;
  title: string;
  intro: string;
  filter: string;
  all: string;
  status: string;
  internalNote: string;
  saveNote: string;
  empty: string;
  privacy: string;
  total: string;
  sentCount: string;
  progressCount: string;
  resolvedCount: string;
  categories: Record<ReportCategory, string>;
  levels: Record<ReportLevel, string>;
  statuses: Record<ReportStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Signalements habitants',
    intro: 'Espace interne Bureau/Président pour suivre les signalements sans exposer de données sensibles.',
    filter: 'Filtrer par statut',
    all: 'Tous',
    status: 'Statut',
    internalNote: 'Note interne courte',
    saveNote: 'Enregistrer la note',
    empty: 'Aucun signalement reçu.',
    privacy: 'Pas d upload réel, pas de GPS, pas de données sensibles.',
    total: 'Total',
    sentCount: 'Envoyés',
    progressCount: 'En cours',
    resolvedCount: 'Résolus',
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
    title: 'تبليغات الساكنة',
    intro: 'فضاء داخلي للمكتب والرئيس لتتبع التبليغات دون عرض معطيات حساسة.',
    filter: 'تصفية حسب الحالة',
    all: 'الكل',
    status: 'الحالة',
    internalNote: 'ملاحظة داخلية قصيرة',
    saveNote: 'حفظ الملاحظة',
    empty: 'لا يوجد أي تبليغ حاليا.',
    privacy: 'لا يوجد رفع ملفات حقيقي، ولا GPS، ولا معطيات حساسة.',
    total: 'المجموع',
    sentCount: 'مرسلة',
    progressCount: 'قيد المعالجة',
    resolvedCount: 'تم حلها',
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

export default function BureauSignalementsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [reports, setReports] = useState<ResidentReport[]>(readReports);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [remoteError, setRemoteError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchResidentReports().then((result) => {
      if (!mounted) return;
      if (result.error) setRemoteError(result.error);
      if (result.data.length) {
        setReports(result.data);
        saveReports(result.data);
      }
    });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => reports
    .filter((report) => filter === 'all' || report.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [reports, filter]);

  const persist = (items: ResidentReport[]) => {
    setReports(items);
    saveReports(items);
  };

  const updateStatus = async (id: string, status: ReportStatus) => {
    const remote = await updateResidentReport(id, { status });
    if (remote.error) setRemoteError(remote.error);
    persist(reports.map((report) => report.id === id ? { ...report, status, updatedAt: new Date().toISOString() } : report));
  };

  const saveNote = async (id: string) => {
    const note = notes[id] ?? '';
    const remote = await updateResidentReport(id, { internalNote: note.trim() });
    if (remote.error) setRemoteError(remote.error);
    persist(reports.map((report) => report.id === id ? { ...report, internalNote: note.trim(), updatedAt: new Date().toISOString() } : report));
  };

  return (
    <section className="panel bureau-reports-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><ShieldCheck size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-signalements" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.privacy}</p>
      {remoteError ? (
        <p className="warning-text">
          {lang === 'ar'
            ? 'تعذر تحديث المزامنة الآن. يتم عرض البيانات المحفوظة محليا على هذا الجهاز.'
            : 'Synchronisation à vérifier. Les données conservées localement sur cet appareil restent affichées.'}
        </p>
      ) : null}

      <div className="bureau-stats">
        <div className="bureau-stat"><span>{t.total}</span><strong>{reports.length}</strong></div>
        <div className="bureau-stat gold"><span>{t.sentCount}</span><strong>{reports.filter((item) => item.status === 'sent').length}</strong></div>
        <div className="bureau-stat"><span>{t.progressCount}</span><strong>{reports.filter((item) => item.status === 'in_progress').length}</strong></div>
        <div className="bureau-stat soft"><span>{t.resolvedCount}</span><strong>{reports.filter((item) => item.status === 'resolved').length}</strong></div>
      </div>

      <label className="field report-filter">
        <span>{t.filter}</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value as FilterStatus)}>
          <option value="all">{t.all}</option>
          {Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>

      <div className="bureau-report-list">
        {filtered.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filtered.map((report) => (
          <article className={`report-card ${report.level}`} key={report.id}>
            <div className="report-topline">
              <span>{t.categories[report.category]} - {t.levels[report.level]}</span>
              <strong>{t.statuses[report.status]}</strong>
            </div>
            <p>{report.description}</p>
            <div className="report-meta"><Clock3 size={16} /> {formatDate(report.createdAt, lang)}</div>
            <div className="bureau-report-controls">
              <label className="field">
                <span>{t.status}</span>
                <select value={report.status} onChange={(event) => updateStatus(report.id, event.target.value as ReportStatus)}>
                  {Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>{t.internalNote}</span>
                <textarea rows={3} defaultValue={report.internalNote || ''} onChange={(event) => setNotes({ ...notes, [report.id]: event.target.value })} />
              </label>
            </div>
            <button className="inline-save-button" type="button" onClick={() => saveNote(report.id)}><Save size={17} /> {t.saveNote}</button>
          </article>
        ))}
      </div>
    </section>
  );
}
