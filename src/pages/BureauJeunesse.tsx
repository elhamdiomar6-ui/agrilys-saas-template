import { ArrowLeft, CheckCircle2, Pencil, Plus, RotateCcw, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readYouthInitiatives, saveYouthInitiatives } from '../data/youth';
import type { YouthCategory, YouthInitiative, YouthStatus } from '../types/youth';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newInitiative: string;
  editInitiative: string;
  titleLabel: string;
  description: string;
  category: string;
  status: string;
  responsible: string;
  date: string;
  published: string;
  internalNote: string;
  save: string;
  cancel: string;
  edit: string;
  empty: string;
  required: string;
  protection: string;
  future: string;
  categories: Record<YouthCategory, string>;
  statuses: Record<YouthStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - jeunesse et initiatives locales',
    intro: 'Gestion interne des initiatives jeunesse : publication, statut, responsable et note de suivi.',
    newInitiative: 'Nouvelle initiative',
    editInitiative: 'Modifier l initiative',
    titleLabel: 'Titre',
    description: 'Description courte',
    category: 'Categorie',
    status: 'Statut',
    responsible: 'Responsable',
    date: 'Date',
    published: 'Publie dans /jeunesse',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucune initiative enregistree.',
    required: 'Titre, description, responsable et date sont obligatoires.',
    protection: 'Aucune inscription reelle, aucun paiement, aucune messagerie et aucune donnee sensible.',
    future: 'Prepare pour volontariat, mentorat et participation des habitants du douar.',
    categories: {
      education: 'Education',
      sport: 'Sport',
      culture: 'Culture',
      solidarite: 'Solidarite',
      environnement: 'Environnement',
      numerique: 'Numerique',
      agriculture: 'Agriculture',
      patrimoine: 'Patrimoine',
    },
    statuses: {
      idea: 'Idee',
      preparing: 'En preparation',
      active: 'Active',
      completed: 'Terminee',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - الشباب والمبادرات المحلية',
    intro: 'تدبير داخلي لمبادرات الشباب: النشر، الحالة، المسؤول وملاحظة التتبع.',
    newInitiative: 'مبادرة جديدة',
    editInitiative: 'تعديل المبادرة',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    category: 'الصنف',
    status: 'الحالة',
    responsible: 'المسؤول',
    date: 'التاريخ',
    published: 'منشور في /jeunesse',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا توجد أي مبادرة مسجلة.',
    required: 'العنوان والوصف والمسؤول والتاريخ ضرورية.',
    protection: 'لا يوجد تسجيل حقيقي أو أداء أو مراسلة أو معطيات حساسة.',
    future: 'مهيأ للتطوع والتأطير ومشاركة سكان الدوار.',
    categories: {
      education: 'التعليم',
      sport: 'الرياضة',
      culture: 'الثقافة',
      solidarite: 'التضامن',
      environnement: 'البيئة',
      numerique: 'الرقمي',
      agriculture: 'الفلاحة',
      patrimoine: 'التراث',
    },
    statuses: {
      idea: 'فكرة',
      preparing: 'في التحضير',
      active: 'نشطة',
      completed: 'منتهية',
    },
  },
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  title: '',
  description: '',
  category: 'education' as YouthCategory,
  status: 'idea' as YouthStatus,
  responsible: '',
  date: today,
  published: false,
  internalNote: '',
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauJeunessePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [initiatives, setInitiatives] = useState<YouthInitiative[]>(readYouthInitiatives);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...initiatives].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [initiatives]);

  const persist = (next: YouthInitiative[]) => {
    setInitiatives(next);
    saveYouthInitiatives(next);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.responsible.trim() || !form.date) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      responsible: form.responsible.trim(),
      internalNote: form.internalNote.trim(),
      titleAr: '',
      descriptionAr: '',
      scriptId: 'youth-init',
    };
    if (editingId) {
      persist(initiatives.map((initiative) => initiative.id === editingId ? { ...initiative, ...payload, updatedAt: now } : initiative));
    } else {
      persist([{ id: `YOU-${Date.now()}`, ...payload, createdAt: now, updatedAt: now }, ...initiatives]);
    }
    reset();
  };

  const edit = (initiative: YouthInitiative) => {
    setEditingId(initiative.id);
    setForm({
      title: initiative.title,
      description: initiative.description,
      category: initiative.category,
      status: initiative.status,
      responsible: initiative.responsible,
      date: initiative.date,
      published: initiative.published,
      internalNote: initiative.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel youth-page bureau-youth-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Sparkles size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-jeunesse" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="youth-form" onSubmit={submit}>
        <h2>{editingId ? t.editInitiative : t.newInitiative}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="youth-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as YouthCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as YouthStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="youth-form-grid">
          <label className="field"><span>{t.responsible}</span><input value={form.responsible} onChange={(event) => setForm({ ...form, responsible: event.target.value })} /></label>
          <label className="field"><span>{t.date}</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.internalNote}</span><textarea rows={3} value={form.internalNote} onChange={(event) => setForm({ ...form, internalNote: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.published}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}><RotateCcw size={18} /> {t.cancel}</button> : null}
        </div>
      </form>

      <div className="youth-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((initiative) => (
          <article className={`youth-card ${initiative.status}`} key={initiative.id}>
            <div className="youth-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{initiative.title}</h2>
            <p>{initiative.description}</p>
            <div className="youth-meta"><span>{formatDate(initiative.date, lang)}</span><span><UserRound size={15} /> {initiative.responsible}</span></div>
            {initiative.internalNote ? <p className="youth-note">{initiative.internalNote}</p> : null}
            <div className="bureau-actions"><button type="button" onClick={() => edit(initiative)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
