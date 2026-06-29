import { ArrowLeft, AtSign, CheckCircle2, Download, Mail, Pencil, Phone, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useMemo, useState } from 'react';
import { readInternalContacts, saveInternalContacts } from '../data/contactsAuthorities';
import type { ContactCategory, ContactPriority, InternalContact } from '../types/contactsAuthorities';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  warning: string;
  savedLocally: string;
  newContact: string;
  editContact: string;
  name: string;
  role: string;
  organization: string;
  category: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  zone: string;
  associationRelation: string;
  priority: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  search: string;
  allCategories: string;
  allPriorities: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  call: string;
  whatsappAction: string;
  emailAction: string;
  exportJson: string;
  exportCsv: string;
  empty: string;
  required: string;
  confirmDelete: string;
  noSensitive: string;
  categories: Record<ContactCategory, string>;
  priorities: Record<ContactPriority, string>;
};

const categoryOrder: ContactCategory[] = ['bureau_association', 'association_members', 'local_authority', 'commune', 'caidat_pachalik', 'province', 'public_service', 'technician', 'supplier', 'partner', 'other'];
const priorityOrder: ContactPriority[] = ['low', 'medium', 'high', 'urgent'];

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Contacts & autorités',
    intro: 'Carnet interne mobile pour préparer les appels, messages et suivis utiles au renouvellement de l’association.',
    warning: "Carnet interne provisoire. Ne pas saisir de données sensibles tant que l'authentification et le stockage sécurisé ne sont pas activés.",
    savedLocally: 'Sauvegarde temporaire locale : contacts de travail uniquement, sans documents ni pièces sensibles.',
    newContact: 'Ajouter contact',
    editContact: 'Modifier contact',
    name: 'Nom',
    role: 'Fonction',
    organization: 'Organisme',
    category: 'Catégorie',
    phone: 'Téléphone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    address: 'Adresse',
    zone: 'Ville / zone',
    associationRelation: 'Relation avec l’association',
    priority: 'Priorité',
    nextAction: 'Prochaine action',
    nextActionDate: 'Date de prochaine action',
    notes: 'Notes non sensibles',
    search: 'Rechercher',
    allCategories: 'Toutes les catégories',
    allPriorities: 'Toutes les priorités',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    remove: 'Supprimer',
    call: 'Appeler',
    whatsappAction: 'WhatsApp',
    emailAction: 'Email',
    exportJson: 'Exporter JSON',
    exportCsv: 'Exporter CSV',
    empty: 'Aucun contact trouvé.',
    required: 'Nom, fonction, catégorie, priorité et prochaine action sont obligatoires.',
    confirmDelete: 'Supprimer ce contact temporaire ? Aucun document réel ne sera supprimé.',
    noSensitive: 'Ne pas saisir de CIN, signatures, scans, pièces officielles ou informations privées lourdes.',
    categories: {
      bureau_association: 'Bureau association',
      association_members: 'Membres association',
      local_authority: 'Autorité locale',
      commune: 'Commune',
      caidat_pachalik: 'Caïdat / Pachalik',
      province: 'Province',
      public_service: 'Service public',
      technician: 'Technicien',
      supplier: 'Fournisseur',
      partner: 'Partenaire',
      other: 'Autre',
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
    title: 'الاتصالات والسلطات',
    intro: 'دفتر داخلي للهاتف لتحضير المكالمات والرسائل والمتابعة المرتبطة بتجديد الجمعية.',
    warning: 'دفتر داخلي مؤقت. لا تدخل معطيات حساسة قبل تفعيل المصادقة والتخزين الآمن.',
    savedLocally: 'حفظ محلي مؤقت: جهات عمل فقط، بدون وثائق أو ملفات حساسة.',
    newContact: 'إضافة جهة اتصال',
    editContact: 'تعديل جهة الاتصال',
    name: 'الاسم',
    role: 'الصفة',
    organization: 'المؤسسة',
    category: 'الصنف',
    phone: 'الهاتف',
    whatsapp: 'واتساب',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    zone: 'المدينة / المنطقة',
    associationRelation: 'العلاقة مع الجمعية',
    priority: 'الأولوية',
    nextAction: 'الإجراء المقبل',
    nextActionDate: 'تاريخ الإجراء المقبل',
    notes: 'ملاحظات غير حساسة',
    search: 'بحث',
    allCategories: 'كل الأصناف',
    allPriorities: 'كل الأولويات',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    remove: 'حذف',
    call: 'اتصال',
    whatsappAction: 'واتساب',
    emailAction: 'إيميل',
    exportJson: 'تصدير JSON',
    exportCsv: 'تصدير CSV',
    empty: 'لا توجد جهة اتصال مطابقة.',
    required: 'الاسم والصفة والصنف والأولوية والإجراء المقبل ضرورية.',
    confirmDelete: 'هل تريد حذف هذه الجهة المؤقتة؟ لن يتم حذف أي وثيقة حقيقية.',
    noSensitive: 'لا تدخل أرقام بطائق، توقيعات، نسخ ممسوحة، وثائق رسمية أو معلومات خاصة ثقيلة.',
    categories: {
      bureau_association: 'مكتب الجمعية',
      association_members: 'أعضاء الجمعية',
      local_authority: 'السلطة المحلية',
      commune: 'الجماعة',
      caidat_pachalik: 'القيادة / الباشوية',
      province: 'الإقليم',
      public_service: 'مرفق عمومي',
      technician: 'تقني',
      supplier: 'مزود',
      partner: 'شريك',
      other: 'آخر',
    },
    priorities: {
      low: 'ضعيفة',
      medium: 'متوسطة',
      high: 'قوية',
      urgent: 'مستعجلة',
    },
  },
};

