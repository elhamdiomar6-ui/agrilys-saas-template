import { ArrowLeft, BookOpenText, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readOralMemoryStories, saveOralMemoryStories } from '../data/oralMemory';
import type { OralMemoryCategory, OralMemoryStatus, OralMemoryStory } from '../types/oralMemory';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newStory: string;
  editStory: string;
  titleLabel: string;
  narratorLabel: string;
  periodLabel: string;
  summaryLabel: string;
  categoryLabel: string;
  statusLabel: string;
  publishedLabel: string;
  audioPlannedLabel: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  empty: string;
  required: string;
  internalNotice: string;
  categories: Record<OralMemoryCategory, string>;
  statuses: Record<OralMemoryStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Gestion de la mémoire orale',
    intro: 'Espace interne pour préparer les récits publics du douar sans audio réel pour l instant.',
    newStory: 'Nouveau récit',
    editStory: 'Modifier le récit',
    titleLabel: 'Titre',
    narratorLabel: 'Narrateur',
    periodLabel: 'Période approximative',
    summaryLabel: 'Résumé',
    categoryLabel: 'Catégorie',
    statusLabel: 'Statut',
    publishedLabel: 'Publié dans /memoire-orale',
    audioPlannedLabel: 'Audio prévu plus tard',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    empty: 'Aucun récit enregistré.',
    required: 'Titre, narrateur, période et résumé sont obligatoires.',
    internalNotice: 'Ne pas publier de détails privés. Les récits à confirmer doivent rester marqués comme tels.',
    categories: {
      histoire: 'Histoire',
      traditions: 'Traditions',
      agriculture: 'Agriculture',
      eau: 'Eau',
      mosquee: 'Mosquée',
      solidarite: 'Solidarité',
      evenements: 'Événements marquants',
    },
    statuses: {
      verified: 'Vérifié',
      to_confirm: 'À confirmer',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تدبير الذاكرة الشفوية',
    intro: 'فضاء داخلي لإعداد الروايات العمومية للدوار بدون صوت حقيقي حاليا.',
    newStory: 'رواية جديدة',
    editStory: 'تعديل الرواية',
    titleLabel: 'العنوان',
    narratorLabel: 'الراوي',
    periodLabel: 'الفترة التقريبية',
    summaryLabel: 'الملخص',
    categoryLabel: 'الصنف',
    statusLabel: 'الحالة',
    publishedLabel: 'منشورة في /memoire-orale',
    audioPlannedLabel: 'الصوت سيضاف لاحقا',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    empty: 'لا توجد أي رواية مسجلة.',
    required: 'العنوان والراوي والفترة والملخص ضرورية.',
    internalNotice: 'لا تنشر تفاصيل خاصة. الروايات غير المؤكدة يجب أن تبقى موسومة بأنها بحاجة إلى تأكيد.',
    categories: {
      histoire: 'التاريخ',
      traditions: 'التقاليد',
      agriculture: 'الفلاحة',
      eau: 'الماء',
      mosquee: 'المسجد',
      solidarite: 'التضامن',
      evenements: 'أحداث بارزة',
    },
    statuses: {
      verified: 'تم التحقق',
      to_confirm: 'بحاجة إلى تأكيد',
    },
  },
};

const emptyForm = {
  title: '',
  narrator: '',
  approximatePeriod: '',
  summary: '',
  category: 'histoire' as OralMemoryCategory,
  status: 'to_confirm' as OralMemoryStatus,
  published: false,
  audioPlanned: true,
};

export default function BureauMemoireOralePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [stories, setStories] = useState<OralMemoryStory[]>(readOralMemoryStories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...stories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [stories]);

  const persist = (items: OralMemoryStory[]) => {
    setStories(items);
    saveOralMemoryStories(items);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.narrator.trim() || !form.approximatePeriod.trim() || !form.summary.trim()) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      persist(stories.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } : item));
    } else {
      persist([{ id: `MEM-${Date.now()}`, ...form, createdAt: now, updatedAt: now }, ...stories]);
    }
    reset();
  };

  const edit = (story: OralMemoryStory) => {
    setEditingId(story.id);
    setForm({
      title: story.title,
      narrator: story.narrator,
      approximatePeriod: story.approximatePeriod,
      summary: story.summary,
      category: story.category,
      status: story.status,
      published: story.published,
      audioPlanned: story.audioPlanned,
    });
    setError('');
  };

  const remove = (id: string) => {
    persist(stories.filter((item) => item.id !== id));
    if (editingId === id) reset();
  };

  return (
    <section className="panel bureau-oral-memory-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><BookOpenText size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-memoire-orale" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.internalNotice}</p>

      <form className="oral-memory-form" onSubmit={submit}>
        <h2>{editingId ? t.editStory : t.newStory}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <div className="oral-memory-form-grid">
          <label className="field"><span>{t.narratorLabel}</span><input value={form.narrator} onChange={(event) => setForm({ ...form, narrator: event.target.value })} /></label>
          <label className="field"><span>{t.periodLabel}</span><input value={form.approximatePeriod} onChange={(event) => setForm({ ...form, approximatePeriod: event.target.value })} /></label>
          <label className="field"><span>{t.categoryLabel}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as OralMemoryCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.statusLabel}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as OralMemoryStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <label className="field"><span>{t.summaryLabel}</span><textarea value={form.summary} rows={4} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.publishedLabel}</span></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.audioPlanned} onChange={(event) => setForm({ ...form, audioPlanned: event.target.checked })} /><span>{t.audioPlannedLabel}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
        </div>
      </form>

      <div className="oral-memory-list">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((story) => (
          <article className={`oral-memory-card ${story.status}`} key={story.id}>
            <div className="oral-memory-topline"><span>{t.categories[story.category]}</span><strong>{t.statuses[story.status]}</strong></div>
            <h2>{story.title}</h2>
            <p>{story.summary}</p>
            <div className="bureau-actions">
              <button type="button" onClick={() => edit(story)}><Pencil size={18} /> {t.edit}</button>
              <button type="button" className="danger-action" onClick={() => remove(story.id)}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
