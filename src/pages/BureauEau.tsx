import { ArrowLeft, CheckCircle2, Droplets, Pencil, Plus, RotateCcw, ShieldCheck, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readWaterInformations, saveWaterInformations } from '../data/water';
import type { WaterCategory, WaterInformation, WaterStatus } from '../types/water';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newInfo: string;
  editInfo: string;
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
  categories: Record<WaterCategory, string>;
  statuses: Record<WaterStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - eau et forage',
    intro: 'Gestion interne des informations eau : publication, statut, responsable et note de suivi.',
    newInfo: 'Nouvelle information',
    editInfo: 'Modifier l information',
    titleLabel: 'Titre',
    description: 'Description courte',
    category: 'Categorie',
    status: 'Statut',
    date: 'Date',
    responsible: 'Responsable',
    published: 'Publie dans /eau',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucune information enregistree.',
    required: 'Titre, description, date et responsable sont obligatoires.',
    protection: 'Ne pas saisir de donnee technique dangereuse, controle infrastructure, capteur, telemetrie ou automatisation industrielle.',
    future: 'Prepare pour suivi maintenance, suivi consommation et alertes aux habitants du douar.',
    categories: {
      forage: 'Forage',
      reservoir: 'Reservoir',
      reseau: 'Reseau',
      maintenance: 'Maintenance',
      qualiteEau: 'Qualite eau',
      sensibilisation: 'Sensibilisation',
      projetHydraulique: 'Projet hydraulique',
    },
    statuses: {
      normal: 'Normal',
      maintenance: 'Maintenance',
      alert: 'Alerte',
      project: 'Projet',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - الماء والبئر',
    intro: 'تدبير داخلي لمعلومات الماء: النشر، الحالة، المسؤول وملاحظة التتبع.',
    newInfo: 'معلومة جديدة',
    editInfo: 'تعديل المعلومة',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    category: 'الصنف',
    status: 'الحالة',
    date: 'التاريخ',
    responsible: 'المسؤول',
    published: 'منشور في /eau',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا توجد أي معلومة مسجلة.',
    required: 'العنوان والوصف والتاريخ والمسؤول ضرورية.',
    protection: 'لا تدخل معطيات تقنية خطيرة أو تحكما في البنية أو أجهزة قياس أو تتبعا آليا أو أتمتة صناعية.',
    future: 'مهيأ لتتبع الصيانة والاستهلاك والتنبيهات لسكان الدوار.',
    categories: {
      forage: 'البئر',
      reservoir: 'الخزان',
      reseau: 'الشبكة',
      maintenance: 'الصيانة',
      qualiteEau: 'جودة الماء',
      sensibilisation: 'التحسيس',
      projetHydraulique: 'مشروع مائي',
    },
    statuses: {
      normal: 'عادي',
      maintenance: 'صيانة',
      alert: 'تنبيه',
      project: 'مشروع',
    },
  },
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  title: '',
  description: '',
  category: 'forage' as WaterCategory,
  status: 'normal' as WaterStatus,
  date: today,
  responsible: '',
  published: false,
  internalNote: '',
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauEauPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [items, setItems] = useState<WaterInformation[]>(readWaterInformations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [items]);

  const persist = (next: WaterInformation[]) => {
    setItems(next);
    saveWaterInformations(next);
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
      scriptId: 'water-init',
    };
    if (editingId) {
      persist(items.map((item) => item.id === editingId ? { ...item, ...payload, updatedAt: now } : item));
    } else {
      persist([{ id: `EAU-${Date.now()}`, ...payload, createdAt: now, updatedAt: now }, ...items]);
    }
    reset();
  };

  const edit = (item: WaterInformation) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      date: item.date,
      responsible: item.responsible,
      published: item.published,
      internalNote: item.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel water-page bureau-water-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Droplets size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-eau" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="water-form" onSubmit={submit}>
        <h2>{editingId ? t.editInfo : t.newInfo}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="water-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as WaterCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as WaterStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="water-form-grid">
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

      <div className="water-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((item) => (
          <article className={`water-card ${item.status}`} key={item.id}>
            <div className="water-topline"><span>{t.categories[item.category]}</span><strong>{t.statuses[item.status]}</strong></div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="water-meta"><span>{formatDate(item.date, lang)}</span><span><UserRound size={15} /> {item.responsible}</span></div>
            {item.internalNote ? <p className="water-note">{item.internalNote}</p> : null}
            <div className="bureau-actions"><button type="button" onClick={() => edit(item)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
