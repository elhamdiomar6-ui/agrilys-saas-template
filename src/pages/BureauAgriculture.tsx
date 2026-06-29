import { ArrowLeft, CheckCircle2, Pencil, Plus, RotateCcw, ShieldCheck, Sprout, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readAgricultureInitiatives, saveAgricultureInitiatives } from '../data/agriculture';
import type { AgricultureCategory, AgricultureInitiative, AgricultureStatus } from '../types/agriculture';

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
  date: string;
  responsible: string;
  published: string;
  internalNote: string;
  save: string;
  cancel: string;
  edit: string;
  empty: string;
  required: string;
  protection: string;
  future: string;
  categories: Record<AgricultureCategory, string>;
  statuses: Record<AgricultureStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - agriculture et terres communautaires',
    intro: 'Gestion interne des initiatives agricoles : publication, statut, responsable et note de suivi.',
    newInitiative: 'Nouvelle initiative',
    editInitiative: 'Modifier l initiative',
    titleLabel: 'Titre',
    description: 'Description courte',
    category: 'Categorie',
    status: 'Statut',
    date: 'Date',
    responsible: 'Responsable',
    published: 'Publie dans /agriculture',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucune initiative enregistree.',
    required: 'Titre, description, date et responsable sont obligatoires.',
    protection: 'Ne pas saisir de donnee fonciere reelle, titre de propriete, donnee juridique sensible, GPS ou automatisation agricole.',
    future: 'Prepare pour suivi irrigation, statistiques agricoles et cooperatives du douar.',
    categories: {
      irrigation: 'Irrigation',
      oliviers: 'Oliviers',
      amandiers: 'Amandiers',
      elevage: 'Elevage',
      entretienTerres: 'Entretien terres',
      environnement: 'Environnement',
      reboisement: 'Reboisement',
      agricultureDurable: 'Agriculture durable',
    },
    statuses: {
      preparing: 'Preparation',
      active: 'Active',
      seasonal: 'Saisonniere',
      completed: 'Terminee',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - الفلاحة والأراضي الجماعية',
    intro: 'تدبير داخلي للمبادرات الفلاحية: النشر، الحالة، المسؤول وملاحظة التتبع.',
    newInitiative: 'مبادرة جديدة',
    editInitiative: 'تعديل المبادرة',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    category: 'الصنف',
    status: 'الحالة',
    date: 'التاريخ',
    responsible: 'المسؤول',
    published: 'منشور في /agriculture',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا توجد أي مبادرة مسجلة.',
    required: 'العنوان والوصف والتاريخ والمسؤول ضرورية.',
    protection: 'لا تدخل معطيات عقارية حقيقية أو وثائق ملكية أو معطيات قانونية حساسة أو GPS أو أتمتة فلاحية.',
    future: 'مهيأ لتتبع السقي والإحصائيات الفلاحية والتعاونيات داخل الدوار.',
    categories: {
      irrigation: 'السقي',
      oliviers: 'الزيتون',
      amandiers: 'اللوز',
      elevage: 'تربية المواشي',
      entretienTerres: 'العناية بالأراضي',
      environnement: 'البيئة',
      reboisement: 'التشجير',
      agricultureDurable: 'الفلاحة المستدامة',
    },
    statuses: {
      preparing: 'في التحضير',
      active: 'نشطة',
      seasonal: 'موسمية',
      completed: 'منتهية',
    },
  },
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  title: '',
  description: '',
  category: 'irrigation' as AgricultureCategory,
  status: 'preparing' as AgricultureStatus,
  date: today,
  responsible: '',
  published: false,
  internalNote: '',
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauAgriculturePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [initiatives, setInitiatives] = useState<AgricultureInitiative[]>(readAgricultureInitiatives);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...initiatives].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [initiatives]);

  const persist = (next: AgricultureInitiative[]) => {
    setInitiatives(next);
    saveAgricultureInitiatives(next);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.responsible.trim()) {
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
      scriptId: 'agriculture-init',
    };
    if (editingId) {
      persist(initiatives.map((initiative) => initiative.id === editingId ? { ...initiative, ...payload, updatedAt: now } : initiative));
    } else {
      persist([{ id: `AGR-${Date.now()}`, ...payload, createdAt: now, updatedAt: now }, ...initiatives]);
    }
    reset();
  };

  const edit = (initiative: AgricultureInitiative) => {
    setEditingId(initiative.id);
    setForm({
      title: initiative.title,
      description: initiative.description,
      category: initiative.category,
      status: initiative.status,
      date: initiative.date,
      responsible: initiative.responsible,
      published: initiative.published,
      internalNote: initiative.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel agriculture-page bureau-agriculture-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Sprout size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-agriculture" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="agriculture-form" onSubmit={submit}>
        <h2>{editingId ? t.editInitiative : t.newInitiative}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="agriculture-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AgricultureCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AgricultureStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="agriculture-form-grid">
          <label className="field"><span>{t.date}</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
          <label className="field"><span>{t.responsible}</span><input value={form.responsible} onChange={(event) => setForm({ ...form, responsible: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.internalNote}</span><textarea rows={3} value={form.internalNote} onChange={(event) => setForm({ ...form, internalNote: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.published}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}><RotateCcw size={18} /> {t.cancel}</button> : null}
        </div>
      </form>

      <div className="agriculture-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((initiative) => (
          <article className={`agriculture-card ${initiative.status}`} key={initiative.id}>
            <div className="agriculture-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{initiative.title}</h2>
            <p>{initiative.description}</p>
            <div className="agriculture-meta"><span>{formatDate(initiative.date, lang)}</span><span><UserRound size={15} /> {initiative.responsible}</span></div>
            {initiative.internalNote ? <p className="agriculture-note">{initiative.internalNote}</p> : null}
            <div className="bureau-actions"><button type="button" onClick={() => edit(initiative)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
