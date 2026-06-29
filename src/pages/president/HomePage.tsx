import { ArrowLeft, Globe2, Home, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../../lib/auth/supabaseAuth';
import { useInscriptionsBadge } from '../../hooks/useInscriptionsBadge';
import type { UserRole } from '../../types/roles';

type Lang = 'fr' | 'ar';
type Page = 'home' | 'login' | 'connexionHabitant' | 'explorer' | 'bureau' | 'president' | 'presidentRecensement' | 'presidentDossiers' | 'inscription' | 'habitant' | 'aPropos' | 'annonces' | 'documentsPublics' | 'signalement' | 'douars' | 'douarDetail' | 'rejoindre' | 'memoireOrale' | 'patrimoine' | 'chronologie' | 'carteCommunautaire' | 'projets' | 'evenements' | 'jeunesse' | 'entraide' | 'eau' | 'agriculture' | 'diaspora' | 'cooperatives' | 'cotisations' | 'membres' | 'bureauInscriptions' | 'bureauAnnonces' | 'bureauDocumentsPublics' | 'bureauDocumentsReunion' | 'bureauSignalements' | 'bureauMemoireOrale' | 'bureauPatrimoine' | 'bureauPlanAction' | 'bureauChronologie' | 'bureauCarteCommunautaire' | 'bureauProjets' | 'bureauEvenements' | 'bureauJeunesse' | 'bureauEntraide' | 'bureauEau' | 'bureauAgriculture' | 'bureauDiaspora' | 'bureauCooperatives' | 'bureauContacts' | 'bureauCollecte' | 'bureauTaches' | 'bureauDemarches' | 'bureauReunions' | 'bureauSauvegarde' | 'presidentPilotageInterne' | 'presidentContentEditor' | 'presidentOrchid' | 'bureauMembres' | 'bureauCotisations' | 'bureauRenouvellement' | 'bureauWorkflows' | 'bureauWorkflowPublication' | 'bureauStatistiques' | 'mosquee' | 'bureauMosquee';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };

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

const text = {
  fr: {
    back: 'Retour',
    presidentHomeTitle: 'Espace Président',
    presidentHomeIntro: 'Pilotage général, gouvernance et supervision des modules sensibles.',
    presidentPrioritiesTitle: 'Priorités immédiates',
    presidentPrioritiesIntro: 'Accès direct aux domaines critiques pour la continuité.',
    internalPrivacy: 'Espace privé. Données sensibles. Supervision directe.',
  },
  ar: {
    back: 'رجوع',
    presidentHomeTitle: 'فضاء الرئيس',
    presidentHomeIntro: 'القيادة العامة والحكامة والإشراف على الوحدات الحساسة.',
    presidentPrioritiesTitle: 'الأولويات الفورية',
    presidentPrioritiesIntro: 'ولوج مباشر إلى المجالات الحرجة لضمان الاستمرارية.',
    internalPrivacy: 'مساحة خاصة. بيانات حساسة. إشراف مباشر.',
  },
};