function emptyForm(): Omit<InternalContact, 'id' | 'updatedAt'> {
  return {
    name: '',
    role: '',
    organization: '',
    category: 'other',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    zone: '',
    associationRelation: '',
    priority: 'medium',
    nextAction: '',
    nextActionDate: new Date().toISOString().slice(0, 10),
    notes: '',
  };
}

function cleanPhone(value: string) {
  return value.replace(/[^+\d]/g, '');
}

function whatsappHref(value: string) {
  const cleaned = cleanPhone(value).replace(/^\+/, '');
  return cleaned ? `https://wa.me/${cleaned}` : '';
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
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

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
}

export default function BureauContactsAutoritesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [contacts, setContacts] = useState<InternalContact[]>(readInternalContacts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ContactCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ContactPriority>('all');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...contacts]
      .filter((contact) => categoryFilter === 'all' || contact.category === categoryFilter)
      .filter((contact) => priorityFilter === 'all' || contact.priority === priorityFilter)
      .filter((contact) => {
        if (!normalizedQuery) return true;
        return `${contact.name} ${contact.role} ${contact.organization} ${contact.zone} ${contact.nextAction}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority));
  }, [categoryFilter, contacts, priorityFilter, query]);

  const persist = (nextContacts: InternalContact[]) => {
    setContacts(nextContacts);
    saveInternalContacts(nextContacts);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.category || !form.priority || !form.nextAction.trim()) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      persist(contacts.map((contact) => contact.id === editingId ? { ...contact, ...form, updatedAt: now } : contact));
    } else {
      persist([{ id: `CNT-${Date.now()}`, ...form, updatedAt: now }, ...contacts]);
    }
    reset();
  };

  const edit = (contact: InternalContact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name,
      role: contact.role,
      organization: contact.organization,
      category: contact.category,
      phone: contact.phone,
      whatsapp: contact.whatsapp,
      email: contact.email,
      address: contact.address,
      zone: contact.zone,
      associationRelation: contact.associationRelation,
      priority: contact.priority,
      nextAction: contact.nextAction,
      nextActionDate: contact.nextActionDate,
      notes: contact.notes,
    });
    setError('');
  };

  const remove = (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    persist(contacts.filter((contact) => contact.id !== id));
    if (editingId === id) reset();
  };

  const exportJson = () => {
    downloadText('<SLUG>-contacts-autorites.json', JSON.stringify(contacts, null, 2), 'application/json;charset=utf-8');
  };

  const exportCsv = () => {
    const header = ['nom', 'fonction', 'organisme', 'categorie', 'telephone', 'whatsapp', 'email', 'adresse', 'zone', 'relation_association', 'priorite', 'prochaine_action', 'date_prochaine_action', 'notes'];
    const rows = contacts.map((contact) => [
      contact.name,
      contact.role,
      contact.organization,
      t.categories[contact.category],
      contact.phone,
      contact.whatsapp,
      contact.email,
      contact.address,
      contact.zone,
      contact.associationRelation,
      t.priorities[contact.priority],
      contact.nextAction,
      contact.nextActionDate,
      contact.notes,
    ].map(csvEscape).join(','));
    downloadText('<SLUG>-contacts-autorites.csv', [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <section className="panel contacts-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Phone size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-contacts" />
      <p className="privacy-note contacts-warning"><ShieldCheck size={18} /> {t.warning}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.savedLocally}</p>
      <p className="privacy-note"><AtSign size={18} /> {t.noSensitive}</p>

      <div className="contacts-toolbar">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="field"><span>{t.category}</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | ContactCategory)}><option value="all">{t.allCategories}</option>{categoryOrder.map((category) => <option value={category} key={category}>{t.categories[category]}</option>)}</select></label>
        <label className="field"><span>{t.priority}</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | ContactPriority)}><option value="all">{t.allPriorities}</option>{priorityOrder.map((priority) => <option value={priority} key={priority}>{t.priorities[priority]}</option>)}</select></label>
      </div>

      <form className="contacts-form" onSubmit={submit}>
        <h2>{editingId ? t.editContact : t.newContact}</h2>
        <div className="contacts-form-grid">
          <label className="field"><span>{t.name}</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="field"><span>{t.role}</span><input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label>
          <label className="field"><span>{t.organization}</span><input value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} /></label>
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ContactCategory })}>{categoryOrder.map((category) => <option value={category} key={category}>{t.categories[category]}</option>)}</select></label>
          <label className="field"><span>{t.priority}</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ContactPriority })}>{priorityOrder.map((priority) => <option value={priority} key={priority}>{t.priorities[priority]}</option>)}</select></label>
          <label className="field"><span>{t.nextActionDate}</span><input type="date" value={form.nextActionDate} onChange={(event) => setForm({ ...form, nextActionDate: event.target.value })} /></label>
          <label className="field"><span>{t.phone}</span><input inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label className="field"><span>{t.whatsapp}</span><input inputMode="tel" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></label>
          <label className="field"><span>{t.email}</span><input inputMode="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="field"><span>{t.zone}</span><input value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value })} /></label>
          <label className="field"><span>{t.address}</span><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
          <label className="field"><span>{t.associationRelation}</span><input value={form.associationRelation} onChange={(event) => setForm({ ...form, associationRelation: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.nextAction}</span><textarea rows={3} value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} /></label>
        <label className="field"><span>{t.notes}</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="contacts-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}>{t.cancel}</button> : null}
          <button type="button" className="secondary-inline" onClick={exportJson}><Download size={18} /> {t.exportJson}</button>
          <button type="button" className="secondary-inline" onClick={exportCsv}><Download size={18} /> {t.exportCsv}</button>
        </div>
      </form>

      <div className="contacts-list">
        {filtered.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filtered.map((contact) => {
          const phone = cleanPhone(contact.phone);
          const whatsapp = whatsappHref(contact.whatsapp || contact.phone);
          return (
            <article className={`contact-card ${contact.priority}`} key={contact.id}>
              <div className="contact-topline">
                <span>{t.categories[contact.category]} - {formatDate(contact.nextActionDate, lang)}</span>
                <strong>{t.priorities[contact.priority]}</strong>
              </div>
              <h2>{contact.name}</h2>
              <p><strong>{contact.role}</strong>{contact.organization ? ` - ${contact.organization}` : ''}</p>
              <div className="contact-meta-grid">
                <div><span>{t.zone}</span><strong>{contact.zone || '-'}</strong></div>
                <div><span>{t.associationRelation}</span><strong>{contact.associationRelation || '-'}</strong></div>
                <div><span>{t.nextAction}</span><strong>{contact.nextAction}</strong></div>
                <div><span>{t.address}</span><strong>{contact.address || '-'}</strong></div>
              </div>
              {contact.notes ? <p className="contact-note">{contact.notes}</p> : null}
              <div className="contact-quick-actions">
                {phone ? <a href={`tel:${phone}`}><Phone size={17} /> {t.call}</a> : <button type="button" disabled><Phone size={17} /> {t.call}</button>}
                {whatsapp ? <a href={whatsapp} target="_blank" rel="noreferrer"><Phone size={17} /> {t.whatsappAction}</a> : <button type="button" disabled><Phone size={17} /> {t.whatsappAction}</button>}
                {contact.email ? <a href={`mailto:${contact.email}`}><Mail size={17} /> {t.emailAction}</a> : <button type="button" disabled><Mail size={17} /> {t.emailAction}</button>}
              </div>
              <div className="bureau-actions">
                <button type="button" onClick={() => edit(contact)}><Pencil size={18} /> {t.edit}</button>
                <button type="button" className="danger-action" onClick={() => remove(contact.id)}><Trash2 size={18} /> {t.remove}</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}