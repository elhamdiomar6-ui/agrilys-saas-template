import { ArrowLeft, CheckCircle2, Megaphone, Plus, Send } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { listerEnAttente, listerPublie, soumettre, type ContentItem } from '../lib/contentWorkflow';
import type { AnnouncementCategory, AnnouncementImportance } from '../types/announcement';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newAnnouncement: string;
  titleLabel: string;
  dateLabel: string;
  categoryLabel: string;
  importanceLabel: string;
  contentLabel: string;
  submit: string;
  empty: string;
  required: string;
  sent: string;
  failed: string;
  internalNotice: string;
  waiting: string;
  published: string;
  categories: Record<AnnouncementCategory, string>;
  importance: Record<AnnouncementImportance, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Préparer une annonce',
    intro: 'Les annonces sont soumises au workflow Supabase. Elles deviennent publiques uniquement après validation.',
    newAnnouncement: 'Nouvelle annonce à valider',
    titleLabel: 'Titre',
    dateLabel: 'Date',
    categoryLabel: 'Catégorie',
    importanceLabel: 'Importance',
    contentLabel: 'Contenu court',
    submit: 'Soumettre au workflow',
    empty: 'Aucune annonce dans cette liste.',
    required: 'Titre, date et contenu sont obligatoires.',
    sent: 'Annonce soumise pour validation.',
    failed: 'Soumission impossible. Vérifier la connexion et les droits Supabase.',
    internalNotice: 'Ne pas saisir de données sensibles. Le Président ou le Bureau valide avant publication.',
    waiting: 'En attente',
    published: 'Publié',
    categories: {
      reunion: 'Réunion',
      travaux: 'Travaux',
      eau: 'Eau',
      mosquee: 'Mosquée',
      evenement: 'Événement',
      info: 'Information générale',
    },
    importance: {
      normal: 'Normale',
      important: 'Importante',
      urgent: 'Urgente',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'إعداد إعلان',
    intro: 'تُرسل الإعلانات إلى مسار المصادقة في Supabase ولا تظهر للعموم إلا بعد التحقق.',
    newAnnouncement: 'إعلان جديد للمصادقة',
    titleLabel: 'العنوان',
    dateLabel: 'التاريخ',
    categoryLabel: 'الصنف',
    importanceLabel: 'الأهمية',
    contentLabel: 'محتوى قصير',
    submit: 'إرسال للمصادقة',
    empty: 'لا يوجد أي إعلان في هذه القائمة.',
    required: 'العنوان والتاريخ والمحتوى ضرورية.',
    sent: 'تم إرسال الإعلان للمصادقة.',
    failed: 'تعذر إرسال الإعلان. تحقق من الاتصال وصلاحيات Supabase.',
    internalNotice: 'يمنع إدخال معطيات حساسة. تتم المصادقة قبل النشر العمومي.',
    waiting: 'في الانتظار',
    published: 'منشور',
    categories: {
      reunion: 'اجتماع',
      travaux: 'أشغال',
      eau: 'الماء',
      mosquee: 'المسجد',
      evenement: 'حدث',
      info: 'معلومة عامة',
    },
    importance: {
      normal: 'عادية',
      important: 'مهمة',
      urgent: 'مستعجلة',
    },
  },
};

const emptyForm = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'info' as AnnouncementCategory,
  importance: 'normal' as AnnouncementImportance,
  content: '',
};

function formatDate(value: string | null | undefined, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

export default function BureauAnnoncesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [waiting, setWaiting] = useState<ContentItem[]>([]);
  const [published, setPublished] = useState<ContentItem[]>([]);

  const sortedWaiting = useMemo(() => waiting.filter((item) => item.content_type === 'annonce'), [waiting]);
  const sortedPublished = useMemo(() => published.filter((item) => item.content_type === 'annonce'), [published]);

  const load = async () => {
    const [waitingItems, publishedItems] = await Promise.all([
      listerEnAttente(),
      listerPublie('annonce'),
    ]);
    setWaiting(waitingItems);
    setPublished(publishedItems);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setError('');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!form.title.trim() || !form.date || !form.content.trim()) {
      setError(t.required);
      return;
    }

    const result = await soumettre('annonce', form.title.trim(), form.content.trim(), {
      date: form.date,
      category: form.category,
      importance: form.importance,
    });

    if (!result.ok) {
      setError(result.error || t.failed);
      return;
    }

    setNotice(t.sent);
    reset();
    await load();
  };

  const renderItem = (item: ContentItem, statusLabel: string) => {
    const metadata = item.metadata || {};
    const category = typeof metadata.category === 'string' ? metadata.category as AnnouncementCategory : 'info';
    const importance = typeof metadata.importance === 'string' ? metadata.importance as AnnouncementImportance : 'normal';
    const date = typeof metadata.date === 'string' ? metadata.date : item.publie_le || item.soumis_le;

    return (
      <article className={`announcement-card ${importance}`} key={item.id}>
        <div className="announcement-topline">
          <span>{t.categories[category]} - {formatDate(date, lang)}</span>
          <strong>{statusLabel}</strong>
        </div>
        <h2>{item.titre}</h2>
        {item.contenu ? <p>{item.contenu}</p> : null}
      </article>
    );
  };

  return (
    <section className="panel bureau-announcements-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Megaphone size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-annonces" />
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.internalNotice}</p>

      <form className="announcement-form" onSubmit={submit}>
        <h2>{t.newAnnouncement}</h2>
        <label className="field">
          <span>{t.titleLabel}</span>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <div className="announcement-form-grid">
          <label className="field">
            <span>{t.dateLabel}</span>
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </label>
          <label className="field">
            <span>{t.categoryLabel}</span>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AnnouncementCategory })}>
              {Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.importanceLabel}</span>
            <select value={form.importance} onChange={(event) => setForm({ ...form, importance: event.target.value as AnnouncementImportance })}>
              {Object.entries(t.importance).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>{t.contentLabel}</span>
          <textarea value={form.content} rows={4} onChange={(event) => setForm({ ...form, content: event.target.value })} />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        {notice ? <p className="success-text">{notice}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Send size={18} /> {t.submit}</button>
        </div>
      </form>

      <div className="bureau-announcement-list">
        <h2>{t.waiting}</h2>
        {sortedWaiting.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sortedWaiting.map((item) => renderItem(item, t.waiting))}

        <h2>{t.published}</h2>
        {sortedPublished.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sortedPublished.map((item) => renderItem(item, t.published))}
      </div>
    </section>
  );
}
