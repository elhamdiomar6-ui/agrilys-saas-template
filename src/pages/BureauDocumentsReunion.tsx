import { ArrowLeft, CheckCircle2, Download, FileText, Printer, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';

type Lang = 'fr' | 'ar';
type MeetingDocumentStatus = 'to_validate' | 'to_print' | 'validated';

type MeetingDocument = {
  id: string;
  title: Record<Lang, string>;
  language: Record<Lang, string>;
  status: MeetingDocumentStatus;
  sourceFile: string;
  summary: Record<Lang, string>;
  excerpt: Record<Lang, string>;
};

const copy = {
  fr: {
    back: 'Retour',
    title: 'Documents de réunion',
    intro: 'Espace interne pour préparer les documents de réunion avant impression ou validation par le bureau.',
    notice: 'Ces documents restent internes. Rien n’est publié automatiquement dans les documents publics.',
    source: 'Fichier source',
    language: 'Langue',
    status: 'Statut',
    preview: 'Extrait',
    download: 'Télécharger fiche',
    print: 'Préparer impression',
    statuses: {
      to_validate: 'À valider',
      to_print: 'À imprimer',
      validated: 'Validé bureau',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'وثائق الاجتماع',
    intro: 'فضاء داخلي لتحضير وثائق الاجتماع قبل الطباعة أو المصادقة من طرف المكتب.',
    notice: 'هذه الوثائق تبقى داخلية. لا يتم نشر أي شيء تلقائيا في الوثائق العمومية.',
    source: 'الملف الأصلي',
    language: 'اللغة',
    status: 'الحالة',
    preview: 'مقتطف',
    download: 'تحميل البطاقة',
    print: 'تحضير الطباعة',
    statuses: {
      to_validate: 'للمصادقة',
      to_print: 'للطباعة',
      validated: 'مصادق عليه من المكتب',
    },
  },
};

const documents: MeetingDocument[] = [
  {
    id: 'MEETING-VISION-FR',
    title: {
      fr: 'Synthèse réunion - vision long terme',
      ar: 'خلاصة الاجتماع - الرؤية البعيدة',
    },
    language: { fr: 'Français', ar: 'الفرنسية' },
    status: 'to_print',
    sourceFile: 'SYNTHESE_REUNION_VISION_LONG_TERME_AGADIRNETGUIDA.md',
    summary: {
      fr: 'Version courte officielle pour présenter la vision au bureau, aux partenaires et aux autorités.',
      ar: 'نسخة قصيرة رسمية لتقديم الرؤية للمكتب والشركاء والسلطات.',
    },
    excerpt: {
      fr: 'La technologie sert la Jmaâ, elle ne la remplace pas. Document à imprimer pour validation humaine.',
      ar: 'التكنولوجيا في خدمة الجماعة ولا تعوضها. وثيقة للطباعة والمصادقة البشرية.',
    },
  },
  {
    id: 'MEETING-VISION-DARIJA',
    title: {
      fr: 'Synthèse réunion - Darija',
      ar: 'خلاصة الاجتماع - الدارجة',
    },
    language: { fr: 'Darija marocaine', ar: 'الدارجة المغربية' },
    status: 'to_print',
    sourceFile: 'SYNTHESE_REUNION_VISION_LONG_TERME_AGADIRNETGUIDA_DARIJA.md',
    summary: {
      fr: 'Version principale pour expliquer la vision au bureau, aux anciens et aux habitants.',
      ar: 'النسخة الرئيسية لشرح الرؤية للمكتب وكبار الدوار والساكنة.',
    },
    excerpt: {
      fr: 'التكنولوجيا كتخدم الجماعة، وما كتبدلهاش. Version darija pour réunion locale.',
      ar: 'التكنولوجيا كتخدم الجماعة، وما كتبدلهاش. نسخة دارجة للاجتماع المحلي.',
    },
  },
  {
    id: 'LONG-TERM-VISION',
    title: {
      fr: 'Vision long terme plateforme territoriale',
      ar: 'الرؤية البعيدة للمنصة الترابية',
    },
    language: { fr: 'Français', ar: 'الفرنسية' },
    status: 'to_validate',
    sourceFile: 'VISION_LONG_TERME_PLATEFORME_TERRITORIALE_AGADIRNETGUIDA.md',
    summary: {
      fr: 'Document de direction complet : phases, confidentialité et gouvernance locale.',
      ar: 'وثيقة توجيه كاملة: المراحل، السرية والحكامة المحلية.',
    },
    excerpt: {
      fr: 'Vision locale : Agadir N’Tguida, amélioration interne, coopératives locales et gouvernance responsable.',
      ar: 'رؤية محلية: أكادير نتكيدا، تحسين داخلي، تعاونيات محلية وحكامة مسؤولة.',
    },
  },
  {
    id: 'CURRENT-APP-STATE',
    title: {
      fr: 'État actuel application',
      ar: 'الوضع الحالي للتطبيق',
    },
    language: { fr: 'Français', ar: 'الفرنسية' },
    status: 'to_validate',
    sourceFile: 'ETAT_CODE_ACTUEL.md',
    summary: {
      fr: 'Inventaire technique et fonctionnel existant dans le dépôt.',
      ar: 'جرد تقني ووظيفي لما هو موجود في المشروع.',
    },
    excerpt: {
      fr: 'État du code, routes, modules publics, modules internes, Supabase, sécurité et points à améliorer.',
      ar: 'حالة الكود، المسارات، الوحدات العمومية والداخلية، Supabase، السلامة والنقط التي تحتاج تحسين.',
    },
  },
];

function documentSheet(document: MeetingDocument, lang: Lang) {
  return [
    document.title[lang],
    '',
    `Langue: ${document.language[lang]}`,
    `Statut: ${copy[lang].statuses[document.status]}`,
    `Fichier source: ${document.sourceFile}`,
    '',
    document.summary[lang],
    '',
    document.excerpt[lang],
    '',
    'Note interne: le contenu complet reste dans les fichiers Markdown du dépôt et ne doit pas être publié sans validation du bureau.',
  ].join('\n');
}

function downloadSheet(document: MeetingDocument, lang: Lang) {
  const blob = new Blob([documentSheet(document, lang)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = document.sourceFile.replace(/\.md$/i, '-fiche-interne.txt');
  link.click();
  URL.revokeObjectURL(url);
}

function printSheet(document: MeetingDocument, lang: Lang) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) return;
  const isArabic = document.id.includes('DARIJA');
  const escaped = documentSheet(document, lang)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  printWindow.document.write(`
    <!doctype html>
    <html lang="${isArabic ? 'ar' : 'fr'}" dir="${isArabic ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8" />
        <title>${document.title.fr}</title>
        <style>
          body {
            font-family: ${isArabic ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" : "'Segoe UI', Arial, sans-serif"};
            line-height: 1.7;
            margin: 32px;
            color: #1f2933;
          }
          pre {
            white-space: pre-wrap;
            font: inherit;
          }
        </style>
      </head>
      <body>
        <pre>${escaped}</pre>
        <script>window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default function BureauDocumentsReunionPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];

  return (
    <section className="panel meeting-documents-page internal-workspace-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><FileText size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-documents-reunion" />
      <p className="privacy-note internal-warning"><ShieldCheck size={18} /> {t.notice}</p>

      <div className="internal-list meeting-documents-list">
        {documents.map((document) => (
          <article className={`internal-card meeting-document-card ${document.status}`} key={document.id}>
            <div className="internal-topline">
              <span>{document.language[lang]}</span>
              <strong>{t.status}: {t.statuses[document.status]}</strong>
            </div>
            <h2>{document.title[lang]}</h2>
            <p>{document.summary[lang]}</p>
            <div className="internal-meta-grid">
              <div><span>{t.source}</span><strong>{document.sourceFile}</strong></div>
              <div><span>{t.language}</span><strong>{document.language[lang]}</strong></div>
            </div>
            <div className="meeting-document-preview">
              <span>{t.preview}</span>
              <pre>{document.excerpt[lang]}</pre>
            </div>
            <div className="bureau-actions internal-card-actions">
              <button type="button" className="secondary-inline" onClick={() => downloadSheet(document, lang)}>
                <Download size={18} /> {t.download}
              </button>
              <button type="button" onClick={() => printSheet(document, lang)}>
                <Printer size={18} /> {t.print}
              </button>
              {document.status === 'validated' ? <span className="status-pill"><CheckCircle2 size={16} /> {t.statuses.validated}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