const presidentGroups: AccessGroup[] = [
  {
    title: { fr: 'Pilotage', ar: 'القيادة' },
    desc: { fr: 'Vue de décision pour le président sans remplacer les décisions humaines.', ar: 'نظرة قرار للرئيس دون تعويض القرار البشري.' },
    items: [
      { page: 'bureauRenouvellement', title: { fr: 'Renouvellement association', ar: 'تجديد الجمعية' }, desc: { fr: 'Suivre le dossier administratif urgent.', ar: 'تتبع الملف الإداري المستعجل.' } },
      { page: 'bureauPlanAction', title: { fr: 'Plan action', ar: 'خطة العمل' }, desc: { fr: 'Piloter urgences, financements et responsables.', ar: 'تتبع المستعجلات والدعم والمسؤولين.' } },
      { page: 'presidentPilotageInterne', title: { fr: 'Pilotage interne', ar: 'قيادة داخلية' }, desc: { fr: 'Urgences, échéances et blocages.', ar: 'مستعجلات وآجال وتعثرات.' } },
      { page: 'presidentContentEditor', title: { fr: 'Éditeur de contenu', ar: 'محرر المحتوى' }, desc: { fr: 'Modifier les pages publiques sans redéploiement.', ar: 'تعديل الصفحات العمومية بدون إعادة النشر التقني.' } },
      { page: 'presidentRecensement', title: { fr: 'Recensement habitants', ar: 'إحصاء الساكنة' }, desc: { fr: 'Statistiques, foyers et export pour les dossiers.', ar: 'إحصائيات الأسر وتصدير الملفات.' } },
      { page: 'bureauContacts', title: { fr: 'Contacts & autorités', ar: 'الاتصالات والسلطات' }, desc: { fr: 'Préparer les appels et suivis officiels.', ar: 'تحضير الاتصالات والمتابعات الرسمية.' } },
      { page: 'bureauCollecte', title: { fr: 'Collecte terrain', ar: 'جمع معلومات الميدان' }, desc: { fr: 'Suivre les informations reçues, à vérifier ou à intégrer.', ar: 'تتبع المعلومات المستلمة أو التي يجب التحقق منها أو إدماجها.' } },
      { page: 'bureauTaches', title: { fr: 'Tâches urgentes', ar: 'مهام مستعجلة' }, desc: { fr: 'Voir responsabilités et dates limites.', ar: 'عرض المسؤوليات والآجال.' } },
      { page: 'bureauDemarches', title: { fr: 'Démarches bloquées', ar: 'إجراءات متعثرة' }, desc: { fr: 'Suivre demandes et dépôts.', ar: 'تتبع الطلبات والإيداعات.' } },
      { page: 'bureauReunions', title: { fr: 'Réunions / PV', ar: 'اجتماعات / محاضر' }, desc: { fr: 'Décisions et actions à faire.', ar: 'قرارات وأعمال مطلوبة.' } },
      { page: 'bureauDocumentsReunion', title: { fr: 'Documents de réunion', ar: 'وثائق الاجتماع' }, desc: { fr: 'Préparer les supports à valider et imprimer.', ar: 'تحضير الوثائق للمصادقة والطباعة.' } },
      { page: 'bureauStatistiques', title: { fr: 'Statistiques', ar: 'الإحصائيات' }, desc: { fr: 'Indicateurs simples de la plateforme.', ar: 'مؤشرات بسيطة للمنصة.' } },
      { page: 'bureauCotisations', title: { fr: 'Cotisation Imam', ar: 'مساهمة الإمام' }, desc: { fr: 'Superviser foyers, retards et montants collectés.', ar: 'تتبع الأسر والتأخر والمبالغ المحصلة.' } },
      { page: 'bureauWorkflows', title: { fr: 'Workflows', ar: 'مسارات المصادقة' }, desc: { fr: 'Suivi des décisions et validations.', ar: 'تتبع القرارات والمصادقات.' } },
    ],
  },
  {
    title: { fr: 'Gouvernance', ar: 'الحكامة' },
    desc: { fr: 'Préparer la gouvernance, les permissions et les modules sensibles.', ar: 'تهيئة الحكامة والصلاحيات والوحدات الحساسة.' },
    items: [
      { page: 'bureauWorkflows', title: { fr: 'Permissions', ar: 'الصلاحيات' }, desc: { fr: 'Architecture préparée, authentification future requise.', ar: 'بنية مهيأة ومصادقة مستقبلية مطلوبة.' } },
      { page: 'bureauCotisations', title: { fr: 'Cotisations sensibles', ar: 'مساهمات حساسة' }, desc: { fr: 'Lecture interne sans exposition publique.', ar: 'قراءة داخلية بدون عرض عمومي.' } },
      { page: 'bureauMosquee', title: { fr: 'Modules sensibles', ar: 'الوحدات الحساسة' }, desc: { fr: 'Accès séparé aux espaces délicats.', ar: 'ولوج منفصل للفضاءات الحساسة.' } },
      { page: 'bureauWorkflows', title: { fr: 'Gouvernance', ar: 'الحكامة' }, desc: { fr: 'Historique et continuité des décisions.', ar: 'سجل واستمرارية القرارات.' } },
    ],
  },
];

