import { ArrowLeft, CheckCircle2, History, Milestone, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readTimelineEvents, saveTimelineEvents } from '../data/timeline';
import type { TimelineCategory, TimelineEvent, TimelineImportance, TimelineStatus } from '../types/timeline';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newEvent: string;
  editEvent: string;
  periodLabel: string;
  eventLabel: string;
  categoryLabel: string;
  descriptionLabel: string;
  importanceLabel: string;
  statusLabel: string;
  publishedLabel: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  empty: string;
  required: string;
  internalNotice: string;
  categories: Record<TimelineCategory, string>;
  importance: Record<TimelineImportance, string>;
  statuses: Record<TimelineStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Gestion de la chronologie',
    intro: 'Espace interne pour préparer l histoire du douar sans publier une information non confirmée comme certaine.',
    newEvent: 'Nouvel événement',
    editEvent: 'Modifier l événement',
    periodLabel: 'Année ou période',
    eventLabel: 'Événement',
    categoryLabel: 'Catégorie',
    descriptionLabel: 'Description courte',
    importanceLabel: 'Importance',
    statusLabel: 'Statut de vérification',
    publishedLabel: 'Publié dans /chronologie',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    empty: 'Aucun événement enregistré.',
    required: 'Période, événement et description sont obligatoires.',
    internalNotice: 'Publier uniquement les informations non sensibles. Les souvenirs incertains doivent rester à confirmer.',
    categories: {
      foundation: 'Fondation',
      water: 'Eau',
      agriculture: 'Agriculture',
      mosquee: 'Mosquée',
      climate: 'Événements climatiques',
      solidarity: 'Solidarité',
      development: 'Développement',
      collective_projects: 'Projets collectifs',
      heritage: 'Patrimoine',
      education: 'Éducation',
    },
    importance: {
      normal: 'Normale',
      important: 'Importante',
      major_historical: 'Historique majeure',
    },
    statuses: {
      verified: 'Vérifié',
      to_confirm: 'À confirmer',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تدبير التسلسل التاريخي',
    intro: 'فضاء داخلي لإعداد تاريخ الدوار دون نشر المعلومة غير المؤكدة كحقيقة نهائية.',
    newEvent: 'حدث جديد',
    editEvent: 'تعديل الحدث',
    periodLabel: 'السنة أو الفترة',
    eventLabel: 'الحدث',
    categoryLabel: 'الصنف',
    descriptionLabel: 'وصف قصير',
    importanceLabel: 'الأهمية',
    statusLabel: 'حالة التحقق',
    publishedLabel: 'منشور في /chronologie',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    empty: 'لا يوجد أي حدث مسجل.',
    required: 'الفترة والحدث والوصف ضرورية.',
    internalNotice: 'تنشر فقط المعلومات غير الحساسة. الذكريات غير المؤكدة تبقى بحاجة إلى تأكيد.',
    categories: {
      foundation: 'التأسيس',
      water: 'الماء',
      agriculture: 'الفلاحة',
      mosquee: 'المسجد',
      climate: 'أحداث مناخية',
      solidarity: 'التضامن',
      development: 'التنمية',
      collective_projects: 'مشاريع جماعية',
      heritage: 'التراث',
      education: 'التعليم',
    },
    importance: {
      normal: 'عادية',
      important: 'مهمة',
      major_historical: 'تاريخية كبرى',
    },
    statuses: {
      verified: 'مؤكد',
      to_confirm: 'بحاجة إلى تأكيد',
    },
  },
};

const emptyForm = {
  period: '',
  event: '',
  description: '',
  category: 'heritage' as TimelineCategory,
  importance: 'normal' as TimelineImportance,
  status: 'to_confirm' as TimelineStatus,
  published: false,
};

function periodRank(period: string) {
  const match = period.match(/\d{3,4}/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

export default function BureauChronologiePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [events, setEvents] = useState<TimelineEvent[]>(readTimelineEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...events].sort((a, b) => periodRank(a.period) - periodRank(b.period)), [events]);

  const persist = (nextEvents: TimelineEvent[]) => {
    setEvents(nextEvents);
    saveTimelineEvents(nextEvents);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.period.trim() || !form.event.trim() || !form.description.trim()) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      persist(events.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } : item));
    } else {
      persist([{ id: `CHR-${Date.now()}`, ...form, createdAt: now, updatedAt: now }, ...events]);
    }
    reset();
  };

  const edit = (item: TimelineEvent) => {
    setEditingId(item.id);
    setForm({
      period: item.period,
      event: item.event,
      description: item.description,
      category: item.category,
      importance: item.importance,
      status: item.status,
      published: item.published,
    });
    setError('');
  };

  const remove = (id: string) => {
    persist(events.filter((item) => item.id !== id));
    if (editingId === id) reset();
  };

  return (
    <section className="panel bureau-timeline-page timeline-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><History size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-chronologie" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.internalNotice}</p>

      <form className="timeline-form" onSubmit={submit}>
        <h2>{editingId ? t.editEvent : t.newEvent}</h2>
        <div className="timeline-form-grid">
          <label className="field"><span>{t.periodLabel}</span><input value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })} /></label>
          <label className="field"><span>{t.eventLabel}</span><input value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} /></label>
        </div>
        <div className="timeline-form-grid">
          <label className="field"><span>{t.categoryLabel}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as TimelineCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.importanceLabel}</span><select value={form.importance} onChange={(event) => setForm({ ...form, importance: event.target.value as TimelineImportance })}>{Object.entries(t.importance).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <label className="field"><span>{t.statusLabel}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TimelineStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label className="field"><span>{t.descriptionLabel}</span><textarea value={form.description} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.publishedLabel}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
        </div>
      </form>

      <div className="timeline-list bureau-timeline-list">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((item) => (
          <article className={`timeline-item ${item.importance} ${item.status}`} key={item.id}>
            <div className="timeline-marker"><Milestone size={18} /></div>
            <div className="timeline-card">
              <div className="timeline-meta"><span>{item.period}</span><strong>{t.statuses[item.status]}</strong></div>
              <h2>{item.event}</h2>
              <p>{item.description}</p>
              <div className="timeline-tags"><span>{t.categories[item.category]}</span><span>{t.importance[item.importance]}</span></div>
              <div className="bureau-actions">
                <button type="button" onClick={() => edit(item)}><Pencil size={18} /> {t.edit}</button>
                <button type="button" className="danger-action" onClick={() => remove(item.id)}><Trash2 size={18} /> {t.remove}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
