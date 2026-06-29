import { ArrowLeft, Globe2, Home, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import AudioHelp from '../../components/AudioHelp';
import { explorerEditorialCopy } from '../../data/appEditorialCopies';
import { usePublicEditorialCopy } from '../../lib/publicEditorialContent';
import type { UserRole } from '../../types/roles';

type Lang = 'fr' | 'ar';
type Page = 'home' | 'login' | 'connexionHabitant' | 'explorer' | 'bureau' | 'president' | 'presidentRecensement' | 'inscription' | 'habitant' | 'aPropos' | 'annonces' | 'documentsPublics' | 'signalement' | 'douars' | 'douarDetail' | 'rejoindre' | 'memoireOrale' | 'patrimoine' | 'chronologie' | 'carteCommunautaire' | 'projets' | 'evenements' | 'jeunesse' | 'entraide' | 'eau' | 'agriculture' | 'diaspora' | 'cooperatives' | 'cotisations' | 'membres' | 'bureauInscriptions' | 'bureauAnnonces' | 'bureauDocumentsPublics' | 'bureauDocumentsReunion' | 'bureauSignalements' | 'bureauMemoireOrale' | 'bureauPatrimoine' | 'bureauPlanAction' | 'bureauChronologie' | 'bureauCarteCommunautaire' | 'bureauProjets' | 'bureauEvenements' | 'bureauJeunesse' | 'bureauEntraide' | 'bureauEau' | 'bureauAgriculture' | 'bureauDiaspora' | 'bureauCooperatives' | 'bureauContacts' | 'bureauCollecte' | 'bureauTaches' | 'bureauDemarches' | 'bureauReunions' | 'bureauSauvegarde' | 'presidentPilotageInterne' | 'presidentContentEditor' | 'presidentOrchid' | 'bureauMembres' | 'bureauCotisations' | 'bureauRenouvellement' | 'bureauWorkflows' | 'bureauWorkflowPublication' | 'bureauStatistiques' | 'mosquee' | 'bureauMosquee';

type AccessCard = {
  page: Page;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
};

type AccessGroup = {
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  items: AccessCard[];
};

function accessIconForPage(page: Page): ReactNode {
  switch (page) {
    case 'annonces': return '📢';
    case 'documentsPublics': return '📄';
    case 'signalement': return '🔔';
    case 'douars': return '🏘️';
    case 'rejoindre': return '➕';
    case 'memoireOrale': return '🎙️';
    case 'patrimoine': return '🏛️';
    case 'chronologie': return '⏳';
    case 'carteCommunautaire': return '🗺️';
    case 'projets': return '🔨';
    case 'evenements': return '📅';
    case 'jeunesse': return '⚡';
    case 'entraide': return '🤝';
    case 'eau': return '💧';
    case 'agriculture': return '🌿';
    case 'diaspora': return '🌍';
    case 'cooperatives': return '🤝';
    default: return '📄';
  }
}

function AccessGroupSection({ lang, group, onNavigate }: { lang: Lang; group: AccessGroup; onNavigate: (page: Page) => void }) {
  return (
    <section className="access-group">
      <div className="access-group-heading">
        <h2>{group.title[lang]}</h2>
        <p>{group.desc[lang]}</p>
      </div>
      <div className="access-card-grid">
        {group.items.map((item) => (
          <button className="access-card platform-card" type="button" key={`${item.page}-${item.title.fr}`} onClick={() => onNavigate(item.page)}>
            <span className="access-card-icon">{accessIconForPage(item.page)}</span>
            <strong>{item.title[lang]}</strong>
            <small>{item.desc[lang]}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function SpaceNav({ lang, onNavigate }: { lang: Lang; onNavigate: (page: Page) => void }) {
  const allItems: AccessCard[] = [
    { page: 'habitant', title: { fr: 'Habitant', ar: 'الساكن' }, desc: { fr: 'Accès public', ar: 'ولوج عمومي' } },
    { page: 'explorer', title: { fr: 'Explorer', ar: 'استكشاف' }, desc: { fr: 'Modules publics', ar: 'الوحدات العمومية' } },
  ];

  return (
    <nav className="space-nav" aria-label={lang === 'ar' ? 'التنقل بين الفضاءات' : 'Navigation entre les espaces'}>
      {allItems.map((item) => (
        <button
          className={item.page === 'explorer' ? 'active platform-nav-card' : 'platform-nav-card'}
          type="button"
          key={item.page}
          onClick={() => onNavigate(item.page)}
          aria-current={item.page === 'explorer' ? 'page' : undefined}
        >
          <span>{item.page === 'habitant' ? '🏠' : '🌍'}</span>
          <strong>{item.title[lang]}</strong>
          <small>{item.desc[lang]}</small>
        </button>
      ))}
    </nav>
  );
}

const publicExploreGroups: AccessGroup[] = [
  {
    title: { fr: 'Services communautaires', ar: 'الخدمات الجماعية' },
    desc: { fr: 'Lire, signaler, rejoindre et découvrir le douar.', ar: 'قراءة، تبليغ، الانضمام واكتشاف الدوار.' },
    items: [
      { page: 'annonces', title: { fr: 'Annonces', ar: 'الإعلانات' }, desc: { fr: 'Messages validés par le bureau.', ar: 'الرسائل المصادق عليها من طرف المكتب.' } },
      { page: 'documentsPublics', title: { fr: 'Documents publics', ar: 'الوثائق العمومية' }, desc: { fr: 'Lectures, guides, rapports.', ar: 'القراءات والأدلة والتقارير.' } },
      { page: 'signalement', title: { fr: 'Signalements', ar: 'التبليغات' }, desc: { fr: 'Alerter sur un besoin non couvert.', ar: 'تنبيه على احتياج غير مغطى.' } },
      { page: 'rejoindre', title: { fr: 'Rejoindre', ar: 'الانضمام' }, desc: { fr: 'Comment s\'inscrire et participer.', ar: 'كيفية التسجيل والمشاركة.' } },
    ],
  },
  {
    title: { fr: 'Mémoire et patrimoine', ar: 'الذاكرة والتراث' },
    desc: { fr: 'Découvrir l\'histoire, la culture et l\'identité du douar.', ar: 'اكتشاف تاريخ الدوار وثقافته وهويته.' },
    items: [
      { page: 'memoireOrale', title: { fr: 'Mémoire orale', ar: 'الذاكرة الشفوية' }, desc: { fr: 'Témoignages et récits de vie.', ar: 'الشهادات والروايات الحياتية.' } },
      { page: 'patrimoine', title: { fr: 'Patrimoine', ar: 'التراث' }, desc: { fr: 'Architecture et sites significatifs.', ar: 'العمارة والمواقع ذات الدلالة.' } },
      { page: 'chronologie', title: { fr: 'Chronologie', ar: 'الخط الزمني' }, desc: { fr: 'Dates clés de l\'histoire locale.', ar: 'التواريخ الرئيسية للتاريخ المحلي.' } },
    ],
  },
  {
    title: { fr: 'Vie du douar', ar: 'حياة الدوار' },
    desc: { fr: 'Vie sociale, événements, projets et échanges.', ar: 'الحياة الاجتماعية والأحداث والمشاريع والتبادلات.' },
    items: [
      { page: 'douars', title: { fr: 'Géographie', ar: 'الجغرافيا' }, desc: { fr: 'Lieux, douars et zones.', ar: 'الأماكن والدواوير والمناطق.' } },
      { page: 'carteCommunautaire', title: { fr: 'Carte communautaire', ar: 'الخريطة الجماعية' }, desc: { fr: 'Localiser les foyers et ressources.', ar: 'تحديد موقع الأسر والموارد.' } },
      { page: 'projets', title: { fr: 'Projets', ar: 'المشاريع' }, desc: { fr: 'Initiatives et développement.', ar: 'المبادرات والتطوير.' } },
      { page: 'evenements', title: { fr: 'Événements', ar: 'الأحداث' }, desc: { fr: 'Calendrier et occasions.', ar: 'التقويم والمناسبات.' } },
    ],
  },
  {
    title: { fr: 'Services et secteurs', ar: 'الخدمات والقطاعات' },
    desc: { fr: 'Eau, agriculture, solidarité, jeunesse, diaspora.', ar: 'الماء والزراعة والتضامن والشباب والشتات.' },
    items: [
      { page: 'eau', title: { fr: 'Eau et forage', ar: 'الماء والبئر' }, desc: { fr: 'Gestion de l\'eau et ressources.', ar: 'إدارة الماء والموارد.' } },
      { page: 'agriculture', title: { fr: 'Agriculture', ar: 'الزراعة' }, desc: { fr: 'Cultures, pratiques et échanges.', ar: 'المحاصيل والممارسات والتبادلات.' } },
      { page: 'entraide', title: { fr: 'Entraide', ar: 'التضامن' }, desc: { fr: 'Soutien et solidarité.', ar: 'الدعم والتضامن.' } },
      { page: 'jeunesse', title: { fr: 'Jeunesse', ar: 'الشباب' }, desc: { fr: 'Actions et engagements jeunes.', ar: 'الإجراءات والالتزامات الشبابية.' } },
      { page: 'diaspora', title: { fr: 'Diaspora', ar: 'الشتات' }, desc: { fr: 'Liens avec l\'extérieur.', ar: 'الروابط مع الخارج.' } },
      { page: 'cooperatives', title: { fr: 'Coopératives', ar: 'التعاونيات' }, desc: { fr: 'Économie locale et groupements.', ar: 'الاقتصاد المحلي والمجموعات.' } },
    ],
  },
];

export default function ExplorerPage({ lang, onBack, onNavigate }: { lang: Lang; onBack: () => void; onNavigate: (page: Page) => void }) {
  const c = usePublicEditorialCopy('explorer', explorerEditorialCopy)[lang];
  return (
    <section className="panel access-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {c.back}</button>
      <div className="brand-mark small"><Globe2 size={28} /></div>
      <h1>{c.title}</h1>
      <p className="intro">{c.intro}</p>
      <AudioHelp scriptId="explorer" pageId="explorer" />
      <section className="community-vision compact" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <h2>{c.visionTitle}</h2>
        <p>{c.visionText}</p>
      </section>
      <SpaceNav lang={lang} onNavigate={onNavigate} />
      {publicExploreGroups.map((group) => <AccessGroupSection key={group.title.fr} lang={lang} group={group} onNavigate={onNavigate} />)}
    </section>
  );
}
