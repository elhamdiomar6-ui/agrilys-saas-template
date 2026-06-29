import { ArrowLeft, CheckCircle2, Clock3, Download, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readActionPlanItems, saveActionPlanItems } from '../data/internalOperations';
import type { ActionPlanItem, ActionPlanPriority, ActionPlanStatus } from '../types/internalOperations';

type Lang = 'fr' | 'ar';

type Option<T extends string> = {
  value: T;
  label: Record<Lang, string>;
};

const statusOptions: Option<ActionPlanStatus>[] = [
  { value: 'todo', label: { fr: 'A faire', ar: 'للإنجاز' } },
  { value: 'in_progress', label: { fr: 'En cours', ar: 'قيد الإنجاز' } },
  { value: 'complete', label: { fr: 'Termine', ar: 'منجز' } },
];

const priorityOptions: Option<ActionPlanPriority>[] = [
  { value: 'normal', label: { fr: 'Normal', ar: 'عادي' } },
  { value: 'high', label: { fr: 'Haute', ar: 'مرتفعة' } },
  { value: 'urgent', label: { fr: 'Urgente', ar: 'مستعجلة' } },
];

const copy = {
  fr: {
    back: 'Retour',
    title: 'Plan action association',
    intro: 'Suivi interne ANATDC / AGADIRNETGUIDA : urgences, financements, patrimoine, cooperative, tourisme et plateforme.',
    warning: 'Module interne Bureau / President. Les actions restent locales sur cet appareil tant que la synchronisation partagee n est pas activee.',
    total: 'Total actions',
    urgent: 'Urgentes',
    progress: 'En cours',
    done: 'Terminees',
    late: 'En retard',
    weekTitle: 'Urgences de la semaine',
    weekEmpty: 'Aucune urgence dans les 7 prochains jours.',
    search: 'Rechercher',
    allStatus: 'Tous les statuts',
    allPriority: 'Toutes les priorites',
    allResponsible: 'Tous les responsables',
    add: 'Ajouter une action',
    edit: 'Modifier action',
    save: 'Enregistrer',
    cancel: 'Annuler',
    remove: 'Supprimer',
    markProgress: 'Marquer en cours',
    markDone: 'Marquer termine',
    exportCsv: 'Exporter CSV',
    exportJson: 'Exporter JSON',
    empty: 'Aucune action trouvee.',
    required: 'Action, statut, priorite, date cible, responsable, tags et description sont obligatoires.',
    deleteConfirm: 'Supprimer cette action seulement sur cet appareil ?',
    action: 'Action',
    status: 'Statut',
    priority: 'Priorite',
    dueDate: 'Date cible',
    responsible: 'Responsable',
    tags: 'Tags',
    description: 'Description',
    notes: 'Notes de suivi',
  },
  ar: {
    back: 'رجوع',
    title: 'خطة عمل الجمعية',
    intro: 'تتبع داخلي لأعمال الجمعية: المستعجلات، الدعم، التراث، التعاونية، السياحة والمنصة.',
    warning: 'وحدة داخلية للمكتب والرئيس. تبقى الإجراءات محلية على هذا الجهاز إلى حين تفعيل المزامنة المشتركة.',
    total: 'مجموع الإجراءات',
    urgent: 'مستعجلة',
    progress: 'قيد الإنجاز',
    done: 'منجزة',
    late: 'متأخرة',
    weekTitle: 'مستعجلات الأسبوع',
    weekEmpty: 'لا توجد مستعجلات خلال 7 أيام المقبلة.',
    search: 'بحث',
    allStatus: 'كل الحالات',
    allPriority: 'كل الأولويات',
    allResponsible: 'كل المسؤولين',
    add: 'إضافة إجراء',
    edit: 'تعديل الإجراء',
    save: 'حفظ',
    cancel: 'إلغاء',
    remove: 'حذف',
    markProgress: 'وضع قيد الإنجاز',
    markDone: 'وضع منجز',
    exportCsv: 'تصدير CSV',
    exportJson: 'تصدير JSON',
    empty: 'لا يوجد إجراء مطابق.',
    required: 'الإجراء والحالة والأولوية والتاريخ والمسؤول والوسوم والوصف ضرورية.',
    deleteConfirm: 'حذف هذا الإجراء من هذا الجهاز فقط؟',
    action: 'الإجراء',
    status: 'الحالة',
    priority: 'الأولوية',
    dueDate: 'التاريخ المستهدف',
    responsible: 'المسؤول',
    tags: 'الوسوم',
    description: 'الوصف',
    notes: 'ملاحظات التتبع',
  },
};

