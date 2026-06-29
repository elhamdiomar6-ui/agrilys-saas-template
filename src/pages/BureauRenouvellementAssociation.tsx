import { siteConfig } from '../config/site';
import { ArrowLeft, CheckCircle2, Download, FileText, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readAssociationRenewalItems, saveAssociationRenewalItems } from '../data/associationRenewal';
import type { AssociationRenewalItem, RenewalCategory, RenewalPriority, RenewalStatus } from '../types/associationRenewal';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  warning: string;
  newItem: string;
  editItem: string;
  documentAction: string;
  category: string;
  status: string;
  priority: string;
  responsible: string;
  deadline: string;
  nextAction: string;
  physicalLocation: string;
  notes: string;
  search: string;
  allStatuses: string;
  allPriorities: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  exportJson: string;
  exportCsv: string;
  empty: string;
  required: string;
  confirmDelete: string;
  savedLocally: string;
  noUpload: string;
  categories: Record<RenewalCategory, string>;
  statuses: Record<RenewalStatus, string>;
  priorities: Record<RenewalPriority, string>;
};

const statusOrder: RenewalStatus[] = ['to_prepare', 'in_progress', 'ready', 'submitted', 'validated', 'blocked'];
const priorityOrder: RenewalPriority[] = ['low', 'medium', 'high', 'urgent'];
const categoryOrder: RenewalCategory[] = ['statutes', 'meeting', 'members', 'administration', 'letters', 'receipt', 'final_file'];

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Renouvellement association',
    intro: 'Espace interne mobile pour suivre les pièces, actions et échéances du renouvellement sans déposer de documents sensibles.',
    warning: "Espace de préparation interne. Ne pas déposer ici de documents sensibles tant que l'authentification et le stockage sécurisé ne sont pas activés.",
    newItem: 'Ajouter une ligne',
    editItem: 'Modifier la ligne',
    documentAction: 'Document / action',
    category: 'Catégorie',
    status: 'Statut',
    priority: 'Priorité',
    responsible: 'Responsable',
    deadline: 'Date limite',
    nextAction: 'Prochaine action',
    physicalLocation: 'Emplacement réel du document',
    notes: 'Notes non sensibles',
    search: 'Rechercher',
    allStatuses: 'Tous les statuts',
    allPriorities: 'Toutes les priorités',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    exportJson: 'Exporter JSON',
    exportCsv: 'Exporter CSV',
    empty: 'Aucune ligne trouvée.',
    required: 'Document/action, responsable, prochaine action et emplacement réel sont obligatoires.',
    confirmDelete: 'Supprimer cette ligne de préparation ? Aucun document réel ne sera supprimé.',
    savedLocally: 'Sauvegarde temporaire locale : uniquement des données non sensibles.',
    noUpload: 'Upload, scan, photo et vidéo restent désactivés jusqu’à Auth + Storage privé.',
    categories: {
      statutes: 'Statuts',
      meeting: 'Assemblée / PV',
      members: 'Membres bureau',
      administration: 'Administration',
      letters: 'Courriers',
      receipt: 'Reçu / récépissé',
      final_file: 'Dossier final',
    },
    statuses: {
      to_prepare: 'À préparer',
      in_progress: 'En cours',
      ready: 'Prêt',
      submitted: 'Déposé',
      validated: 'Validé',
      blocked: 'Bloqué',
    },
    priorities: {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Forte',
      urgent: 'Urgente',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تجديد الجمعية',
    intro: 'فضاء داخلي للهاتف لتتبع الوثائق والإجراءات والآجال الخاصة بتجديد الجمعية دون وضع وثائق حساسة.',
    warning: 'فضاء داخلي للتحضير فقط. لا تضع هنا وثائق حساسة قبل تفعيل المصادقة والتخزين الآمن.',
    newItem: 'إضافة سطر',
    editItem: 'تعديل السطر',
    documentAction: 'الوثيقة / الإجراء',
    category: 'الصنف',
    status: 'الحالة',
    priority: 'الأولوية',
    responsible: 'المسؤول',
    deadline: 'آخر أجل',
    nextAction: 'الإجراء المقبل',
    physicalLocation: 'مكان الوثيقة الحقيقي',
    notes: 'ملاحظات غير حساسة',
    search: 'بحث',
    allStatuses: 'كل الحالات',
    allPriorities: 'كل الأولويات',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    exportJson: 'تصدير JSON',
    exportCsv: 'تصدير CSV',
    empty: 'لا يوجد أي سطر مطابق.',
    required: 'الوثيقة أو الإجراء والمسؤول والإجراء المقبل ومكان الوثيقة ضرورية.',
    confirmDelete: 'هل تريد حذف هذا السطر التحضيري؟ لن يتم حذف أي وثيقة حقيقية.',
    savedLocally: 'حفظ محلي مؤقت: معطيات غير حساسة فقط.',
    noUpload: 'الرفع والمسح والصور والفيديو غير مفعلة إلى حين المصادقة والتخزين الخاص.',
    categories: {
      statutes: 'القانون الأساسي',
      meeting: 'الجمع العام / المحضر',
      members: 'أعضاء المكتب',
      administration: 'الإدارة',
      letters: 'المراسلات',
      receipt: 'وصل / récépissé',
      final_file: 'الملف النهائي',
    },
    statuses: {
      to_prepare: 'للتحضير',
      in_progress: 'قيد الإنجاز',
      ready: 'جاهز',
      submitted: 'مودع',
      validated: 'مصادق عليه',
      blocked: 'متعثر',
    },
    priorities: {
      low: 'ضعيفة',
      medium: 'متوسطة',
      high: 'قوية',
      urgent: 'مستعجلة',
    },
  },
};

