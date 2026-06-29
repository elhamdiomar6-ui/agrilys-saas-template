import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, Pencil, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readEvents, saveEvents } from '../data/events';
import type { CommunityEvent, EventCategory, EventImportance, EventStatus } from '../types/events';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newEvent: string;
  editEvent: string;
  titleLabel: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  importance: string;
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
  categories: Record<EventCategory, string>;
  statuses: Record<EventStatus, string>;
  importances: Record<EventImportance, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - événements communautaires',
    intro: 'Gestion interne des événements : publication, statut, importance, lieu et note de suivi.',
    newEvent: 'Nouvel événement',
    editEvent: 'Modifier l événement',
    titleLabel: 'Titre',
    description: 'Description courte',
    date: 'Date et heure',
    location: 'Lieu',
    category: 'Catégorie',
    status: 'Statut',
    importance: 'Importance',
    organizer: 'Organisateur',
    published: 'Publié dans /evenements',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucun événement enregistré.',
    required: 'Titre, description, date, lieu et organisateur sont obligatoires.',
    protection: 'Pas de réservation, pas de paiement, pas de notification réelle et aucune donnée sensible.',
    future: 'Préparé pour calendrier, notifications et participation des habitants du douar.',
    categories: {
      reunion: 'Réunion',
      solidarite: 'Solidarité',
      mosquee: 'Mosquée',
      jeunesse: 'Jeunesse',
      agriculture: 'Agriculture',
      patrimoine: 'Patrimoine',
      nettoyage: 'Nettoyage',
      formation: 'Formation',
      feteLocale: 'Fête locale',
    },
    statuses: {
      planned: 'Prévu',
      confirmed: 'Confirmé',
      completed: 'Terminé',
    },
    importances: {
      normal: 'Normale',
      important: 'Importante',
      urgent: 'Très importante',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - الأحداث الجماعية',
    intro: 'تدبير داخلي للأحداث: النشر، الحالة، الأهمية، المكان وملاحظة التتبع.',
    newEvent: 'حدث جديد',
    editEvent: 'تعديل الحدث',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    date: 'التاريخ والوقت',
    location: 'المكان',
    category: 'الصنف',
    status: 'الحالة',
    importance: 'الأهمية',
    organizer: 'المنظم',
    published: 'منشور في /evenements',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا يوجد أي حدث مسجل.',
    required: 'العنوان والوصف والتاريخ والمكان والمنظم ضرورية.',
    protection: 'لا توجد حجوزات أو أداءات أو تذكيرات حقيقية أو معطيات حساسة.',
    future: 'مهيأ للتقويم والتذكيرات ومشاركة سكان الدوار.',
    categories: {
      reunion: 'اجتماع',
      solidarite: 'تضامن',
      mosquee: 'المسجد',
      jeunesse: 'الشباب',
      agriculture: 'الفلاحة',
      patrimoine: 'التراث',
      nettoyage: 'نظافة',
      formation: 'تكوين',
      feteLocale: 'مناسبة محلية',
    },
    statuses: {
      planned: 'مبرمج',
      confirmed: 'مؤكد',
      completed: 'منتهى',
    },
    importances: {
      normal: 'عادية',
      important: 'مهمة',
      urgent: 'مهمة جدا',
    },
  },
};

const nowLocal = new Date().toISOString().slice(0, 16);
const emptyForm = {
  title: '',
  description: '',
  date: nowLocal,
  location: '',
  category: 'reunion' as EventCategory,
  status: 'planned' as EventStatus,
  importance: 'normal' as EventImportance,
  organizer: '',
  published: false,
  internalNote: '',
};

function toInputDate(value: string) {
  if (!value) return nowLocal;
  return value.slice(0, 16);
}

function normalizeDate(value: string) {
  return new Date(value).toISOString();
}

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function BureauEvenementsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [events, setEvents] = useState<CommunityEvent[]>(readEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [events]);

  const persist = (next: CommunityEvent[]) => {
    setEvents(next);
    saveEvents(next);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim() || !form.organizer.trim()) {
      setError(t.required);
      return;
    }
    const current = new Date().toISOString();
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      date: normalizeDate(form.date),
      location: form.location.trim(),
      organizer: form.organizer.trim(),
      internalNote: form.internalNote.trim(),
      titleAr: '',
      descriptionAr: '',
      scriptId: 'events-init',
    };
    if (editingId) {
      persist(events.map((item) => item.id === editingId ? { ...item, ...payload, updatedAt: current } : item));
    } else {
      persist([{ id: `EVT-${Date.now()}`, ...payload, createdAt: current, updatedAt: current }, ...events]);
    }
    reset();
  };

  const edit = (event: CommunityEvent) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      date: toInputDate(event.date),
      location: event.location,
      category: event.category,
      status: event.status,
      importance: event.importance,
      organizer: event.organizer,
      published: event.published,
      internalNote: event.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel events-page bureau-events-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><CalendarDays size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-evenements" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="events-form" onSubmit={submit}>
        <h2>{editingId ? t.editEvent : t.newEvent}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="events-form-grid">
          <label className="field"><span>{t.date}</span><input type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
          <label className="field"><span>{t.location}</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
        </div>
        <div className="events-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as EventCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EventStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="events-form-grid">
          <label className="field"><span>{t.importance}</span><select value={form.importance} onChange={(event) => setForm({ ...form, importance: event.target.value as EventImportance })}>{Object.entries(t.importances).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
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

      <div className="events-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((event) => (
          <article className={`event-card ${event.status} ${event.importance}`} key={event.id}>
            <div className="event-topline"><span>{t.categories[event.category]}</span><strong>{t.statuses[event.status]}</strong></div>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <div className="event-meta"><span><CalendarDays size={15} /> {formatDate(event.date, lang)}</span><span><MapPin size={15} /> {event.location}</span></div>
            <div className="event-meta"><span>{t.organizer}: {event.organizer}</span><span>{t.importances[event.importance]}</span></div>
            {event.internalNote ? <p className="event-note">{event.internalNote}</p> : null}
            <div className="bureau-actions"><button type="button" onClick={() => edit(event)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
