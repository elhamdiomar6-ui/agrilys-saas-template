import { ArrowLeft, Clock3, Home, Info, LockKeyhole, Phone, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../../lib/auth/supabaseAuth';
import HabitantPersonalDashboard from '../../components/HabitantPersonalDashboard';
import type { UserRole } from '../../types/roles';

type Lang = 'fr' | 'ar';
type Page = 'home' | 'login' | 'connexionHabitant' | 'explorer' | 'bureau' | 'president' | 'presidentRecensement' | 'inscription' | 'habitant' | 'aPropos' | 'annonces' | 'documentsPublics' | 'signalement' | 'douars' | 'douarDetail' | 'rejoindre' | 'memoireOrale' | 'patrimoine' | 'chronologie' | 'carteCommunautaire' | 'projets' | 'evenements' | 'jeunesse' | 'entraide' | 'eau' | 'agriculture' | 'diaspora' | 'cooperatives' | 'cotisations' | 'membres' | 'bureauInscriptions' | 'bureauAnnonces' | 'bureauDocumentsPublics' | 'bureauDocumentsReunion' | 'bureauSignalements' | 'bureauMemoireOrale' | 'bureauPatrimoine' | 'bureauPlanAction' | 'bureauChronologie' | 'bureauCarteCommunautaire' | 'bureauProjets' | 'bureauEvenements' | 'bureauJeunesse' | 'bureauEntraide' | 'bureauEau' | 'bureauAgriculture' | 'bureauDiaspora' | 'bureauCooperatives' | 'bureauContacts' | 'bureauCollecte' | 'bureauTaches' | 'bureauDemarches' | 'bureauReunions' | 'bureauSauvegarde' | 'presidentPilotageInterne' | 'presidentContentEditor' | 'presidentOrchid' | 'bureauMembres' | 'bureauCotisations' | 'bureauRenouvellement' | 'bureauWorkflows' | 'bureauWorkflowPublication' | 'bureauStatistiques' | 'mosquee' | 'bureauMosquee';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };
type RequestedStatus = 'habitant' | 'adherent' | 'soutien';
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

type RegistrationHistoryItem = {
  status: 'pending' | 'recommended' | 'accepted' | 'rejected';
  at: string;
  by: 'bureau' | 'president' | 'system';
};

type RegistrationRequest = {
  id: string;
  fullName: string;
  phoneWhatsApp: string;
  douarLink: string;
  requestedStatus: RequestedStatus;
  message: string;
  createdAt: string;
  status: 'pending' | 'recommended' | 'accepted' | 'rejected';
  history?: RegistrationHistoryItem[];
};

const requestStorageKey = 'agadirnetguida.registrationRequests.v2';

const text = {
  fr: {
    back: 'Retour',
    residentTitle: 'Services habitants',
    residentIntro: 'Espace simple pour suivre les informations publiques du douar sans afficher de données sensibles.',
    residentPublicNotice: 'Cette page regroupe les services publics destinés aux habitants. Les informations personnelles nécessitent une connexion.',
    terrainPrepNotice: 'Cette plateforme est en phase de préparation. Les services habitants seront actifs progressivement.',
    residentCoreTitle: 'Services essentiels',
    residentCoreIntro: 'Inscription, signalement, annonces, documents publics et eau.',
    residentMoreTitle: 'En savoir plus',
    residentMoreIntro: 'Explorer le patrimoine, la mémoire, et la vie du douar.',
    residentValidatedTitle: 'Informations validées',
    residentValidatedDesc: 'Cette zone recevra uniquement les informations publiques validées : annonces, dates, documents et messages généraux.',
    residentNoSensitiveTitle: 'Protection des données',
    residentNoSensitiveDesc: 'Pas de cotisations individuelles, pas de situations familiales, pas de remarques privées dans l\'espace habitant public.',
    residentContactTitle: 'Contact bureau',
    residentContactDesc: 'Pour une précision urgente, utilisez le canal habituel du bureau. Le système garde seulement la trace de votre demande locale.',
    residentPending: 'Demande en attente de validation',
    residentNoRequest: 'Aucune demande trouvée sur cet appareil.',
    residentStatusEmpty: 'Commencez par envoyer une demande d\'inscription. Le bureau vérifiera ensuite les informations.',
    residentStatusFound: 'Une demande existe sur cet appareil. Elle reste en attente tant que le bureau ne l\'a pas validée.',
    residentStatusLabel: 'Statut demandé',
    residentSentOn: 'Envoyée le',
    residentAskAccess: 'Faire une demande d\'inscription',
    resident: 'Habitant',
    member: 'Adhérent',
    supporter: 'Soutien',
  },
  ar: {
    back: 'رجوع',
    residentTitle: 'خدمات الساكنين',
    residentIntro: 'فضاء بسيط لمتابعة المعلومات العمومية للدوار بدون عرض البيانات الحساسة.',
    residentPublicNotice: 'تجمع هذه الصفحة الخدمات العمومية المخصصة للسكان. المعلومات الشخصية تتطلب اتصالا.',
    terrainPrepNotice: 'هذه المنصة في مرحلة التحضير. ستكون خدمات السكان نشطة تدريجيا.',
    residentCoreTitle: 'الخدمات الأساسية',
    residentCoreIntro: 'التسجيل والتبليغ والإعلانات والوثائق العمومية والماء.',
    residentMoreTitle: 'اعرف أكثر',
    residentMoreIntro: 'استكشف التراث والذاكرة وحياة الدوار.',
    residentValidatedTitle: 'معلومات مصادق عليها',
    residentValidatedDesc: 'ستتلقى هذه المنطقة فقط المعلومات العمومية المصادق عليها: الإعلانات والتواريخ والوثائق والرسائل العامة.',
    residentNoSensitiveTitle: 'حماية البيانات',
    residentNoSensitiveDesc: 'لا مساهمات فردية، لا حالات عائلية، لا ملاحظات خاصة في الفضاء العام للساكنين.',
    residentContactTitle: 'الاتصال بالمكتب',
    residentContactDesc: 'للحصول على توضيح عاجل، استخدم القناة المعتادة للمكتب. يحتفظ النظام فقط بأثر طلبك المحلي.',
    residentPending: 'طلب في انتظار التحقق',
    residentNoRequest: 'لم يتم العثور على أي طلب على هذا الجهاز.',
    residentStatusEmpty: 'ابدأ بإرسال طلب التسجيل. سيتحقق المكتب من المعلومات بعد ذلك.',
    residentStatusFound: 'يوجد طلب على هذا الجهاز. يبقى في الانتظار طالما لم يصادق عليه المكتب.',
    residentStatusLabel: 'الحالة المطلوبة',
    residentSentOn: 'أرسلت في',
    residentAskAccess: 'إرسال طلب للانخراط',
    resident: 'ساكن',
    member: 'منخرط',
    supporter: 'داعم',
  },
};

