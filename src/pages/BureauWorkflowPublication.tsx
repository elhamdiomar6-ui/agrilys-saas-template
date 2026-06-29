import { ArrowLeft, CheckCircle2, Clock3, FileCheck2, Send, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { listerParStatut, publier, rejeter, type ContentItem, type WorkflowStatut } from '../lib/contentWorkflow';
import type { UserRole } from '../types/roles';

type Lang = 'fr' | 'ar';
type TabKey = 'en_attente' | 'publie' | 'rejete';

const tabs: Array<{ key: TabKey; icon: typeof Clock3 }> = [
  { key: 'en_attente', icon: Clock3 },
  { key: 'publie', icon: CheckCircle2 },
  { key: 'rejete', icon: XCircle },
];

const labels = {
  fr: {
    back: 'Retour',
    title: 'Workflow de publication',
    intro: 'Validation interne avant toute publication publique. Rien ne devient public sans statut publié.',
    en_attente: 'En attente',
    publie: 'Publié',
    rejete: 'Rejeté',
    type: 'Type',
    submitted: 'Soumis le',
    published: 'Publié le',
    comment: 'Commentaire de rejet',
    publish: 'Publier',
    reject: 'Rejeter',
    refresh: 'Actualiser',
    presidentOnly: 'Publication réservée au Président.',
    empty: 'Aucun contenu dans cet onglet.',
    loading: 'Chargement...',
    error: 'Action impossible. Vérifier la session et les droits Supabase.',
  },
  ar: {
    back: 'رجوع',
    title: 'مسار النشر',
    intro: 'مصادقة داخلية قبل أي نشر عمومي. لا يظهر أي محتوى للعموم قبل حالة منشور.',
    en_attente: 'في الانتظار',
    publie: 'منشور',
    rejete: 'مرفوض',
    type: 'الصنف',
    submitted: 'تاريخ الإرسال',
    published: 'تاريخ النشر',
    comment: 'تعليق الرفض',
    publish: 'نشر',
    reject: 'رفض',
    refresh: 'تحديث',
    presidentOnly: 'النشر مخصص للرئيس فقط.',
    empty: 'لا يوجد محتوى في هذا التبويب.',
    loading: 'جار التحميل...',
    error: 'تعذر تنفيذ العملية. تحقق من الجلسة وصلاحيات Supabase.',
  },
};

function formatDate(value: string | null | undefined, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function BureauWorkflowPublicationPage({
  lang,
  currentRole,
  onBack,
}: {
  lang: Lang;
  currentRole: UserRole;
  onBack: () => void;
}) {
  const t = labels[lang];
  const [active, setActive] = useState<TabKey>('en_attente');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const isPresident = currentRole === 'president';

  const load = async (statut: WorkflowStatut = active) => {
    setLoading(true);
    setMessage('');
    const data = await listerParStatut(statut);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load(active);
  }, [active]);

  const publishItem = async (id: string) => {
    if (!isPresident) {
      setMessage(t.presidentOnly);
      return;
    }
    const ok = await publier(id);
    if (!ok) {
      setMessage(t.error);
      return;
    }
    await load();
  };

  const rejectItem = async (id: string) => {
    const ok = await rejeter(id, comments[id] || '');
    if (!ok) {
      setMessage(t.error);
      return;
    }
    await load();
  };

  return (
    <section className="panel bureau-workflow-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><FileCheck2 size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-workflow-publication" />
      <p className="privacy-note"><Send size={18} /> {t.presidentOnly}</p>

      <div className="segmented-tabs" role="tablist" aria-label={t.title}>
        {tabs.map(({ key, icon: Icon }) => (
          <button
            type="button"
            className={active === key ? 'active' : ''}
            onClick={() => setActive(key)}
            key={key}
          >
            <Icon size={17} />
            {t[key]}
          </button>
        ))}
      </div>

      <button type="button" className="secondary-inline" onClick={() => load()}>
        {t.refresh}
      </button>

      {message ? <p className="error-text">{message}</p> : null}
      {loading ? <p className="empty-state">{t.loading}</p> : null}
      {!loading && items.length === 0 ? <p className="empty-state">{t.empty}</p> : null}

      <div className="bureau-announcement-list">
        {items.map((item) => (
          <article className={`announcement-card ${item.statut}`} key={item.id}>
            <div className="announcement-topline">
              <span>{t.type}: {item.content_type}</span>
              <strong>{t[item.statut as TabKey] || item.statut}</strong>
            </div>
            <h2>{item.titre}</h2>
            {item.contenu ? <p>{item.contenu}</p> : null}
            <p className="privacy-note">
              {active === 'publie' ? t.published : t.submitted}: {formatDate(active === 'publie' ? item.publie_le : item.soumis_le, lang)}
            </p>

            {active === 'en_attente' ? (
              <div className="bureau-actions">
                <button type="button" disabled={!isPresident} onClick={() => publishItem(item.id)}>
                  <CheckCircle2 size={18} /> {t.publish}
                </button>
                <label className="field workflow-reject-field">
                  <span>{t.comment}</span>
                  <input
                    value={comments[item.id] || ''}
                    onChange={(event) => setComments({ ...comments, [item.id]: event.target.value })}
                  />
                </label>
                <button type="button" className="danger-action" onClick={() => rejectItem(item.id)}>
                  <XCircle size={18} /> {t.reject}
                </button>
              </div>
            ) : null}

            {active === 'rejete' && item.commentaire_validation ? (
              <p className="privacy-note">{item.commentaire_validation}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