const emptyAction: Omit<ActionPlanItem, 'id' | 'updatedAt'> = {
  title: '',
  status: 'todo',
  priority: 'normal',
  dueDate: new Date().toISOString().slice(0, 10),
  description: '',
  responsible: '',
  tags: 'gouvernance',
  notes: '',
};

function labelFor<T extends string>(options: Option<T>[], value: T, lang: Lang) {
  return options.find((option) => option.value === value)?.label[lang] || value;
}

function csvEscape(value: string) {
  return `"${String(value || '').replaceAll('"', '""')}"`;
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

function isLate(item: ActionPlanItem) {
  if (item.status === 'complete') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(item.dueDate) < today;
}

function isDueThisWeek(item: ActionPlanItem) {
  if (item.status === 'complete') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 7);
  const due = new Date(item.dueDate);
  return due >= today && due <= limit;
}

function formatDate(value: string, lang: Lang) {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function BureauPlanActionPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const formRef = useRef<HTMLFormElement | null>(null);
  const [items, setItems] = useState<ActionPlanItem[]>(readActionPlanItems);
  const [form, setForm] = useState<Omit<ActionPlanItem, 'id' | 'updatedAt'>>(emptyAction);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ActionPlanStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ActionPlanPriority>('all');
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [error, setError] = useState('');

  const responsibleOptions = useMemo(() => {
    const names = new Set(items.map((item) => item.responsible.trim()).filter(Boolean));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const stats = useMemo(() => ({
    total: items.length,
    urgent: items.filter((item) => item.priority === 'urgent' && item.status !== 'complete').length,
    progress: items.filter((item) => item.status === 'in_progress').length,
    done: items.filter((item) => item.status === 'complete').length,
    late: items.filter(isLate).length,
  }), [items]);

  const weekItems = useMemo(() => items
    .filter((item) => item.priority === 'urgent' || isDueThisWeek(item) || isLate(item))
    .filter((item) => item.status !== 'complete')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6), [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...items]
      .filter((item) => statusFilter === 'all' || item.status === statusFilter)
      .filter((item) => priorityFilter === 'all' || item.priority === priorityFilter)
      .filter((item) => responsibleFilter === 'all' || item.responsible === responsibleFilter)
      .filter((item) => {
        if (!normalizedQuery) return true;
        return [item.title, item.description, item.responsible, item.tags, item.notes].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [items, priorityFilter, query, responsibleFilter, statusFilter]);

  const persist = (nextItems: ActionPlanItem[]) => {
    setItems(nextItems);
    saveActionPlanItems(nextItems);
  };

  const resetForm = () => {
    setForm(emptyAction);
    setEditingId(null);
    setError('');
  };

  const scrollToForm = () => {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus(), 120);
    }, 120);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.status || !form.priority || !form.dueDate || !form.responsible.trim() || !form.tags.trim() || !form.description.trim()) {
      setError(t.required);
      return;
    }

    const now = new Date().toISOString();
    if (editingId) {
      persist(items.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } : item));
    } else {
      persist([{ id: `ACTION-${Date.now()}`, ...form, updatedAt: now }, ...items]);
    }
    resetForm();
  };

  const editItem = (item: ActionPlanItem) => {
    const { id: _id, updatedAt: _updatedAt, ...editable } = item;
    setForm(editable);
    setEditingId(item.id);
    setError('');
    scrollToForm();
  };

  const updateStatus = (id: string, status: ActionPlanStatus) => {
    persist(items.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
  };

  const removeItem = (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  const exportJson = () => downloadText('agadirnetguida-plan-action-association.json', JSON.stringify(items, null, 2), 'application/json;charset=utf-8');

  const exportCsv = () => {
    const header = ['title', 'status', 'priority', 'dueDate', 'responsible', 'tags', 'description', 'notes'];
    const rows = items.map((item) => header.map((key) => csvEscape(String(item[key as keyof ActionPlanItem] || ''))).join(','));
    downloadText('agadirnetguida-plan-action-association.csv', [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <section className="panel internal-workspace-page action-plan-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-plan-action" />
      <p className="privacy-note internal-warning"><ShieldCheck size={18} /> {t.warning}</p>

      <div className="stats-grid action-plan-stats">
        <article className="stat-card"><span>{t.total}</span><strong>{stats.total}</strong></article>
        <article className="stat-card"><span>{t.urgent}</span><strong>{stats.urgent}</strong></article>
        <article className="stat-card"><span>{t.progress}</span><strong>{stats.progress}</strong></article>
        <article className="stat-card"><span>{t.done}</span><strong>{stats.done}</strong></article>
        <article className="stat-card"><span>{t.late}</span><strong>{stats.late}</strong></article>
      </div>

      <section className="action-plan-week">
        <div className="access-group-heading">
          <h2><Clock3 size={20} /> {t.weekTitle}</h2>
        </div>
        {weekItems.length === 0 ? <p className="empty-state">{t.weekEmpty}</p> : null}
        <div className="action-plan-week-list">
          {weekItems.map((item) => (
            <button type="button" key={item.id} onClick={() => editItem(item)}>
              <strong>{item.title}</strong>
              <span>{formatDate(item.dueDate, lang)} - {item.responsible}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="internal-toolbar">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="field"><span>{t.status}</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ActionPlanStatus)}><option value="all">{t.allStatus}</option>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
        <label className="field"><span>{t.priority}</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | ActionPlanPriority)}><option value="all">{t.allPriority}</option>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
        <label className="field"><span>{t.responsible}</span><select value={responsibleFilter} onChange={(event) => setResponsibleFilter(event.target.value)}><option value="all">{t.allResponsible}</option>{responsibleOptions.map((responsible) => <option key={responsible} value={responsible}>{responsible}</option>)}</select></label>
      </div>

      <form className="internal-form action-plan-form" ref={formRef} onSubmit={submit}>
        <h2>{editingId ? t.edit : t.add}</h2>
        <div className="internal-form-grid">
          <label className="field"><span>{t.action}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ActionPlanStatus })}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
          <label className="field"><span>{t.priority}</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ActionPlanPriority })}>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label[lang]}</option>)}</select></label>
          <label className="field"><span>{t.dueDate}</span><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
          <label className="field"><span>{t.responsible}</span><input value={form.responsible} onChange={(event) => setForm({ ...form, responsible: event.target.value })} /></label>
          <label className="field"><span>{t.tags}</span><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></label>
          <label className="field wide-field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="field wide-field"><span>{t.notes}</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="internal-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={resetForm}>{t.cancel}</button> : null}
          <button type="button" className="secondary-inline" onClick={exportCsv}><Download size={18} /> {t.exportCsv}</button>
          <button type="button" className="secondary-inline" onClick={exportJson}><Download size={18} /> {t.exportJson}</button>
        </div>
      </form>

      <div className="internal-list">
        {filteredItems.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filteredItems.map((item) => (
          <article className={`internal-card action-plan-card ${isLate(item) ? 'is-late' : ''}`} key={item.id}>
            <div className="internal-topline">
              <span>{item.tags} - {formatDate(item.dueDate, lang)}</span>
              <strong>{labelFor(priorityOptions, item.priority, lang)}</strong>
            </div>
            <h2>{item.title}</h2>
            <div className="internal-meta-grid">
              <div><span>{t.status}</span><strong>{labelFor(statusOptions, item.status, lang)}</strong></div>
              <div><span>{t.responsible}</span><strong>{item.responsible}</strong></div>
              <div><span>{t.description}</span><strong>{item.description}</strong></div>
              <div><span>{t.notes}</span><strong>{item.notes || '-'}</strong></div>
            </div>
            <div className="bureau-actions internal-card-actions">
              <button type="button" className="edit-action" data-edit-action="true" onClick={(event) => { event.preventDefault(); event.stopPropagation(); editItem(item); }}><Pencil size={18} /> {t.edit}</button>
              {item.status !== 'in_progress' ? <button type="button" className="secondary-inline" onClick={() => updateStatus(item.id, 'in_progress')}><Clock3 size={18} /> {t.markProgress}</button> : null}
              {item.status !== 'complete' ? <button type="button" className="secondary-inline" onClick={() => updateStatus(item.id, 'complete')}><CheckCircle2 size={18} /> {t.markDone}</button> : null}
              <button type="button" className="danger-action" onClick={(event) => { event.preventDefault(); event.stopPropagation(); removeItem(item.id); }}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
