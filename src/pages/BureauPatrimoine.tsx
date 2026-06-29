import { ArrowLeft, BarChart3, CheckCircle2, Filter, Landmark, Pencil, Plus, Trash2 } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import HeritagePhoto from '../components/HeritagePhoto';
import { readHeritageItems, saveHeritageItems } from '../data/heritage';
import type {
  HeritageAccessDifficulty,
  HeritageCategory,
  HeritageEconomicPotential,
  HeritageItem,
  HeritagePriority,
  HeritageSensitivity,
  HeritageStatus,
} from '../types/heritage';

type Lang = 'fr' | 'ar';
type FilterValue<T extends string> = 'all' | T;

type Copy = {
  back: string;
  title: string;
  intro: string;
  newItem: string;
  editItem: string;
  titleLabel: string;
  categoryLabel: string;
  descriptionLabel: string;
  valueLabel: string;
  tourismInterestLabel: string;
  accessDifficultyLabel: string;
  economicPotentialLabel: string;
  priorityLabel: string;
  sensitivityLabel: string;
  accessNotesLabel: string;
  internalNotesLabel: string;
  verifiedAtLabel: string;
  verifiedByLabel: string;
  statusLabel: string;
  publishedLabel: string;
  photoPlannedLabel: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  empty: string;
  required: string;
  sensitivePublishError: string;
  internalNotice: string;
  photoFuture: string;
  filtersTitle: string;
  all: string;
  statsTitle: string;
  total: string;
  published: string;
  toVerify: string;
  sensitive: string;
  highPriority: string;
  categories: Record<HeritageCategory, string>;
  statuses: Record<HeritageStatus, string>;
  accessDifficulties: Record<HeritageAccessDifficulty, string>;
  economicPotentials: Record<HeritageEconomicPotential, string>;
  priorities: Record<HeritagePriority, string>;
  sensitivities: Record<HeritageSensitivity, string>;
};