function getStoredRequests() {
  return (JSON.parse(localStorage.getItem(requestStorageKey) || '[]') as RegistrationRequest[]).map((request) => ({
    ...request,
    status: request.status || 'pending',
    history: request.history || [{ status: request.status || 'pending', at: request.createdAt, by: 'system' as const }],
  }));
}

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function statusLabel(status: RequestedStatus, t: TextBundle) {
  if (status === 'adherent') return t.member;
  if (status === 'soutien') return t.supporter;
  return t.resident;
}

function StatusItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="status-item">
      <div className="status-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
    </div>
  );
}

function accessIconForPage(page: Page): ReactNode {
  switch (page) {
    case 'inscription':
    case 'bureauInscriptions': return '📝';
    case 'signalement':
    case 'bureauSignalements': return '🔔';
    case 'annonces':
    case 'bureauAnnonces':
    case 'bureauWorkflowPublication': return '📢';
    case 'documentsPublics':
    case 'bureauDocumentsPublics':
    case 'bureauDocumentsReunion': return '📄';
    case 'eau':
    case 'bureauEau': return '💧';
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

function SpaceNav({ lang, currentRole, onNavigate }: { lang: Lang; currentRole: UserRole; onNavigate: (page: Page) => void }) {
  const allItems: AccessCard[] = [
    { page: 'habitant', title: { fr: 'Habitant', ar: 'الساكن' }, desc: { fr: 'Accès public', ar: 'ولوج عمومي' } },
    { page: 'explorer', title: { fr: 'Explorer', ar: 'استكشاف' }, desc: { fr: 'Modules publics', ar: 'الوحدات العمومية' } },
    { page: 'bureau', title: { fr: 'Bureau', ar: 'المكتب' }, desc: { fr: 'Espace interne', ar: 'فضاء داخلي' } },
    { page: 'president', title: { fr: 'Président', ar: 'الرئيس' }, desc: { fr: 'Pilotage', ar: 'القيادة' } },
  ];

  const items = allItems.filter((item) => {
    if (item.page === 'bureau' || item.page === 'president') return currentRole === item.page || currentRole === 'president';
    return true;
  });

  return (
    <nav className="space-nav" aria-label={lang === 'ar' ? 'التنقل بين الفضاءات' : 'Navigation entre les espaces'}>
      {items.map((item) => (
        <button
          className="platform-nav-card"
          type="button"
          key={item.page}
          onClick={() => onNavigate(item.page)}
        >
          <span>{accessIconForPage(item.page)}</span>
          <strong>{item.title[lang]}</strong>
          <small>{item.desc[lang]}</small>
        </button>
      ))}
    </nav>
  );
}

export default function ResidentPage({ lang, t: propsT, currentRole, onBack, onInscription, onLogin, onNavigate, onSignOut }: { lang: Lang; t: TextBundle; currentRole: UserRole; onBack: () => void; onInscription: () => void; onLogin: () => void; onNavigate: (page: Page) => void; onSignOut: () => Promise<void> }) {
  const t = propsT || text[lang];
  const auth = useAuth();
  const isHabitantAccount = Boolean(auth.user && ['habitant', 'adherent', 'soutien'].includes(auth.role || ''));
  const lastRequest = isHabitantAccount ? getStoredRequests()[0] : undefined;

  // Placeholder group - in production these should be imported from App.tsx or a shared location
  const residentPrimaryActions: AccessGroup = {
    title: { fr: 'Services essentiels', ar: 'خدمات أساسية' },
    desc: { fr: 'Inscription, signalement, annonces, documents publics et eau.', ar: 'التسجيل، التبليغ، الإعلانات، الوثائق العمومية والماء.' },
    items: [
      { page: 'inscription', title: { fr: 'Inscription', ar: 'التسجيل' }, desc: { fr: 'Demander une validation par le bureau.', ar: 'طلب التحقق من طرف المكتب.' } },
      { page: 'signalement', title: { fr: 'Signalement', ar: 'تبليغ' }, desc: { fr: 'Informer le bureau d\'un besoin simple.', ar: 'إخبار المكتب بحاجة بسيطة.' } },
      { page: 'annonces', title: { fr: 'Annonces', ar: 'الإعلانات' }, desc: { fr: 'Lire les messages officiels validés.', ar: 'قراءة الرسائل الرسمية المصادق عليها.' } },
      { page: 'documentsPublics', title: { fr: 'Documents publics', ar: 'الوثائق العمومية' }, desc: { fr: 'Consulter ce qui est public seulement.', ar: 'الاطلاع على ما هو عمومي فقط.' } },
      { page: 'eau', title: { fr: 'Eau', ar: 'الماء' }, desc: { fr: 'Suivre les informations eau et forage.', ar: 'متابعة معلومات الماء والبئر.' } },
    ],
  };

  const residentAdvancedGroups: AccessGroup[] = [];

  return (
    <section className="panel resident-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      {isHabitantAccount ? (
        <button type="button" className="logout-button" onClick={onSignOut}>
          {lang === 'ar' ? 'خروج' : 'Se déconnecter'}
        </button>
      ) : null}
      <div className="brand-mark small"><Home size={28} /></div>
      <h1>{t.residentTitle}</h1>
      <p className="intro">{t.residentIntro}</p>

      <SpaceNav lang={lang} currentRole={currentRole} onNavigate={onNavigate} />

      <p className="privacy-note"><ShieldCheck size={18} /> {t.residentPublicNotice}</p>
      <p className="privacy-note"><ShieldCheck size={18} /> {t.terrainPrepNotice}</p>

      {isHabitantAccount ? (
        <HabitantPersonalDashboard lang={lang} />
      ) : (
        <div className="resident-login-callout">
          <LockKeyhole size={24} />
          <div>
            <strong>{lang === 'ar' ? 'عندك حساب مصادق عليه؟' : 'Vous avez un compte validé ?'}</strong>
            <span>{lang === 'ar' ? 'دخل برقم الهاتف والكود ديالك.' : 'Connectez-vous avec votre téléphone et votre PIN.'}</span>
          </div>
          <button type="button" className="primary-action" onClick={onLogin}>
            {lang === 'ar' ? 'دخول الساكن' : 'Connexion habitant'}
          </button>
        </div>
      )}

      <section className="resident-primary-actions">
        <div className="access-group-heading">
          <h2>{t.residentCoreTitle}</h2>
          <p>{t.residentCoreIntro}</p>
        </div>
        <AccessGroupSection lang={lang} group={residentPrimaryActions} onNavigate={onNavigate} />
      </section>

      {isHabitantAccount ? (
        <div className="resident-summary">
          <Clock3 size={22} />
          <div>
            <strong>{lastRequest ? t.residentPending : t.residentNoRequest}</strong>
            <span>{lastRequest ? t.residentStatusFound : t.residentStatusEmpty}</span>
          </div>
        </div>
      ) : null}

      {isHabitantAccount && lastRequest ? (
        <div className="resident-request-card">
          <div>
            <span>{t.residentStatusLabel}</span>
            <strong>{statusLabel(lastRequest.requestedStatus, t)}</strong>
          </div>
          <div>
            <span>{t.residentSentOn}</span>
            <strong>{formatDate(lastRequest.createdAt, lang)}</strong>
          </div>
        </div>
      ) : null}

      <div className="resident-access-directory secondary">
        <div className="access-group-heading">
          <h2>{t.residentMoreTitle}</h2>
          <p>{t.residentMoreIntro}</p>
        </div>
        {residentAdvancedGroups.map((group) => <AccessGroupSection key={group.title.fr} lang={lang} group={group} onNavigate={onNavigate} />)}
      </div>

      <div className="resident-info-grid">
        <StatusItem icon={<Info size={20} />} title={t.residentValidatedTitle} desc={t.residentValidatedDesc} />
        <StatusItem icon={<ShieldCheck size={20} />} title={t.residentNoSensitiveTitle} desc={t.residentNoSensitiveDesc} />
        <StatusItem icon={<Phone size={20} />} title={t.residentContactTitle} desc={t.residentContactDesc} />
      </div>

      <button className="primary-action" onClick={onInscription}>{t.residentAskAccess}</button>
    </section>
  );
}
