import { ArrowLeft, CheckCircle2, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readPublicDocuments, savePublicDocuments } from '../data/publicDocuments';
import type { PublicDocument, PublicDocumentCategory, PublicDocumentStatus } from '../types/publicDocument';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newDocument: string;
  editDocument: string;
  titleLabel: string;
  dateLabel: string;
  categoryLabel: string;
  statusLabel: string;
  descriptionLabel: string;
  publishedLabel: string;
  save: string;
  cancel: string;
  edit: string;
  consult: string;
  remove: string;
  empty: string;
  required: string;
  internalNotice: string;
  categories: Record<PublicDocumentCategory, string>;
  status: Record<PublicDocumentStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Documents internes à valider',
    intro: 'Espace interne Bureau/Président pour conserver les documents officiels et décider séparément ce qui peut devenir public.',
    newDocument: 'Nouveau document public',
    editDocument: 'Modifier le document',
    titleLabel: 'Titre du document',
    dateLabel: 'Date',
    categoryLabel: 'Catégorie',
    statusLabel: 'Statut',
    descriptionLabel: 'Description courte',
    publishedLabel: 'Publié dans /documents-publics',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    consult: 'Consulter le fichier',
    remove: 'Supprimer',
    empty: 'Aucun document public enregistré.',
    required: 'Titre, date et description sont obligatoires.',
    internalNotice: 'Par prudence, les documents avec noms, PV ou pièces officielles restent internes tant que le bureau ne valide pas leur publication.',
    categories: {
      official_announcements: 'Annonces officielles',
      public_minutes: 'PV publics',
      douar_documents: 'Documents du douar',
      public_rules: 'Règlements publics',
      community_projects: 'Projets communautaires',
    },
    status: {
      available: 'Disponible',
      coming_soon: 'À venir',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'وثائق داخلية للمصادقة',
    intro: 'فضاء داخلي للمكتب والرئيس لحفظ الوثائق الرسمية وتحديد ما يمكن نشره لاحقا.',
    newDocument: 'وثيقة عمومية جديدة',
    editDocument: 'تعديل الوثيقة',
    titleLabel: 'عنوان الوثيقة',
    dateLabel: 'التاريخ',
    categoryLabel: 'الصنف',
    statusLabel: 'الحالة',
    descriptionLabel: 'وصف قصير',
    publishedLabel: 'منشورة في /documents-publics',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    consult: 'الاطلاع على الملف',
    remove: 'حذف',
    empty: 'لا توجد وثائق عمومية مسجلة.',
    required: 'العنوان والتاريخ والوصف ضرورية.',
    internalNotice: 'احتياطا، تبقى الوثائق التي فيها أسماء أو محاضر أو وثائق رسمية داخلية إلى أن يصادق المكتب على نشرها.',
    categories: {
      official_announcements: 'إعلانات رسمية',
      public_minutes: 'محاضر عمومية',
      douar_documents: 'وثائق الدوار',
      public_rules: 'قوانين عمومية',
      community_projects: 'مشاريع جماعية',
    },
    status: {
      available: 'متوفر',
      coming_soon: 'قريبا',
    },
  },
};

const emptyForm = {
  title: '',
  category: 'douar_documents' as PublicDocumentCategory,
  date: new Date().toISOString().slice(0, 10),
  description: '',
  status: 'coming_soon' as PublicDocumentStatus,
  published: false,
};

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

export default function BureauDocumentsPublicsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [documents, setDocuments] = useState<PublicDocument[]>(readPublicDocuments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...documents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [documents]);

  const persist = (items: PublicDocument[]) => {
    setDocuments(items);
    savePublicDocuments(items);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date || !form.description.trim()) {
      setError(t.required);
      return;
    }

    if (editingId) {
      persist(documents.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: new Date().toISOString() } : item));
    } else {
      persist([{ id: `DOCPUB-${Date.now()}`, ...form, updatedAt: new Date().toISOString() }, ...documents]);
    }
    reset();
  };

  const edit = (document: PublicDocument) => {
    setEditingId(document.id);
    setForm({
      title: document.title,
      category: document.category,
      date: document.date,
      description: document.description,
      status: document.status,
      published: document.published,
    });
    setError('');
  };

  const remove = (id: string) => {
    persist(documents.filter((item) => item.id !== id));
    if (editingId === id) reset();
  };

  return (
    <section className="panel bureau-public-documents-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><FileText size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-documents-publics" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.internalNotice}</p>

      <form className="public-document-form" onSubmit={submit}>
        <h2>{editingId ? t.editDocument : t.newDocument}</h2>
        <label className="field">
          <span>{t.titleLabel}</span>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <div className="public-document-form-grid">
          <label className="field">
            <span>{t.dateLabel}</span>
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </label>
          <label className="field">
            <span>{t.categoryLabel}</span>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as PublicDocumentCategory })}>
              {Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.statusLabel}</span>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PublicDocumentStatus })}>
              {Object.entries(t.status).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>{t.descriptionLabel}</span>
          <textarea value={form.description} rows={4} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <label className="checkbox-field">
          <input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />
          <span>{t.publishedLabel}</span>
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
        </div>
      </form>

      <div className="bureau-public-document-list">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((document) => (
          <article className="public-document-card" key={document.id}>
            <div className="document-topline">
              <span>{t.categories[document.category]} - {formatDate(document.date, lang)}</span>
              <strong className={document.status}>{t.status[document.status]}</strong>
            </div>
            <h2>{document.title}</h2>
            <p>{document.description}</p>
            <p className="publish-state">{document.published ? t.publishedLabel : t.status.coming_soon}</p>
            {document.fileUrl ? (
              <a className="document-consult" href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                {t.consult}
              </a>
            ) : null}
            <div className="bureau-actions">
              <button type="button" onClick={() => edit(document)}><Pencil size={18} /> {t.edit}</button>
              <button type="button" className="danger-action" onClick={() => remove(document.id)}><Trash2 size={18} /> {t.remove}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