const presidentPriorityCards: AccessCard[] = [
  { page: 'presidentRecensement', title: { fr: 'Recensement', ar: 'إحصاء الساكنة' }, desc: { fr: 'Habitants validés, demandes et export CSV.', ar: 'الساكنة المصادق عليها والطلبات والتصدير.' } },
  { page: 'presidentOrchid', title: { fr: 'ORCHID', ar: 'أوركيد' }, desc: { fr: 'Assistant IA demo pour orienter les decisions.', ar: 'مساعد تجريبي لتوجيه القرارات.' } },
  { page: 'presidentDossiers', title: { fr: 'Dossiers stratégiques', ar: 'الملفات الاستراتيجية' }, desc: { fr: 'Financements, statuts internationaux, courriers.', ar: 'التمويلات والحالات الدولية والمراسلات.' } },
  { page: 'bureauPlanAction', title: { fr: 'Plan action', ar: 'خطة العمل' }, desc: { fr: 'Suivi des urgences et financements.', ar: 'تتبع المستعجلات والدعم.' } },
  { page: 'bureauRenouvellement', title: { fr: 'Renouvellement association', ar: 'تجديد الجمعية' }, desc: { fr: 'Priorité administrative du moment, sans pièces sensibles.', ar: 'أولوية إدارية حالية بدون وثائق حساسة.' } },
  { page: 'presidentPilotageInterne', title: { fr: 'Pilotage interne', ar: 'قيادة داخلية' }, desc: { fr: 'Synthèse des urgences internes.', ar: 'ملخص المستعجلات الداخلية.' } },
  { page: 'presidentContentEditor', title: { fr: 'Éditeur public', ar: 'المحرر العمومي' }, desc: { fr: 'Publier textes, audios et images.', ar: 'نشر النصوص والصوت والصور.' } },
  { page: 'bureauContacts', title: { fr: 'Contacts & autorités', ar: 'الاتصالات والسلطات' }, desc: { fr: 'Coordonner les interlocuteurs utiles.', ar: 'تنسيق الجهات المفيدة.' } },
  { page: 'bureauInscriptions', title: { fr: 'Demandes à valider', ar: 'طلبات للمصادقة' }, desc: { fr: 'Vérifier les inscriptions avant décision humaine.', ar: 'التحقق من التسجيلات قبل القرار البشري.' } },
  { page: 'bureauSignalements', title: { fr: 'Signalements ouverts', ar: 'تبليغات مفتوحة' }, desc: { fr: 'Suivre les besoins importants du terrain.', ar: 'تتبع الحاجيات المهمة في الميدان.' } },
  { page: 'bureauCotisations', title: { fr: 'Cotisation Imam', ar: 'مساهمة الإمام' }, desc: { fr: 'Foyers, retards et reste à collecter.', ar: 'الأسر والتأخر والباقي للتحصيل.' } },
  { page: 'bureauDocumentsPublics', title: { fr: 'Documents importants', ar: 'وثائق مهمة' }, desc: { fr: 'Contrôler ce qui peut devenir public.', ar: 'مراقبة ما يمكن أن يصبح عموميا.' } },
  { page: 'bureauDocumentsReunion', title: { fr: 'Documents réunion', ar: 'وثائق الاجتماع' }, desc: { fr: 'Synthèses à valider ou imprimer.', ar: 'خلاصات للمصادقة أو الطباعة.' } },
  { page: 'bureauStatistiques', title: { fr: 'Suivi global', ar: 'تتبع عام' }, desc: { fr: 'Lire les indicateurs simples sans temps réel.', ar: 'قراءة مؤشرات بسيطة بدون تتبع آني.' } },
];

function spaceForPage(page: Page): 'public' | 'habitant' | 'bureau' | 'president' {
  if (page === 'president' || page.startsWith('president')) return 'president';
  if (page === 'habitant') return 'habitant';
  if (page === 'bureau' || page.startsWith('bureau') || page === 'membres' || page === 'cotisations' || page === 'mosquee' || page === 'presidentDossiers') return 'president';
  return 'public';
}