const categoryOrder: HeritageCategory[] = [
  'agricultural_landscapes',
  'viewpoints',
  'walking_trails',
  'architecture',
  'mosquee',
  'quranic_school',
  'oral_history',
  'collective_places',
  'water_points',
  'cave_shelter',
  'rock_engraving',
  'mineral_landscape',
  'local_products',
  'crafts',
  'local_meal',
  'homestay_potential',
  'local_guide',
  'photo_gallery',
  'tourism_map',
  'activity',
  'water_source',
  'agriculture',
  'landscape',
  'memory',
  'traditions',
];

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Gestion du patrimoine touristique',
    intro: 'Espace interne pour inventorier, vérifier et publier prudemment le patrimoine du douar.',
    newItem: 'Nouvel élément patrimonial',
    editItem: 'Modifier l élément',
    titleLabel: 'Titre',
    categoryLabel: 'Catégorie',
    descriptionLabel: 'Description courte',
    valueLabel: 'Valeur patrimoniale',
    tourismInterestLabel: 'Intérêt touristique',
    accessDifficultyLabel: 'Difficulté d accès',
    economicPotentialLabel: 'Potentiel économique',
    priorityLabel: 'Priorité',
    sensitivityLabel: 'Sensibilité',
    accessNotesLabel: 'Notes d accès',
    internalNotesLabel: 'Observation interne',
    verifiedAtLabel: 'Date de vérification',
    verifiedByLabel: 'Vérifié par',
    statusLabel: 'Statut',
    publishedLabel: 'Publié dans /patrimoine',
    photoPlannedLabel: 'Photo prévue plus tard',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    empty: 'Aucun élément patrimonial enregistré.',
    required: 'Titre, description et valeur patrimoniale sont obligatoires.',
    sensitivePublishError: 'Un élément sensible ne peut pas être publié publiquement.',
    internalNotice: 'Ne pas ajouter de photo sensible, de nom privé, de GPS réel ou de contact guide. Les éléments sensibles restent internes.',
    photoFuture: 'Photo en cours de collecte au village',
    filtersTitle: 'Filtres',
    all: 'Tous',
    statsTitle: 'Suivi patrimoine',
    total: 'Total',
    published: 'Publiés',
    toVerify: 'À vérifier',
    sensitive: 'Sensibles',
    highPriority: 'Priorité haute',
    categories: {
      agricultural_landscapes: 'Paysages agricoles',
      viewpoints: 'Points de vue',
      walking_trails: 'Sentiers',
      architecture: 'Architecture traditionnelle',
      mosquee: 'Mosquée / lieu religieux',
      quranic_school: 'École coranique',
      oral_history: 'Mémoire orale',
      collective_places: 'Lieux collectifs',
      water_points: 'Eau / source / puits',
      cave_shelter: 'Grotte / abri naturel',
      rock_engraving: 'Gravure / trace ancienne',
      mineral_landscape: 'Paysage minéral',
      local_products: 'Produits du terroir',
      crafts: 'Artisanat',
      local_meal: 'Repas expérience',
      homestay_potential: 'Hébergement potentiel',
      local_guide: 'Guide local',
      photo_gallery: 'Galerie photo',
      tourism_map: 'Carte touristique',
      activity: 'Activité possible',
      water_source: 'Source / eau',
      agriculture: 'Agriculture',
      landscape: 'Paysage',
      memory: 'Mémoire',
      traditions: 'Traditions',
    },
    statuses: {
      published: 'Publié',
      validated_internal: 'Validé interne',
      to_verify: 'À vérifier',
    },
    accessDifficulties: {
      easy: 'Facile',
      medium: 'Moyenne',
      hard: 'Difficile',
      to_verify: 'À vérifier',
    },
    economicPotentials: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      to_verify: 'À vérifier',
    },
    priorities: {
      high: 'Haute',
      medium: 'Moyenne',
      to_verify: 'À vérifier',
    },
    sensitivities: {
      public: 'Public',
      caution: 'Prudent',
      sensitive: 'Sensible',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تدبير التراث السياحي',
    intro: 'فضاء داخلي لجرد التراث والتحقق منه ونشر العناصر المناسبة فقط.',
    newItem: 'عنصر تراثي جديد',
    editItem: 'تعديل العنصر',
    titleLabel: 'العنوان',
    categoryLabel: 'الصنف',
    descriptionLabel: 'وصف قصير',
    valueLabel: 'القيمة التراثية',
    tourismInterestLabel: 'الأهمية السياحية',
    accessDifficultyLabel: 'صعوبة الوصول',
    economicPotentialLabel: 'الإمكانية الاقتصادية',
    priorityLabel: 'الأولوية',
    sensitivityLabel: 'الحساسية',
    accessNotesLabel: 'ملاحظات الوصول',
    internalNotesLabel: 'ملاحظة داخلية',
    verifiedAtLabel: 'تاريخ التحقق',
    verifiedByLabel: 'تم التحقق من طرف',
    statusLabel: 'الحالة',
    publishedLabel: 'منشور في /patrimoine',
    photoPlannedLabel: 'الصورة ستضاف لاحقا',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    empty: 'لا يوجد أي عنصر تراثي مسجل.',
    required: 'العنوان والوصف والقيمة التراثية ضرورية.',
    sensitivePublishError: 'لا يمكن نشر عنصر حساس للعموم.',
    internalNotice: 'لا تضف صورا حساسة أو أسماء خاصة أو GPS حقيقي أو أرقام مرشدين. العناصر الحساسة تبقى داخلية.',
    photoFuture: 'الصورة قيد الجمع في الدوار',
    filtersTitle: 'تصفية',
    all: 'الكل',
    statsTitle: 'تتبع التراث',
    total: 'المجموع',
    published: 'منشور',
    toVerify: 'للتحقق',
    sensitive: 'حساس',
    highPriority: 'أولوية عالية',
    categories: {
      agricultural_landscapes: 'مناظر فلاحية',
      viewpoints: 'نقط مشاهدة',
      walking_trails: 'مسارات',
      architecture: 'عمارة تقليدية',
      mosquee: 'مسجد / مكان ديني',
      quranic_school: 'التعليم القرآني',
      oral_history: 'الذاكرة الشفوية',
      collective_places: 'أماكن جماعية',
      water_points: 'ماء / عين / بئر',
      cave_shelter: 'مغارة / ملجأ طبيعي',
      rock_engraving: 'نقش / أثر قديم',
      mineral_landscape: 'منظر صخري',
      local_products: 'منتجات محلية',
      crafts: 'صناعة تقليدية',
      local_meal: 'تجربة طعام',
      homestay_potential: 'إيواء محتمل',
      local_guide: 'مرشد محلي',
      photo_gallery: 'معرض صور',
      tourism_map: 'خريطة سياحية',
      activity: 'نشاط ممكن',
      water_source: 'العين / الماء',
      agriculture: 'الفلاحة',
      landscape: 'المنظر الطبيعي',
      memory: 'الذاكرة',
      traditions: 'التقاليد',
    },
    statuses: {
      published: 'منشور',
      validated_internal: 'مصادق عليه داخليا',
      to_verify: 'بحاجة إلى تحقق',
    },
    accessDifficulties: {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      to_verify: 'للتحقق',
    },
    economicPotentials: {
      low: 'ضعيف',
      medium: 'متوسط',
      high: 'مرتفع',
      to_verify: 'للتحقق',
    },
    priorities: {
      high: 'عالية',
      medium: 'متوسطة',
      to_verify: 'للتحقق',
    },
    sensitivities: {
      public: 'عمومي',
      caution: 'بحذر',
      sensitive: 'حساس',
    },
  },
};

