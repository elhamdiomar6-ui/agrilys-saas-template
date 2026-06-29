import { ArrowLeft, CheckCircle2, FileUp, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readFieldCollectionItems, saveFieldCollectionItems } from '../data/internalOperations';
import type { FieldCollectionCategory, FieldCollectionItem, FieldCollectionPriority, FieldCollectionStatus } from '../types/internalOperations';

type Lang = 'fr' | 'ar';

type Option<T extends string> = {
  value: T;
  label: Record<Lang, string>;
};

const categories: Option<FieldCollectionCategory>[] = [
  { value: 'heritage_photos', label: { fr: 'Photos patrimoine', ar: 'صور التراث' } },
  { value: 'place_gps', label: { fr: 'GPS des lieux', ar: 'إحداثيات الأماكن' } },
  { value: 'elders_stories', label: { fr: 'Histoires des anciens', ar: 'حكايات الكبار' } },
  { value: 'oral_memory_audio', label: { fr: 'Audio / mémoire orale', ar: 'الصوت / الذاكرة الشفوية' } },
  { value: 'videos', label: { fr: 'Vidéos', ar: 'فيديوهات' } },
  { value: 'local_products', label: { fr: 'Produits locaux', ar: 'منتجات محلية' } },
  { value: 'local_guides', label: { fr: 'Guides locaux', ar: 'مرشدون محليون' } },
  { value: 'scanned_documents', label: { fr: 'Documents scannés', ar: 'وثائق ممسوحة' } },
  { value: 'tourism_circuit_ideas', label: { fr: 'Idées de circuit touristique', ar: 'أفكار مسار سياحي' } },
  { value: 'free_observations', label: { fr: 'Observations libres', ar: 'ملاحظات حرة' } },
];

const statuses: Option<FieldCollectionStatus>[] = [
  { value: 'to_collect', label: { fr: 'À collecter', ar: 'للجمع' } },
  { value: 'received', label: { fr: 'Reçu', ar: 'تم الاستلام' } },
  { value: 'to_verify', label: { fr: 'À vérifier', ar: 'للتحقق' } },
  { value: 'validated', label: { fr: 'Validé', ar: 'مصادق عليه' } },
  { value: 'integrated', label: { fr: 'Intégré', ar: 'مدمج' } },
];

const priorities: Option<FieldCollectionPriority>[] = [
  { value: 'low', label: { fr: 'Faible', ar: 'ضعيفة' } },
  { value: 'medium', label: { fr: 'Moyenne', ar: 'متوسطة' } },
  { value: 'high', label: { fr: 'Forte', ar: 'قوية' } },
  { value: 'urgent', label: { fr: 'Urgente', ar: 'مستعجلة' } },
];

