import { ArrowLeft, CheckCircle2, Download, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import AudioHelp from '../components/AudioHelp';

type Lang = 'fr' | 'ar';

type WorkspaceRecord = {
  id: string;
  updatedAt: string;
  [key: string]: string;
};

export type WorkspaceOption = {
  value: string;
  label: Record<Lang, string>;
};

export type WorkspaceField = {
  key: string;
  label: Record<Lang, string>;
  type?: 'text' | 'date' | 'textarea' | 'select';
  options?: WorkspaceOption[];
  rows?: number;
  required?: boolean;
};

export type WorkspaceFilter = {
  key: string;
  label: Record<Lang, string>;
  allLabel: Record<Lang, string>;
  options: WorkspaceOption[];
};

type Props<T extends WorkspaceRecord> = {
  lang: Lang;
  onBack: () => void;
  title: Record<Lang, string>;
  intro: Record<Lang, string>;
  newLabel: Record<Lang, string>;
  editLabel: Record<Lang, string>;
  emptyLabel: Record<Lang, string>;
  requiredMessage: Record<Lang, string>;
  confirmDelete: Record<Lang, string>;
  filenameBase: string;
  idPrefix: string;
  fields: WorkspaceField[];
  filters: WorkspaceFilter[];
  primaryKey: keyof T & string;
  subtitleKeys: Array<keyof T & string>;
  metaKeys: Array<keyof T & string>;
  searchableKeys: Array<keyof T & string>;
  initialForm: Omit<T, 'id' | 'updatedAt'>;
  readItems: () => T[];
  saveItems: (items: T[]) => void;
  scriptId?: Parameters<typeof AudioHelp>[0]['scriptId'];
};

const common = {
  fr: {
    back: 'Retour',
    warning: "Espace interne provisoire. Ne pas saisir de données sensibles tant que l'authentification et le stockage sécurisé ne sont pas activés.",
    savedLocally: 'Sauvegarde temporaire locale : données de travail non sensibles uniquement.',
    search: 'Rechercher',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    exportJson: 'Exporter JSON',
    exportCsv: 'Exporter CSV',
  },
  ar: {
    back: 'رجوع',
    warning: 'فضاء داخلي مؤقت. لا تدخل معطيات حساسة قبل تفعيل المصادقة والتخزين الآمن.',
    savedLocally: 'حفظ محلي مؤقت: معطيات عمل غير حساسة فقط.',
    search: 'بحث',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    exportJson: 'تصدير JSON',
    exportCsv: 'تصدير CSV',
  },
};

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

function optionLabel(field: WorkspaceField | WorkspaceFilter | undefined, value: string, lang: Lang) {
  const option = field?.options?.find((item) => item.value === value);
  return option ? option.label[lang] : value;
}

function formatValue(field: WorkspaceField | undefined, value: string, lang: Lang) {
  if (!value) return '-';
  if (field?.type === 'date') {
    try {
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
    } catch {
      return value;
    }
  }
  return optionLabel(field, value, lang);
}

export default function InternalOperationsWorkspace<T extends WorkspaceRecord>(props: Props<T>) {
  const t = common[props.lang];
  const formRef = useRef<HTMLFormElement | null>(null);
  const [items, setItems] = useState<T[]>(props.readItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(props.initialForm as Record<string, string>);
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => Object.fromEntries(props.filters.map((filter) => [filter.key, 'all'])));
  const [error, setError] = useState('');

  const fieldByKey = useMemo(() => Object.fromEntries(props.fields.map((field) => [field.key, field])) as Record<string, WorkspaceField>, [props.fields]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...items]
      .filter((item) => props.filters.every((filter) => filterValues[filter.key] === 'all' || item[filter.key] === filterValues[filter.key]))
      .filter((item) => {
        if (!normalizedQuery) return true;
        return props.searchableKeys.some((key) => String(item[key] || '').toLowerCase().includes(normalizedQuery));
      });
  }, [filterValues, items, props.filters, props.searchableKeys, query]);

  const persist = (nextItems: T[]) => {
    setItems(nextItems);
    props.saveItems(nextItems);
  };

  const reset = () => {
    setEditingId(null);
    setForm(props.initialForm as Record<string, string>);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = props.fields.some((field) => field.required && !String(form[field.key] || '').trim());
    if (missing) {
      setError(props.requiredMessage[props.lang]);
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      persist(items.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } as T : item));
    } else {
      persist([{ id: `${props.idPrefix}-${Date.now()}`, ...form, updatedAt: now } as T, ...items]);
    }
    reset();
  };

  const edit = (item: T) => {
    const nextForm = { ...props.initialForm } as Record<string, string>;
    props.fields.forEach((field) => { nextForm[field.key] = String(item[field.key] || ''); });
    setEditingId(item.id);
    setForm(nextForm);
    setError('');
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        const firstField = formRef.current?.querySelector<HTMLElement>('input, textarea, select');
        firstField?.focus();
      }, 120);
    }, 120);
  };

  const remove = (id: string) => {
    if (!window.confirm(props.confirmDelete[props.lang])) return;
    persist(items.filter((item) => item.id !== id));
    if (editingId === id) reset();
  };

  const exportJson = () => downloadText(`${props.filenameBase}.json`, JSON.stringify(items, null, 2), 'application/json;charset=utf-8');

  const exportCsv = () => {
    const header = props.fields.map((field) => field.key);
    const rows = items.map((item) => props.fields.map((field) => csvEscape(optionLabel(field, String(item[field.key] || ''), props.lang))).join(','));
    downloadText(`${props.filenameBase}.csv`, [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <section className="panel internal-workspace-page">
      <button className="back-button" onClick={props.onBack}><ArrowLeft size={18} /> {t.back}</button>
      <h1>{props.title[props.lang]}</h1>
      <p className="intro">{props.intro[props.lang]}</p>
      {props.scriptId ? <AudioHelp scriptId={props.scriptId} /> : null}
      <p className="privacy-note internal-warning"><ShieldCheck size={18} /> {t.warning}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.savedLocally}</p>

      <div className="internal-toolbar">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        {props.filters.map((filter) => (
          <label className="field" key={filter.key}><span>{filter.label[props.lang]}</span><select value={filterValues[filter.key]} onChange={(event) => setFilterValues({ ...filterValues, [filter.key]: event.target.value })}><option value="all">{filter.allLabel[props.lang]}</option>{filter.options.map((option) => <option value={option.value} key={option.value}>{option.label[props.lang]}</option>)}</select></label>
        ))}
      </div>

      <form className="internal-form" ref={formRef} onSubmit={submit}>
        <h2>{editingId ? props.editLabel[props.lang] : props.newLabel[props.lang]}</h2>
        <div className="internal-form-grid">
          {props.fields.map((field) => (
            <label className={`field ${field.type === 'textarea' ? 'wide-field' : ''}`} key={field.key}>
              <span>{field.label[props.lang]}</span>
              {field.type === 'textarea' ? <textarea rows={field.rows || 3} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} /> : null}
              {field.type === 'select' ? <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label[props.lang]}</option>)}</select> : null}
              {field.type === 'date' ? <input type="date" value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} /> : null}
              {(!field.type || field.type === 'text') ? <input value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} /> : null}
            </label>
          ))}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="internal-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
          <button type="button" className="secondary-inline" onClick={exportJson}><Download size={18} /> {t.exportJson}</button>
          <button type="button" className="secondary-inline" onClick={exportCsv}><Download size={18} /> {t.exportCsv}</button>
        </div>
      </form>

      <div className="internal-list">
        {filtered.length === 0 ? <p className="empty-state">{props.emptyLabel[props.lang]}</p> : null}
        {filtered.map((item) => (
          <article className="internal-card" key={item.id}>
            <div className="internal-topline">
              <span>{props.subtitleKeys.map((key) => formatValue(fieldByKey[key], item[key], props.lang)).filter(Boolean).join(' - ')}</span>
              <strong>{props.metaKeys.slice(0, 1).map((key) => formatValue(fieldByKey[key], item[key], props.lang)).join('')}</strong>
            </div>
            <h2>{item[props.primaryKey]}</h2>
            <div className="internal-meta-grid">
              {props.metaKeys.map((key) => (
                <div key={key}><span>{fieldByKey[key]?.label[props.lang] || key}</span><strong>{formatValue(fieldByKey[key], item[key], props.lang)}</strong></div>
              ))}
            </div>
            <div className="bureau-actions internal-card-actions">
              <button type="button" className="edit-action" data-edit-action="true" onClick={(event) => { event.preventDefault(); event.stopPropagation(); edit(item); }}><Pencil size={18} /> {t.edit}</button>
              <button type="button" className="danger-action" onClick={(event) => { event.preventDefault(); event.stopPropagation(); remove(item.id); }}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