function canShowSpace(space: 'public' | 'habitant' | 'bureau' | 'president', role: UserRole) {
  if (space === 'bureau') return role === 'bureau' || role === 'president';
  if (space === 'president') return role === 'president';
  return true;
}

function visibleSpaceItems(current: Page, currentRole: UserRole) {
  const activeSpace = spaceForPage(current);
  const allItems = [
    { space: 'public' as const, page: 'explorer' as Page },
    { space: 'habitant' as const, page: 'habitant' as Page },
    { space: 'bureau' as const, page: 'bureau' as Page },
    { space: 'president' as const, page: 'president' as Page },
  ];

  return allItems.filter((item) => {
    if (!canShowSpace(item.space, currentRole)) return false;
    if (activeSpace === 'bureau') return item.space === 'bureau' || (currentRole === 'president' && item.space === 'president');
    if (activeSpace === 'president') return item.space === 'president' || item.space === 'bureau';
    return item.space === 'public' || item.space === 'habitant';
  });
}

function accessIconForPage(page: Page): ReactNode {
  switch (page) {
    case 'habitant': return '🏠';
    case 'explorer': return '🌍';
    case 'bureau': return '🏢';
    case 'president': return '🎖️';
    case 'presidentRecensement': return '📊';
    case 'inscription':
    case 'bureauInscriptions': return '📝';
    case 'annonces':
    case 'bureauAnnonces':
    case 'bureauWorkflowPublication': return '📢';
    case 'documentsPublics':
    case 'bureauDocumentsPublics':
    case 'bureauDocumentsReunion': return '📄';
    case 'signalement':
    case 'bureauSignalements': return '🔔';
    case 'douars': return '🏘️';
    case 'douarDetail': return '📍';
    case 'rejoindre': return '➕';
    case 'membres':
    case 'bureauMembres': return '👥';
    case 'cotisations':
    case 'bureauCotisations': return '💰';
    case 'bureauRenouvellement': return '📋';
    case 'bureauContacts': return '☎️';
    case 'bureauCollecte': return '📥';
    case 'bureauTaches': return '⏱️';
    case 'bureauPlanAction': return '🧭';
    case 'bureauDemarches': return '✉️';
    case 'bureauReunions': return '👥';
    case 'bureauSauvegarde': return '💾';
    case 'presidentPilotageInterne': return '🎯';
    case 'presidentOrchid': return '🏔️';
    case 'bureauWorkflows': return '🔁';
    case 'bureauStatistiques': return '📊';
    case 'mosquee':
    case 'bureauMosquee': return '🕌';
    case 'patrimoine':
    case 'bureauPatrimoine': return '🏛️';
    case 'eau':
    case 'bureauEau': return '💧';
    case 'agriculture':
    case 'bureauAgriculture': return '🌿';
    case 'entraide':
    case 'bureauEntraide': return '🤝';
    case 'diaspora':
    case 'bureauDiaspora': return '🌍';
    default: return '📄';
  }
}