const copy = {
  fr: {
    back: 'Retour',
    title: 'Collecte terrain / Boîte de dépôt patrimoine',
    intro: 'Espace interne pour noter les informations reçues ou à collecter avant intégration manuelle dans les modules. Rien n’est publié automatiquement.',
    warning: 'LocalStorage seulement : ne pas déposer de données sensibles ni de vrais fichiers terrain dans Git.',
    add: 'Ajouter une collecte',
    edit: 'Modifier une collecte',
    save: 'Enregistrer',
    cancel: 'Annuler',
    modify: 'Modifier',
    markValidated: 'Marquer comme validé',
    markIntegrated: 'Marquer comme intégré',
    remove: 'Supprimer seulement en local',
    search: 'Rechercher',
    allCategories: 'Toutes les catégories',
    allStatuses: 'Tous les statuts',
    required: 'Titre, catégorie, statut, date et priorité sont obligatoires.',
    deleteConfirm: 'Supprimer cette collecte seulement sur cet appareil ?',
    fileHelp: 'Le navigateur garde seulement le nom du fichier. Le fichier réel reste sur votre appareil.',
    empty: 'Aucune collecte trouvée.',
    total: 'Total collectes',
    toVerify: 'À vérifier',
    validated: 'Validées',
    integrated: 'Intégrées',
    titleField: 'Titre',
    category: 'Catégorie',
    linkedPlace: 'Lieu lié si connu',
    status: 'Statut',
    note: 'Note interne',
    date: 'Date',
    source: 'Source / personne',
    fileName: 'Fichier local optionnel',
    priority: 'Priorité',
  },
  ar: {
    back: 'رجوع',
    title: 'جمع معلومات الميدان / صندوق إيداع التراث',
    intro: 'فضاء داخلي لتسجيل المعلومات المستلمة أو التي يجب جمعها قبل إدماجها يدويا في الوحدات. لا يتم نشر أي شيء تلقائيا.',
    warning: 'LocalStorage فقط: لا تدخل معطيات حساسة ولا تضع ملفات ميدانية حقيقية في Git.',
    add: 'إضافة جمع',
    edit: 'تعديل جمع',
    save: 'حفظ',
    cancel: 'إلغاء',
    modify: 'تعديل',
    markValidated: 'وضع كمصادق عليه',
    markIntegrated: 'وضع كمدمج',
    remove: 'حذف محلي فقط',
    search: 'بحث',
    allCategories: 'كل الأصناف',
    allStatuses: 'كل الحالات',
    required: 'العنوان والصنف والحالة والتاريخ والأولوية ضرورية.',
    deleteConfirm: 'حذف هذه البطاقة من هذا الجهاز فقط؟',
    fileHelp: 'المتصفح يحفظ اسم الملف فقط. الملف الحقيقي يبقى في جهازك.',
    empty: 'لا توجد بطاقة مطابقة.',
    total: 'مجموع البطاقات',
    toVerify: 'للتحقق',
    validated: 'مصادق عليها',
    integrated: 'مدمجة',
    titleField: 'العنوان',
    category: 'الصنف',
    linkedPlace: 'المكان المرتبط إن وجد',
    status: 'الحالة',
    note: 'ملاحظة داخلية',
    date: 'التاريخ',
    source: 'المصدر / الشخص',
    fileName: 'ملف محلي اختياري',
    priority: 'الأولوية',
  },
};

const emptyForm: Omit<FieldCollectionItem, 'id' | 'updatedAt'> = {
  title: '',
  category: 'heritage_photos',
  linkedPlace: '',
  status: 'to_collect',
  note: '',
  date: new Date().toISOString().slice(0, 10),
  source: '',
  fileName: '',
  priority: 'medium',
};

function labelFor<T extends string>(options: Option<T>[], value: T, lang: Lang) {
  return options.find((option) => option.value === value)?.label[lang] || value;
}