function createEmptyForm(): Omit<AssociationRenewalItem, 'id' | 'updatedAt'> {
  return {
    title: '',
    category: 'administration',
    status: 'to_prepare',
    priority: 'medium',
    responsible: '',
    deadline: new Date().toISOString().slice(0, 10),
    nextAction: '',
    physicalLocation: '',
    notes: '',
  };
}

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function BureauRenouvellementAssociationPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [items, setItems] = useState<AssociationRenewalItem[]>(readAssociationRenewalItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyForm);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RenewalStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | RenewalPriority>('all');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...items]
      .filter((item) => statusFilter === 'all' || item.status === statusFilter)
      .filter((item) => priorityFilter === 'all' || item.priority === priorityFilter)
      .filter((item) => {
        if (!normalizedQuery) return true;
        return `${item.title} ${item.responsible} ${item.nextAction} ${item.physicalLocation}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => {
        const priorityDelta = priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [items, priorityFilter, query, statusFilter]);

  const persist = (nextItems: AssociationRenewalItem[]) => {
    setItems(nextItems);
    saveAssociationRenewalItems(nextItems);
  };

  const reset = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.responsible.trim() || !form.nextAction.trim() || !form.physicalLocation.trim()) {
      setError(t.required);
      return;
    }

    const now = new Date().toISOString();
    if (editingId) {
      persist(items.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } : item));
    } else {
      persist([{ id: `REN-${Date.now()}`, ...form, updatedAt: now }, ...items]);
    }
    reset();
  };

  const edit = (item: AssociationRenewalItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      status: item.status,
      priority: item.priority,
      responsible: item.responsible,
      deadline: item.deadline,
      nextAction: item.nextAction,
      physicalLocation: item.physicalLocation,
      notes: item.notes,
    });
    setError('');
  };

  const remove = (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) reset();
  };

  const exportJson = () => {
    downloadText(`${siteConfig.slug}-renouvellement-association.json`, JSON.stringify(items, null, 2), 'application/json;charset=utf-8');
  };

  const exportCsv = () => {
    const header = ['document_action', 'categorie', 'statut', 'priorite', 'responsable', 'date_limite', 'prochaine_action', 'emplacement_reel', 'notes'];
    const rows = items.map((item) => [
      item.title,
      t.categories[item.category],
      t.statuses[item.status],
      t.priorities[item.priority],
      item.responsible,
      item.deadline,
      item.nextAction,
      item.physicalLocation,
      item.notes,
    ].map(csvEscape).join(','));
    downloadText(`${siteConfig.slug}-renouvellement-association.csv`, [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <section className="panel renewal-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><ClipboardLikeIcon /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-renouvellement" />
      <p className="privacy-note renewal-warning"><ShieldCheck size={18} /> {t.warning}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.savedLocally}</p>
      <p className="privacy-note"><FileText size={18} /> {t.noUpload}</p>

      <div className="renewal-toolbar">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="field"><span>{t.status}</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | RenewalStatus)}><option value="all">{t.allStatuses}</option>{statusOrder.map((status) => <option value={status} key={status}>{t.statuses[status]}</option>)}</select></label>
        <label className="field"><span>{t.priority}</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | RenewalPriority)}><option value="all">{t.allPriorities}</option>{priorityOrder.map((priority) => <option value={priority} key={priority}>{t.priorities[priority]}</option>)}</select></label>
      </div>

      <form className="renewal-form" onSubmit={submit}>
        <h2>{editingId ? t.editItem : t.newItem}</h2>
        <label className="field"><span>{t.documentAction}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <div className="renewal-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as RenewalCategory })}>{categoryOrder.map((category) => <option value={category} key={category}>{t.categories[category]}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as RenewalStatus })}>{statusOrder.map((status) => <option value={status} key={status}>{t.statuses[status]}</option>)}</select></label>
          <label className="field"><span>{t.priority}</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as RenewalPriority })}>{priorityOrder.map((priority) => <option value={priority} key={priority}>{t.priorities[priority]}</option>)}</select></label>
          <label className="field"><span>{t.deadline}</span><input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.responsible}</span><input value={form.responsible} onChange={(event) => setForm({ ...form, responsible: event.target.value })} /></label>
        <label className="field"><span>{t.nextAction}</span><textarea rows={3} value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} /></label>
        <label className="field"><span>{t.physicalLocation}</span><input value={form.physicalLocation} onChange={(event) => setForm({ ...form, physicalLocation: event.target.value })} /></label>
        <label className="field"><span>{t.notes}</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="renewal-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
          <button type="button" className="secondary-inline" onClick={exportJson}><Download size={18} /> {t.exportJson}</button>
          <button type="button" className="secondary-inline" onClick={exportCsv}><Download size={18} /> {t.exportCsv}</button>
        </div>
      </form>

      <div className="renewal-list">
        {filtered.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filtered.map((item) => (
          <article className={`renewal-card ${item.status} ${item.priority}`} key={item.id}>
            <div className="renewal-topline">
              <span>{t.categories[item.category]} - {formatDate(item.deadline, lang)}</span>
              <strong>{t.statuses[item.status]}</strong>
            </div>
            <h2>{item.title}</h2>
            <div className="renewal-meta-grid">
              <div><span>{t.priority}</span><strong>{t.priorities[item.priority]}</strong></div>
              <div><span>{t.responsible}</span><strong>{item.responsible}</strong></div>
              <div><span>{t.nextAction}</span><strong>{item.nextAction}</strong></div>
              <div><span>{t.physicalLocation}</span><strong>{item.physicalLocation}</strong></div>
            </div>
            {item.notes ? <p className="renewal-note">{item.notes}</p> : null}
            <div className="bureau-actions">
              <button type="button" onClick={() => edit(item)}><Pencil size={18} /> {t.edit}</button>
              <button type="button" className="danger-action" onClick={() => remove(item.id)}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClipboardLikeIcon() {
  return <FileText size={28} />;
}
