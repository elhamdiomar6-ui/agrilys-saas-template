import { ArrowLeft, CheckCircle2, HeartHandshake, Pencil, Plus, RotateCcw, ShieldCheck, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readSolidarityActions, saveSolidarityActions } from '../data/solidarity';
import type { SolidarityAction, SolidarityCategory, SolidarityStatus } from '../types/solidarity';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newAction: string;
  editAction: string;
  titleLabel: string;
  description: string;
  category: string;
  status: string;
  date: string;
  organizer: string;
  published: string;
  internalNote: string;
  save: string;
  cancel: string;
  edit: string;
  empty: string;
  required: string;
  protection: string;
  future: string;
  categories: Record<SolidarityCategory, string>;
  statuses: Record<SolidarityStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - entraide sociale',
    intro: 'Gestion interne des actions solidaires : publication, statut, organisateur et note de suivi.',
    newAction: 'Nouvelle action',
    editAction: 'Modifier l action',
    titleLabel: 'Titre',
    description: 'Description courte',
    category: 'Categorie',
    status: 'Statut',
    date: 'Date',
    organizer: 'Organisateur',
    published: 'Publie dans /entraide',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucune action enregistree.',
    required: 'Titre, description, date et organisateur sont obligatoires.',
    protection: 'Ne pas saisir de liste publique de familles, donnee medicale reelle, paiement reel ou score social.',
    future: 'Prepare pour volontariat, coordination habitants et gestion future des aides du douar.',
    categories: {
      solidarite: 'Solidarite',
      sante: 'Sante',
      familles: 'Familles',
      urgence: 'Urgence',
      benevolat: 'Benevolat',
      alimentation: 'Alimentation',
      education: 'Education',
      environnement: 'Environnement',
    },
    statuses: {
      preparing: 'Preparation',
      active: 'Active',
      completed: 'Terminee',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - التعاون الاجتماعي',
    intro: 'تدبير داخلي لأعمال التضامن: النشر، الحالة، المنظم وملاحظة التتبع.',
    newAction: 'عمل جديد',
    editAction: 'تعديل العمل',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    category: 'الصنف',
    status: 'الحالة',
    date: 'التاريخ',
    organizer: 'المنظم',
    published: 'منشور في /entraide',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا توجد أي مبادرة مسجلة.',
    required: 'العنوان والوصف والتاريخ والمنظم ضرورية.',
    protection: 'لا تدخل لائحة عائلات عمومية أو معطيات طبية حقيقية أو أداء حقيقي أو تقييم اجتماعي.',
    future: 'مهيأ للتطوع وتنسيق السكان وتدبير المساعدات داخل الدوار.',
    categories: {
      solidarite: 'التضامن',
      sante: 'الصحة',
      familles: 'العائلات',
      urgence: 'الاستعجال',
      benevolat: 'التطوع',
      alimentation: 'التغذية',
      education: 'التعليم',
      environnement: 'البيئة',
    },
    statuses: {
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
  category: 'solidarite' as SolidarityCategory,
  status: 'preparing' as SolidarityStatus,
  date: today,
  organizer: '',
  published: false,
  internalNote: '',
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauEntraidePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [actions, setActions] = useState<SolidarityAction[]>(readSolidarityActions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...actions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [actions]);

  const persist = (next: SolidarityAction[]) => {
    setActions(next);
    saveSolidarityActions(next);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.organizer.trim()) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      organizer: form.organizer.trim(),
      internalNote: form.internalNote.trim(),
      titleAr: '',
      descriptionAr: '',
      scriptId: 'solidarity-init',
    };
    if (editingId) {
      persist(actions.map((action) => action.id === editingId ? { ...action, ...payload, updatedAt: now } : action));
    } else {
      persist([{ id: `SOL-${Date.now()}`, ...payload, createdAt: now, updatedAt: now }, ...actions]);
    }
    reset();
  };

  const edit = (action: SolidarityAction) => {
    setEditingId(action.id);
    setForm({
      title: action.title,
      description: action.description,
      category: action.category,
      status: action.status,
      date: action.date,
      organizer: action.organizer,
      published: action.published,
      internalNote: action.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel solidarity-page bureau-solidarity-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><HeartHandshake size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-entraide" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="solidarity-form" onSubmit={submit}>
        <h2>{editingId ? t.editAction : t.newAction}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="solidarity-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as SolidarityCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as SolidarityStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="solidarity-form-grid">
          <label className="field"><span>{t.date}</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
          <label className="field"><span>{t.organizer}</span><input value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.internalNote}</span><textarea rows={3} value={form.internalNote} onChange={(event) => setForm({ ...form, internalNote: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.published}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}><RotateCcw size={18} /> {t.cancel}</button> : null}
        </div>
      </form>

      <div className="solidarity-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((action) => (
          <article className={`solidarity-card ${action.status}`} key={action.id}>
            <div className="solidarity-topline"><span>{t.categories[action.category]}</span><strong>{t.statuses[action.status]}</strong></div>
            <h2>{action.title}</h2>
            <p>{action.description}</p>
            <div className="solidarity-meta"><span>{formatDate(action.date, lang)}</span><span><UserRound size={15} /> {action.organizer}</span></div>
            {action.internalNote ? <p className="solidarity-note">{action.internalNote}</p> : null}
            <div className="bureau-actions"><button type="button" onClick={() => edit(action)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