export default function BureauCollecteTerrainPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [items, setItems] = useState<FieldCollectionItem[]>(readFieldCollectionItems);
  const [form, setForm] = useState<Omit<FieldCollectionItem, 'id' | 'updatedAt'>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FieldCollectionCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | FieldCollectionStatus>('all');
  const [error, setError] = useState('');

  const stats = useMemo(() => ({
    total: items.length,
    toVerify: items.filter((item) => item.status === 'to_verify').length,
    validated: items.filter((item) => item.status === 'validated').length,
    integrated: items.filter((item) => item.status === 'integrated').length,
  }), [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...items]
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => statusFilter === 'all' || item.status === statusFilter)
      .filter((item) => {
        if (!normalizedQuery) return true;
        return [item.title, item.linkedPlace, item.note, item.source, item.fileName].some((value) => value.toLowerCase().includes(normalizedQuery));
      });
  }, [categoryFilter, items, query, statusFilter]);

  const persist = (nextItems: FieldCollectionItem[]) => {
    setItems(nextItems);
    saveFieldCollectionItems(nextItems);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.category || !form.status || !form.date || !form.priority) {
      setError(t.required);
      return;
    }

    const now = new Date().toISOString();
    if (editingId) {
      persist(items.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } : item));
    } else {
      persist([{ id: `COLLECT-${Date.now()}`, ...form, updatedAt: now }, ...items]);
    }
    resetForm();
  };

  const editItem = (item: FieldCollectionItem) => {
    const { id: _id, updatedAt: _updatedAt, ...editable } = item;
    setForm(editable);
    setEditingId(item.id);
    setError('');
  };

  const updateStatus = (id: string, status: FieldCollectionStatus) => {
    persist(items.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
  };

  const removeItem = (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <section className="panel internal-workspace-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-collecte" />
      <p className="privacy-note internal-warning"><ShieldCheck size={18} /> {t.warning}</p>

      <div className="stats-grid">
        <article className="stat-card"><span>{t.total}</span><strong>{stats.total}</strong></article>
        <article className="stat-card"><span>{t.toVerify}</span><strong>{stats.toVerify}</strong></article>
        <article className="stat-card"><span>{t.validated}</span><strong>{stats.validated}</strong></article>
        <article className="stat-card"><span>{t.integrated}</span><strong>{stats.integrated}</strong></article>
      </div>

      <div className="internal-toolbar">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="field">
          <span>{t.category}</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | FieldCollectionCategory)}>
            <option value="all">{t.allCategories}</option>
            {categories.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{t.status}</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | FieldCollectionStatus)}>
            <option value="all">{t.allStatuses}</option>
            {statuses.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}
          </select>
        </label>
      </div>

      <form className="internal-form" onSubmit={submit}>
        <h2>{editingId ? t.edit : t.add}</h2>
        <div className="internal-form-grid">
          <label className="field"><span>{t.titleField}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as FieldCollectionCategory })}>{categories.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
          <label className="field"><span>{t.linkedPlace}</span><input value={form.linkedPlace} onChange={(event) => setForm({ ...form, linkedPlace: event.target.value })} /></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as FieldCollectionStatus })}>{statuses.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
          <label className="field"><span>{t.date}</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
          <label className="field"><span>{t.priority}</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as FieldCollectionPriority })}>{priorities.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
          <label className="field"><span>{t.source}</span><input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} /></label>
          <label className="field">
            <span><FileUp size={16} /> {t.fileName}</span>
            <input type="file" onChange={(event) => setForm({ ...form, fileName: event.target.files?.[0]?.name || form.fileName })} />
            <small>{form.fileName || t.fileHelp}</small>
          </label>
          <label className="field wide-field"><span>{t.note}</span><textarea rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="internal-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={resetForm}>{t.cancel}</button> : null}
        </div>
      </form>

      <div className="internal-list">
        {filteredItems.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filteredItems.map((item) => (
          <article className="internal-card" key={item.id}>
            <div className="internal-topline">
              <span>{labelFor(categories, item.category, lang)} - {labelFor(priorities, item.priority, lang)}</span>
              <strong>{labelFor(statuses, item.status, lang)}</strong>
            </div>
            <h2>{item.title}</h2>
            <div className="internal-meta-grid">
              <div><span>{t.linkedPlace}</span><strong>{item.linkedPlace || '-'}</strong></div>
              <div><span>{t.date}</span><strong>{item.date || '-'}</strong></div>
              <div><span>{t.source}</span><strong>{item.source || '-'}</strong></div>
              <div><span>{t.fileName}</span><strong>{item.fileName || '-'}</strong></div>
              <div><span>{t.note}</span><strong>{item.note || '-'}</strong></div>
            </div>
            <div className="bureau-actions">
              <button type="button" onClick={() => editItem(item)}><Pencil size={18} /> {t.modify}</button>
              <button type="button" className="secondary-inline" onClick={() => updateStatus(item.id, 'validated')}><CheckCircle2 size={18} /> {t.markValidated}</button>
              <button type="button" className="secondary-inline" onClick={() => updateStatus(item.id, 'integrated')}><CheckCircle2 size={18} /> {t.markIntegrated}</button>
              <button type="button" className="danger-action" onClick={() => removeItem(item.id)}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
