import { ArrowLeft, CalendarDays, FileText, LockKeyhole, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { siteConfig } from '../config/site';
import { readPublicDocuments } from '../data/publicDocuments';
import { listerPublie, type ContentItem } from '../lib/contentWorkflow';
import { getDocumentUrl } from '../lib/supabaseClient';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import type { PublicDocument, PublicDocumentCategory, PublicDocumentStatus } from '../types/publicDocument';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  noSensitive: string;
  contact: string;
  consult: string;
  unavailable: string;
  categories: Record<PublicDocumentCategory, string>;
  status: Record<PublicDocumentStatus, string>;
};

export const documentsPublicsCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Documents publics',
    intro: 'Seuls les documents non sensibles validés explicitement par le bureau seront publiés ici.',
    empty: "Les documents publics seront ajoutés progressivement après validation du bureau de l'association.",
    noSensitive: 'Les archives internes, scans réels et documents sensibles ne sont pas affichés ici.',
    contact: "Pour une demande concernant un document public, contactez l'association.",
    consult: 'Consulter',
    unavailable: 'À venir',
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
    title: 'الوثائق العمومية',
    intro: 'لا تنشر هنا إلا الوثائق غير الحساسة التي يصادق عليها المكتب صراحة.',
    empty: 'ستضاف الوثائق العمومية تدريجيا بعد مصادقة مكتب الجمعية.',
    noSensitive: 'الأرشيف الداخلي والنسخ الممسوحة والوثائق الحساسة لا تظهر هنا.',
    contact: 'لطلب معلومات حول وثيقة عمومية، تواصلوا مع الجمعية.',
    consult: 'الاطلاع',
    unavailable: 'قريبا',
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

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function workflowToDocument(item: ContentItem): PublicDocument {
  const metadata = item.metadata || {};
  return {
    id: item.id,
    title: item.titre,
    category: typeof metadata.category === 'string' ? metadata.category as PublicDocumentCategory : 'douar_documents',
    date: typeof metadata.date === 'string' ? metadata.date : (item.publie_le || item.created_at || new Date().toISOString()).slice(0, 10),
    description: item.contenu || '',
    status: typeof metadata.status === 'string' ? metadata.status as PublicDocumentStatus : 'available',
    storagePath: typeof metadata.storagePath === 'string' ? metadata.storagePath : undefined,
    published: true,
    updatedAt: item.updated_at || item.publie_le || new Date().toISOString(),
  };
}

async function withSignedUrls(documents: PublicDocument[]) {
  return Promise.all(documents.map(async (document) => {
    if (document.status !== 'available' || !document.storagePath) return document;
    try {
      return { ...document, fileUrl: await getDocumentUrl(document.storagePath) };
    } catch {
      return { ...document, fileUrl: undefined };
    }
  }));
}

export default function DocumentsPublicsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('documents-publics', documentsPublicsCopy)[lang];
  const [documents, setDocuments] = useState<PublicDocument[]>([]);

  useEffect(() => {
    let mounted = true;
    listerPublie('document')
      .then((items) => {
        if (items.length > 0) return items.map(workflowToDocument);
        return readPublicDocuments().filter((document) => document.published);
      })
      .then((items) => items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      .then(withSignedUrls)
      .then((items) => {
        if (mounted) setDocuments(items);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel public-documents-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><FileText size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="documents-publics" pageId="documents-publics" />

      <div className="public-documents-list">
        {documents.length === 0 ? <div className="empty-state">{t.empty}</div> : null}
        {documents.map((document) => (
          <article className="public-document-card" key={document.id}>
            <div className="document-topline">
              <span>{t.categories[document.category]}</span>
              <strong className={document.status}>{t.status[document.status]}</strong>
            </div>
            <h2>{document.title}</h2>
            <p>{document.description}</p>
            <CardListenButton text={`${document.title}. ${document.description}`} lang={lang} />
            <div className="document-date"><CalendarDays size={17} /> {formatDate(document.date, lang)}</div>
            {document.status === 'available' && document.fileUrl ? (
              <a className="document-consult" href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                {t.consult}
              </a>
            ) : (
              <button className="document-consult" disabled>
                {document.status === 'available' ? t.consult : t.unavailable}
              </button>
            )}
          </article>
        ))}
      </div>

      <p className="privacy-note"><LockKeyhole size={18} /> {t.noSensitive}</p>
      <p className="privacy-note"><Mail size={18} /> {t.contact} <a href={`mailto:${siteConfig.officialEmail}`}>{siteConfig.officialEmail}</a></p>
    </section>
  );
}