function AccessGroupSection({ lang, group, onNavigate, badges }: { lang: Lang; group: AccessGroup; onNavigate: (page: Page) => void; badges?: Partial<Record<Page, number>> }) {
  return (
    <section className="access-group">
      <div className="access-group-heading">
        <h2>{group.title[lang]}</h2>
        <p>{group.desc[lang]}</p>
      </div>
      <div className="access-card-grid">
        {group.items.map((item) => {
          const badgeCount = badges?.[item.page] ?? 0;
          return (
            <button className="access-card platform-card" type="button" key={`${item.page}-${item.title.fr}`} onClick={() => onNavigate(item.page)}>
              <span className="access-card-icon">
                {accessIconForPage(item.page)}
                {badgeCount > 0 ? <span className="notif-badge">{badgeCount > 99 ? '99+' : badgeCount}</span> : null}
              </span>
              <strong>{item.title[lang]}</strong>
              <small>{item.desc[lang]}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SpaceNav({ lang, current, currentRole, onNavigate }: { lang: Lang; current: Page; currentRole: UserRole; onNavigate: (page: Page) => void }) {
  const allItems: AccessCard[] = [
    { page: 'habitant', title: { fr: 'Habitant', ar: 'الساكن' }, desc: { fr: 'Accès public', ar: 'ولوج عمومي' } },
    { page: 'explorer', title: { fr: 'Explorer', ar: 'استكشاف' }, desc: { fr: 'Modules publics', ar: 'الوحدات العمومية' } },
    { page: 'bureau', title: { fr: 'Bureau', ar: 'المكتب' }, desc: { fr: 'Espace interne', ar: 'فضاء داخلي' } },
    { page: 'president', title: { fr: 'Président', ar: 'الرئيس' }, desc: { fr: 'Pilotage', ar: 'القيادة' } },
  ];
  const visiblePages = new Set(visibleSpaceItems(current, currentRole).map((item) => item.page));
  const items = allItems.filter((item) => visiblePages.has(item.page));

  return (
    <nav className="space-nav" aria-label={lang === 'ar' ? 'التنقل بين الفضاءات' : 'Navigation entre les espaces'}>
      {items.map((item) => (
        <button
          className={item.page === current ? 'active platform-nav-card' : 'platform-nav-card'}
          type="button"
          key={item.page}
          onClick={() => onNavigate(item.page)}
          aria-current={item.page === current ? 'page' : undefined}
        >
          <span>{accessIconForPage(item.page)}</span>
          <strong>{item.title[lang]}</strong>
          <small>{item.desc[lang]}</small>
        </button>
      ))}
    </nav>
  );
}

export default function PresidentHomePage({ lang, t: propsT, currentRole, onBack, onNavigate, onSignOut }: { lang: Lang; t: TextBundle; currentRole: UserRole; onBack: () => void; onNavigate: (page: Page) => void; onSignOut: () => Promise<void> }) {
  const t = propsT || text[lang];
  const auth = useAuth();
  const { badge: inscriptionBadge, clearBadge } = useInscriptionsBadge(auth.role);
  const inscriptionBadges: Partial<Record<Page, number>> = inscriptionBadge > 0 ? { bureauInscriptions: inscriptionBadge } : {};

  function handleNavigate(page: Page) {
    if (page === 'bureauInscriptions') clearBadge();
    onNavigate(page);
  }

  return (
    <section className="panel access-page president-entry-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      {auth.user ? (
        <button type="button" className="logout-button" onClick={onSignOut}>
          {lang === 'ar' ? 'خروج' : 'Se déconnecter'}
        </button>
      ) : null}
      <div className="brand-mark small"><ShieldCheck size={28} /></div>
      <h1>{t.presidentHomeTitle}</h1>
      <p className="intro">{t.presidentHomeIntro}</p>
      <SpaceNav lang={lang} current="president" currentRole={currentRole} onNavigate={handleNavigate} />
      <p className="privacy-note"><LockKeyhole size={18} /> {t.internalPrivacy}</p>
      <section className="president-priorities">
        <div className="access-group-heading">
          <h2>{t.presidentPrioritiesTitle}</h2>
          <p>{t.presidentPrioritiesIntro}</p>
        </div>
        <div className="priority-card-grid">
          {presidentPriorityCards.map((item) => {
            const badgeCount = inscriptionBadges[item.page] ?? 0;
            return (
              <button className="access-card priority-card" type="button" key={`${item.page}-${item.title.fr}`} onClick={() => handleNavigate(item.page)}>
                <span className="access-card-icon">
                  {accessIconForPage(item.page)}
                  {badgeCount > 0 ? <span className="notif-badge">{badgeCount > 99 ? '99+' : badgeCount}</span> : null}
                </span>
                <strong>{item.title[lang]}</strong>
                <small>{item.desc[lang]}</small>
              </button>
            );
          })}
        </div>
      </section>
      {presidentGroups.map((group) => <AccessGroupSection key={group.title.fr} lang={lang} group={group} onNavigate={handleNavigate} badges={inscriptionBadges} />)}
    </section>
  );
}