const emptyForm = {
  title: '',
  category: 'agricultural_landscapes' as HeritageCategory,
  description: '',
  heritageValue: '',
  tourismInterest: '',
  accessDifficulty: 'to_verify' as HeritageAccessDifficulty,
  economicPotential: 'to_verify' as HeritageEconomicPotential,
  priority: 'to_verify' as HeritagePriority,
  sensitivity: 'caution' as HeritageSensitivity,
  accessNotes: '',
  internalNotes: '',
  verifiedAt: '',
  verifiedBy: '',
  status: 'to_verify' as HeritageStatus,
  published: false,
  photoPlanned: true,
};

function HeritageStats({ items, t }: { items: HeritageItem[]; t: Copy }) {
  const stats = [
    { label: t.total, value: items.length },
    { label: t.published, value: items.filter((item) => item.published && item.status === 'published').length },
    { label: t.toVerify, value: items.filter((item) => item.status === 'to_verify').length },
    { label: t.sensitive, value: items.filter((item) => item.sensitivity === 'sensitive').length },
    { label: t.highPriority, value: items.filter((item) => item.priority === 'high').length },
  ];

  return (
    <section className="heritage-stats" aria-label={t.statsTitle}>
      <div className="heritage-section-title"><BarChart3 size={18} /><h2>{t.statsTitle}</h2></div>
      <div className="heritage-stats-grid">
        {stats.map((stat) => (
          <div className="heritage-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeritageFilters({
  t,
  categoryFilter,
  statusFilter,
  sensitivityFilter,
  onCategoryChange,
  onStatusChange,
  onSensitivityChange,
}: {
  t: Copy;
  categoryFilter: FilterValue<HeritageCategory>;
  statusFilter: FilterValue<HeritageStatus>;
  sensitivityFilter: FilterValue<HeritageSensitivity>;
  onCategoryChange: (value: FilterValue<HeritageCategory>) => void;
  onStatusChange: (value: FilterValue<HeritageStatus>) => void;
  onSensitivityChange: (value: FilterValue<HeritageSensitivity>) => void;
}) {
  return (
    <section className="heritage-filters" aria-label={t.filtersTitle}>
      <div className="heritage-section-title"><Filter size={18} /><h2>{t.filtersTitle}</h2></div>
      <div className="heritage-form-grid">
        <label className="field">
          <span>{t.categoryLabel}</span>
          <select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value as FilterValue<HeritageCategory>)}>
            <option value="all">{t.all}</option>
            {categoryOrder.map((value) => <option value={value} key={value}>{t.categories[value]}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{t.statusLabel}</span>
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value as FilterValue<HeritageStatus>)}>
            <option value="all">{t.all}</option>
            {Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{t.sensitivityLabel}</span>
          <select value={sensitivityFilter} onChange={(event) => onSensitivityChange(event.target.value as FilterValue<HeritageSensitivity>)}>
            <option value="all">{t.all}</option>
            {Object.entries(t.sensitivities).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}

export default function BureauPatrimoinePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [items, setItems] = useState<HeritageItem[]>(readHeritageItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterValue<HeritageCategory>>('all');
  const [statusFilter, setStatusFilter] = useState<FilterValue<HeritageStatus>>('all');
  const [sensitivityFilter, setSensitivityFilter] = useState<FilterValue<HeritageSensitivity>>('all');

  const filtered = useMemo(() => items
    .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
    .filter((item) => statusFilter === 'all' || item.status === statusFilter)
    .filter((item) => sensitivityFilter === 'all' || item.sensitivity === sensitivityFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [items, categoryFilter, statusFilter, sensitivityFilter]);

  const persist = (nextItems: HeritageItem[]) => {
    setItems(nextItems);
    saveHeritageItems(nextItems);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.heritageValue.trim()) {
      setError(t.required);
      return;
    }
    if (form.sensitivity === 'sensitive' && (form.published || form.status === 'published')) {
      setError(t.sensitivePublishError);
      return;
    }
    const now = new Date().toISOString();
    const nextForm = {
      ...form,
      published: form.status === 'published' && form.sensitivity !== 'sensitive' ? form.published : false,
    };
    if (editingId) {
      persist(items.map((item) => item.id === editingId ? { ...item, ...nextForm, updatedAt: now } : item));
    } else {
      persist([{ id: `PAT-${Date.now()}`, ...nextForm, createdAt: now, updatedAt: now }, ...items]);
    }
    reset();
  };

  const edit = (item: HeritageItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      heritageValue: item.heritageValue,
      tourismInterest: item.tourismInterest,
      accessDifficulty: item.accessDifficulty,
      economicPotential: item.economicPotential,
      priority: item.priority,
      sensitivity: item.sensitivity,
      accessNotes: item.accessNotes,
      internalNotes: item.internalNotes,
      verifiedAt: item.verifiedAt,
      verifiedBy: item.verifiedBy,
      status: item.status,
      published: item.published,
      photoPlanned: item.photoPlanned,
    });
    setError('');
  };

  const remove = (id: string) => {
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) reset();
  };

  return (
    <section className="panel bureau-heritage-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Landmark size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-patrimoine" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.internalNotice}</p>

      <HeritageStats items={items} t={t} />

      <form className="heritage-form" onSubmit={submit}>
        <h2>{editingId ? t.editItem : t.newItem}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <div className="heritage-form-grid">
          <label className="field"><span>{t.categoryLabel}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as HeritageCategory })}>{categoryOrder.map((value) => <option value={value} key={value}>{t.categories[value]}</option>)}</select></label>
          <label className="field"><span>{t.statusLabel}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as HeritageStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <label className="field"><span>{t.descriptionLabel}</span><textarea value={form.description} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label className="field"><span>{t.valueLabel}</span><textarea value={form.heritageValue} rows={3} onChange={(event) => setForm({ ...form, heritageValue: event.target.value })} /></label>
        <label className="field"><span>{t.tourismInterestLabel}</span><textarea value={form.tourismInterest} rows={3} onChange={(event) => setForm({ ...form, tourismInterest: event.target.value })} /></label>
        <div className="heritage-form-grid">
          <label className="field"><span>{t.accessDifficultyLabel}</span><select value={form.accessDifficulty} onChange={(event) => setForm({ ...form, accessDifficulty: event.target.value as HeritageAccessDifficulty })}>{Object.entries(t.accessDifficulties).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.economicPotentialLabel}</span><select value={form.economicPotential} onChange={(event) => setForm({ ...form, economicPotential: event.target.value as HeritageEconomicPotential })}>{Object.entries(t.economicPotentials).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.priorityLabel}</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as HeritagePriority })}>{Object.entries(t.priorities).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.sensitivityLabel}</span><select value={form.sensitivity} onChange={(event) => setForm({ ...form, sensitivity: event.target.value as HeritageSensitivity })}>{Object.entries(t.sensitivities).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <label className="field"><span>{t.accessNotesLabel}</span><textarea value={form.accessNotes} rows={2} onChange={(event) => setForm({ ...form, accessNotes: event.target.value })} /></label>
        <label className="field"><span>{t.internalNotesLabel}</span><textarea value={form.internalNotes} rows={2} onChange={(event) => setForm({ ...form, internalNotes: event.target.value })} /></label>
        <div className="heritage-form-grid">
          <label className="field"><span>{t.verifiedAtLabel}</span><input type="date" value={form.verifiedAt} onChange={(event) => setForm({ ...form, verifiedAt: event.target.value })} /></label>
          <label className="field"><span>{t.verifiedByLabel}</span><input value={form.verifiedBy} onChange={(event) => setForm({ ...form, verifiedBy: event.target.value })} /></label>
        </div>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.publishedLabel}</span></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.photoPlanned} onChange={(event) => setForm({ ...form, photoPlanned: event.target.checked })} /><span>{t.photoPlannedLabel}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
        </div>
      </form>

      <HeritageFilters
        t={t}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        sensitivityFilter={sensitivityFilter}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onSensitivityChange={setSensitivityFilter}
      />

      <div className="heritage-grid">
        {filtered.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filtered.map((item) => (
          <article className={`heritage-card ${item.status} ${item.sensitivity}`} key={item.id}>
            <HeritagePhoto alt={item.title} imagePath={item.imagePath} label={t.photoFuture} />
            <div className="heritage-body">
              <div className="heritage-topline"><span>{t.categories[item.category]}</span><strong>{t.statuses[item.status]}</strong></div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="heritage-badges">
                <span>{t.accessDifficulties[item.accessDifficulty]}</span>
                <span>{t.priorities[item.priority]}</span>
                <span>{t.sensitivities[item.sensitivity]}</span>
              </div>
              <div className="heritage-value"><strong>{t.valueLabel}</strong><span>{item.heritageValue}</span></div>
              {item.tourismInterest ? <div className="heritage-value"><strong>{t.tourismInterestLabel}</strong><span>{item.tourismInterest}</span></div> : null}
              {item.accessNotes ? <div className="heritage-value"><strong>{t.accessNotesLabel}</strong><span>{item.accessNotes}</span></div> : null}
              {item.internalNotes ? <div className="heritage-value internal"><strong>{t.internalNotesLabel}</strong><span>{item.internalNotes}</span></div> : null}
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
