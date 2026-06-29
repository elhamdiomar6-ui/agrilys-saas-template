import { ArrowLeft, CheckCircle2, Globe2, MapPin, Pencil, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readDiasporaInitiatives, saveDiasporaInitiatives } from '../data/diaspora';
import type { DiasporaCategory, DiasporaInitiative, DiasporaStatus } from '../types/diaspora';

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
  region: string;
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
  categories: Record<DiasporaCategory, string>;
  statuses: Record<DiasporaStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - diaspora et soutien externe',
    intro: 'Gestion interne des initiatives diaspora : publication, statut, pays ou region et note de suivi.',
    newInitiative: 'Nouvelle initiative diaspora',
    editInitiative: 'Modifier l initiative',
    titleLabel: 'Titre',
    description: 'Description courte',
    category: 'Categorie',
    status: 'Statut',
    region: 'Pays ou region',
    date: 'Date',
    published: 'Publie dans /diaspora',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucune initiative diaspora enregistree.',
    required: 'Titre, description, pays ou region et date sont obligatoires.',
    protection: 'Ne pas saisir de donnee financiere reelle, transfert argent, donnee privee diaspora, contact public sensible ou information bancaire.',
    future: 'Prepare pour lien diaspora, mentorat et soutien aux projets du douar.',
    categories: {
      projectSupport: 'Soutien projets',
      education: 'Education',
      solidarity: 'Solidarite',
      skills: 'Competences',
      communityInvestment: 'Investissements communautaires',
      heritage: 'Patrimoine',
      youth: 'Jeunesse',
      agriculture: 'Agriculture',
    },
    statuses: {
      idea: 'Idee',
      active: 'Active',
      completed: 'Terminee',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - الجالية والدعم الخارجي',
    intro: 'تدبير داخلي لمبادرات الجالية: النشر، الحالة، البلد أو الجهة وملاحظة التتبع.',
    newInitiative: 'مبادرة جديدة للجالية',
    editInitiative: 'تعديل المبادرة',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    category: 'الصنف',
    status: 'الحالة',
    region: 'البلد أو الجهة',
    date: 'التاريخ',
    published: 'منشور في /diaspora',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا توجد أي مبادرة مسجلة خاصة بالجالية.',
    required: 'العنوان والوصف والبلد أو الجهة والتاريخ ضرورية.',
    protection: 'لا تدخل معطيات مالية حقيقية أو تحويلات مالية أو معلومات خاصة بالجالية أو تواصلا عموميا حساسا أو معلومات بنكية.',
    future: 'مهيأ للتواصل مع الجالية والتأطير ودعم مشاريع الدوار.',
    categories: {
      projectSupport: 'دعم المشاريع',
      education: 'التعليم',
      solidarity: 'التضامن',
      skills: 'الكفاءات',
      communityInvestment: 'استثمارات جماعية',
      heritage: 'التراث',
      youth: 'الشباب',
      agriculture: 'الفلاحة',
    },
    statuses: {
      idea: 'فكرة',
      active: 'نشطة',
      completed: 'منتهية',
    },
  },
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  title: '',
  description: '',
  category: 'projectSupport' as DiasporaCategory,
  status: 'idea' as DiasporaStatus,
  region: '',
  date: today,
  published: false,
  internalNote: '',
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauDiasporaPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [initiatives, setInitiatives] = useState<DiasporaInitiative[]>(readDiasporaInitiatives);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...initiatives].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [initiatives]);

  const persist = (next: DiasporaInitiative[]) => {
    setInitiatives(next);
    saveDiasporaInitiatives(next);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.region.trim() || !form.date) {
      setError(t.required);
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      region: form.region.trim(),
      internalNote: form.internalNote.trim(),
      titleAr: '',
      descriptionAr: '',
      scriptId: 'diaspora-init',
    };

    if (editingId) {
      persist(initiatives.map((initiative) => initiative.id === editingId ? { ...initiative, ...payload, updatedAt: now } : initiative));
    } else {
      persist([{ id: `DIA-${Date.now()}`, ...payload, createdAt: now, updatedAt: now }, ...initiatives]);
    }
    reset();
  };

  const edit = (initiative: DiasporaInitiative) => {
    setEditingId(initiative.id);
    setForm({
      title: initiative.title,
      description: initiative.description,
      category: initiative.category,
      status: initiative.status,
      region: initiative.region,
      date: initiative.date,
      published: initiative.published,
      internalNote: initiative.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel diaspora-page bureau-diaspora-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Globe2 size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-diaspora" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="diaspora-form" onSubmit={submit}>
        <h2>{editingId ? t.editInitiative : t.newInitiative}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="diaspora-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as DiasporaCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as DiasporaStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="diaspora-form-grid">
          <label className="field"><span>{t.region}</span><input value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} /></label>
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

      <div className="diaspora-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((initiative) => (
          <article className={`diaspora-card ${initiative.status}`} key={initiative.id}>
            <div className="diaspora-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{initiative.title}</h2>
            <p>{initiative.description}</p>
            <div className="diaspora-meta"><span>{formatDate(initiative.date, lang)}</span><span><MapPin size={15} /> {initiative.region}</span></div>
            {initiative.internalNote ? <p className="diaspora-note">{initiative.internalNote}</p> : null}
            <div className="bureau-actions"><button type="button" onClick={() => edit(initiative)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
