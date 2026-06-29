import { ArrowLeft, CheckCircle2, Map, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readCommunityMapPoints, saveCommunityMapPoints } from '../data/communityMap';
import type { CommunityMapCategory, CommunityMapPoint, CommunityMapStatus } from '../types/communityMap';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newPoint: string;
  editPoint: string;
  titleLabel: string;
  categoryLabel: string;
  descriptionLabel: string;
  statusLabel: string;
  positionXLabel: string;
  positionYLabel: string;
  publishedLabel: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  empty: string;
  required: string;
  internalNotice: string;
  categories: Record<CommunityMapCategory, string>;
  statuses: Record<CommunityMapStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Gestion de la carte communautaire',
    intro: 'Espace interne pour préparer une carte illustrative du territoire sans GPS réel ni données sensibles.',
    newPoint: 'Nouveau point',
    editPoint: 'Modifier le point',
    titleLabel: 'Titre du lieu',
    categoryLabel: 'Catégorie',
    descriptionLabel: 'Description courte',
    statusLabel: 'Statut',
    positionXLabel: 'Position horizontale illustrative',
    positionYLabel: 'Position verticale illustrative',
    publishedLabel: 'Publié dans /carte-communautaire',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    empty: 'Aucun point enregistré.',
    required: 'Titre, catégorie et description sont obligatoires.',
    internalNotice: 'Ne pas saisir de coordonnées GPS réelles. Les positions servent seulement à placer un marqueur sur une carte simple.',
    categories: {
      water: 'Eau',
      agriculture: 'Agriculture',
      mosquee: 'Mosquée',
      heritage: 'Patrimoine',
      collective: 'Collectif',
      historical: 'Historique',
      services: 'Services',
    },
    statuses: {
      public: 'Public',
      to_verify: 'À vérifier',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تدبير الخريطة الجماعية',
    intro: 'فضاء داخلي لإعداد خريطة توضيحية للمجال بدون GPS حقيقي وبدون معطيات حساسة.',
    newPoint: 'نقطة جديدة',
    editPoint: 'تعديل النقطة',
    titleLabel: 'اسم المكان',
    categoryLabel: 'الصنف',
    descriptionLabel: 'وصف قصير',
    statusLabel: 'الحالة',
    positionXLabel: 'الموضع الأفقي التوضيحي',
    positionYLabel: 'الموضع العمودي التوضيحي',
    publishedLabel: 'منشور في /carte-communautaire',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    empty: 'لا توجد أي نقطة مسجلة.',
    required: 'اسم المكان والصنف والوصف ضرورية.',
    internalNotice: 'لا تدخل أي إحداثيات GPS حقيقية. المواضع تستعمل فقط لوضع علامة على خريطة بسيطة.',
    categories: {
      water: 'الماء',
      agriculture: 'الفلاحة',
      mosquee: 'المسجد',
      heritage: 'التراث',
      collective: 'جماعي',
      historical: 'تاريخي',
      services: 'خدمات',
    },
    statuses: {
      public: 'عمومي',
      to_verify: 'بحاجة إلى تحقق',
    },
  },
};

const emptyForm = {
  title: '',
  category: 'collective' as CommunityMapCategory,
  description: '',
  status: 'to_verify' as CommunityMapStatus,
  published: false,
  positionX: 50,
  positionY: 50,
};

function clampPosition(value: number) {
  if (Number.isNaN(value)) return 50;
  return Math.min(92, Math.max(8, value));
}

export default function BureauCarteCommunautairePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [points, setPoints] = useState<CommunityMapPoint[]>(readCommunityMapPoints);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...points].sort((a, b) => a.title.localeCompare(b.title)), [points]);

  const persist = (nextPoints: CommunityMapPoint[]) => {
    setPoints(nextPoints);
    saveCommunityMapPoints(nextPoints);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    const cleaned = {
      ...form,
      positionX: clampPosition(form.positionX),
      positionY: clampPosition(form.positionY),
    };
    if (editingId) {
      persist(points.map((point) => point.id === editingId ? { ...point, ...cleaned, updatedAt: now } : point));
    } else {
      persist([{ id: `MAP-${Date.now()}`, ...cleaned, createdAt: now, updatedAt: now }, ...points]);
    }
    reset();
  };

  const edit = (point: CommunityMapPoint) => {
    setEditingId(point.id);
    setForm({
      title: point.title,
      category: point.category,
      description: point.description,
      status: point.status,
      published: point.published,
      positionX: point.positionX,
      positionY: point.positionY,
    });
    setError('');
  };

  const remove = (id: string) => {
    persist(points.filter((point) => point.id !== id));
    if (editingId === id) reset();
  };

  return (
    <section className="panel bureau-community-map-page community-map-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Map size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-carte" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.internalNotice}</p>

      <form className="community-map-form" onSubmit={submit}>
        <h2>{editingId ? t.editPoint : t.newPoint}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <div className="community-map-form-grid">
          <label className="field"><span>{t.categoryLabel}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as CommunityMapCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.statusLabel}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CommunityMapStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <label className="field"><span>{t.descriptionLabel}</span><textarea value={form.description} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="community-map-form-grid">
          <label className="field"><span>{t.positionXLabel}</span><input type="number" min="8" max="92" value={form.positionX} onChange={(event) => setForm({ ...form, positionX: Number(event.target.value) })} /></label>
          <label className="field"><span>{t.positionYLabel}</span><input type="number" min="8" max="92" value={form.positionY} onChange={(event) => setForm({ ...form, positionY: Number(event.target.value) })} /></label>
        </div>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.publishedLabel}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
        </div>
      </form>

      <div className="community-map-shell bureau-map-preview">
        {sorted.map((point) => (
          <div className={`map-point ${point.category} ${point.status}`} style={{ insetInlineStart: `${point.positionX}%`, top: `${point.positionY}%` }} key={point.id} title={point.title}>
            <MapPin size={18} />
          </div>
        ))}
      </div>

      <div className="community-map-list">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((point) => (
          <article className={`community-map-card ${point.status}`} key={point.id}>
            <div className="community-map-topline"><span>{t.categories[point.category]}</span><strong>{t.statuses[point.status]}</strong></div>
            <h2>{point.title}</h2>
            <p>{point.description}</p>
            <div className="bureau-actions">
              <button type="button" onClick={() => edit(point)}><Pencil size={18} /> {t.edit}</button>
              <button type="button" className="danger-action" onClick={() => remove(point.id)}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
