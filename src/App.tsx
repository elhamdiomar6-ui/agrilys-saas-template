import { ArrowLeft, Bell, CheckCircle2, ClipboardList, Clock3, Download, FileText, Globe2, Home, Info, Link2, LockKeyhole, Megaphone, MessageSquareText, Phone, ShieldCheck, ThumbsUp, UserRound, UsersRound, XCircle } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AudioHelp from './components/AudioHelp';
import CardListenButton from './components/CardListenButton';
import EditorialPageImage from './components/EditorialPageImage';
import { PlatformDock, AccessGroupSection, SpaceNav } from './components/layout/NavigationComponents';
import { siteConfig } from './config/site';
import { explorerEditorialCopy, homeEditorialCopy, loginEditorialCopy, residentEditorialCopy } from './data/appEditorialCopies';
import { canAccessRoute } from './lib/permissions';
import { usePublicEditorialCopy } from './lib/publicEditorialContent';
import { useAuth } from './lib/auth/supabaseAuth';
import { approveHabitantRequest, rejectHabitantRequest, recommendHabitantRequest } from './lib/habitants';
import { createRegistrationRequest, fetchRegistrationRequests } from './lib/mvpSupabase';
import HabitantPersonalDashboard from './components/HabitantPersonalDashboard';
import MarocRegionsMap from './components/MarocRegionsMap';
import RoyalSpeechPlayer from './components/RoyalSpeechPlayer';
import WhatsAppMessageCard from './components/WhatsAppMessageCard';
import PinConfirmationModal from './components/PinConfirmationModal';
import AProposPage from './pages/APropos';
import AgriculturePage from './pages/Agriculture';
import DiasporaPage from './pages/Diaspora';
import CooperativesPage from './pages/Cooperatives';
import CarteCommunautairePage from './pages/CarteCommunautaire';
import AnnoncesPage from './pages/Annonces';
import ChronologiePage from './pages/Chronologie';
import CotisationsPage from './pages/Cotisations';
import BureauAnnoncesPage from './pages/BureauAnnonces';
import BureauAgriculturePage from './pages/BureauAgriculture';
import BureauDiasporaPage from './pages/BureauDiaspora';
import BureauCooperativesPage from './pages/BureauCooperatives';
import BureauChronologiePage from './pages/BureauChronologie';
import BureauCollecteTerrainPage from './pages/BureauCollecteTerrain';
import BureauContactsAutoritesPage from './pages/BureauContactsAutorites';
import BureauDemarchesAdministrativesPage from './pages/BureauDemarchesAdministratives';
import BureauCarteCommunautairePage from './pages/BureauCarteCommunautaire';
import BureauCotisationsPage from './pages/BureauCotisations';
import BureauDocumentsPublicsPage from './pages/BureauDocumentsPublics';
import BureauDocumentsReunionPage from './pages/BureauDocumentsReunion';
import BureauEauPage from './pages/BureauEau';
import BureauEvenementsPage from './pages/BureauEvenements';
import BureauEntraidePage from './pages/BureauEntraide';
import BureauJeunessePage from './pages/BureauJeunesse';
import BureauMemoireOralePage from './pages/BureauMemoireOrale';
import BureauMembresPage from './pages/BureauMembres';
import BureauRenouvellementAssociationPage from './pages/BureauRenouvellementAssociation';
import BureauPatrimoinePage from './pages/BureauPatrimoine';
import BureauPlanActionPage from './pages/BureauPlanAction';
import BureauProjetsPage from './pages/BureauProjets';
import BureauSignalementsPage from './pages/BureauSignalements';
import BureauSauvegardeLocalePage from './pages/BureauSauvegardeLocale';
import BureauStatistiquesPage from './pages/BureauStatistiques';
import BureauTachesInternesPage from './pages/BureauTachesInternes';
import BureauWorkflowPublicationPage from './pages/BureauWorkflowPublication';
import BureauWorkflowsPage from './pages/BureauWorkflows';
import BureauReunionsDecisionsPage from './pages/BureauReunionsDecisions';
import OrchidDirecteurPage from './pages/OrchidDirecteur';
import PresidentPilotageInternePage from './pages/PresidentPilotageInterne';
import PresidentContentEditorPage from './pages/PresidentContentEditor';
import PresidentRecensementPage from './pages/PresidentRecensement';
import PresidentDossiersStrategiquesPage from './pages/PresidentDossiersStrategiques';
import HabitantLoginPage from './pages/HabitantLogin';
import DocumentsPublicsPage from './pages/DocumentsPublics';
import DouarDetailPage from './pages/DouarDetail';
import DouarsPage from './pages/Douars';
import EauPage from './pages/Eau';
import EvenementsPage from './pages/Evenements';
import EntraidePage from './pages/Entraide';
import JeunessePage from './pages/Jeunesse';
import MemoireOralePage from './pages/MemoireOrale';
import MembresPage from './pages/Membres';
import PatrimoinePage from './pages/Patrimoine';
import ProjetsPage from './pages/Projets';
import RejoindrePage from './pages/Rejoindre';
import SignalementPage from './pages/Signalement';
import MosqueePage from './pages/Mosquee';
import SiteLockPage from './pages/auth/SiteLockPage';
import LoginPage from './pages/auth/LoginPage';
import BureauInscriptionsPage from './pages/bureau/InscriptionsPage';
import PresidentHomePage from './pages/president/HomePage';
import ResidentPage from './pages/habitant/HomePage';
import HomePage from './pages/public/HomePage';
import ExplorerPage from './pages/public/ExplorerPage';
import InscriptionPage from './pages/public/InscriptionPage';

import type { RoutePath, UserRole } from './types/roles';
import { useInscriptionsBadge } from './hooks/useInscriptionsBadge';
import { getInitialPage, routeForPage, pageForRole, type Page } from './lib/routing/pageRouting';
import { ProtectedInternalRoute, LoginRequiredPanel, BureauModuleLocked, InternalModuleLocked } from './components/access/AccessControl';
import { readGeneratedPinNotices, saveGeneratedPinNotices, isSiteLockSessionValid, setSiteLockSession, clearSiteLockSession, getStoredRequests, saveStoredRequests, persistRequest, mergeRegistrationRequests, updateStoredRequestStatus, type RegistrationRequest, type RegistrationHistoryItem, type RequestedStatus, type RequestDecision, type GeneratedPinNotice } from './lib/storage/localStorage';

type Lang = 'fr' | 'ar';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };




const text = {
  fr: {
    badge: 'Version locale sobre',
    title: 'Registre Communautaire Du Douar',
    subtitle: "Agadir n'tguida",
    intro: "Le portail officiel pour les services habitants, les annonces, le patrimoine et le contact avec l'association.",
    platformVisionTitle: 'Vision générale',
    platformVisionText1: "AGADIRNETGUIDA est d'abord la plateforme officielle du douar Agadir N'Tguida. Elle permet de présenter le village, d'organiser les services habitants, de valoriser le patrimoine local, de suivre les projets communautaires et de renforcer le travail de l'association.",
    platformVisionText2: "Cette plateforme a été créée pour servir notre communauté : faciliter la vie associative, préserver notre patrimoine culturel et architectural, faciliter la communication entre les familles du douar, et donner à chaque habitant un accès simple et transparent aux informations qui le concernent.",
    platformVisionText3: "Elle reflète notre engagement collectif pour le développement de notre douar, dans le respect de nos valeurs et de notre histoire.",
    explorerVisionNote: "Agadir N'Tguida est un douar riche de son patrimoine, de sa mémoire collective et du lien qui unit ses habitants, qu'ils vivent ici ou loin d'ici.",
    requestAccess: 'Demander une inscription',
    residentSpace: 'Services habitants',
    aboutCta: 'À propos',
    publicAnnouncementsCta: 'Annonces publiques',
    publicDocumentsCta: 'Documents publics',
    publicReportCta: 'Faire un signalement',
    publicHeritageCta: 'Patrimoine',
    explorePlatform: 'Explorer la plateforme',
    bureauEntry: 'Connexion Bureau',
    presidentEntry: 'Connexion Président',
    officialNotice: 'Accès bureau et président',
    officialNoticeDesc: 'Les espaces internes restent séparés de la demande publique.',
    publicInfo: 'Information publique',
    publicInfoDesc: 'Les habitants voient seulement les informations générales validées.',
    noDemo: 'Aucun compte demo visible en production.',
    noPin: 'Aucun PIN par défaut public.',
    inscriptionTitle: 'Demande d\'inscription',
    inscriptionIntro: 'Formulaire public simple pour habitants, adhérents ou personnes de soutien liées au douar.',
    fullName: 'Nom complet',
    phoneWhatsApp: 'Téléphone WhatsApp',
    douarLink: 'Lien avec le douar',
    requestedStatus: 'Statut demandé',
    resident: 'Habitant',
    member: 'Adhérent',
    supporter: 'Soutien',
    optionalMessage: 'Message facultatif',
    submit: 'Envoyer la demande',
    required: 'Nom complet, téléphone WhatsApp, lien avec le douar et statut sont obligatoires.',
    successTitle: 'Demande envoyée',
    successDesc: 'Votre demande a été envoyée. Le bureau la vérifiera avant validation.',
    back: 'Retour',
    footer: 'Association de Coopération et Développement - Agadir n\'tguida',
    publicUrl: 'Lien officiel',
    officialEmail: 'Email officiel',
    residentTitle: 'Services habitants',
    residentIntro: 'Espace simple pour suivre les informations publiques du douar sans afficher de données sensibles.',
    residentPublicNotice: 'Cette page regroupe les services publics destinés aux habitants. Les informations personnelles nécessitent une connexion.',
    residentPending: 'Demande en attente de validation',
    residentNoRequest: 'Aucune demande trouvée sur cet appareil.',
    residentAskAccess: 'Faire une demande d\'inscription',
    residentPublicAnnouncements: 'Annonces publiques',
    residentPublicAnnouncementsDesc: 'Les annonces officielles validées par le bureau apparaîtront ici.',
    residentDocuments: 'Documents publics',
    residentDocumentsDesc: 'Les documents publics et non sensibles seront affichés après validation.',
    residentRequests: 'Demandes au bureau',
    residentRequestsDesc: 'Un formulaire simple de demande sera ajouté après validation du workflow.',
    residentPrivacy: 'Aucune information financière, familiale ou privée n\'est affichée dans cet espace public.',
    residentStatusTitle: 'Suivi de ma demande',
    residentStatusEmpty: 'Commencez par envoyer une demande d\'inscription. Le bureau vérifiera ensuite les informations.',
    residentStatusFound: 'Une demande existe sur cet appareil. Elle reste en attente tant que le bureau ne l\'a pas validée.',
    residentStatusLabel: 'Statut demandé',
    residentSentOn: 'Envoyée le',
    residentContactTitle: 'Contact bureau',
    residentContactDesc: 'Pour une précision urgente, utilisez le canal habituel du bureau. Le système garde seulement la trace de votre demande locale.',
    residentValidatedTitle: 'Informations validées',
    residentValidatedDesc: 'Cette zone recevra uniquement les informations publiques validées : annonces, dates, documents et messages généraux.',
    residentNoSensitiveTitle: 'Protection des données',
    residentNoSensitiveDesc: 'Pas de cotisations individuelles, pas de situations familiales, pas de remarques privées dans l\'espace habitant public.',
    bureauTitle: 'Demandes d\'inscription',
    presidentHomeTitle: 'Espace Président',
    presidentHomeIntro: 'Pilotage général, gouvernance et supervision des modules sensibles.',
    bureauHomeTitle: 'Entrée Bureau',
    bureauHomeIntro: 'Tableau d\'accès interne vers les modules du bureau et de la présidence.',
    bureauAnnouncementsTitle: 'Gestion des annonces publiques',
    bureauPublicDocumentsTitle: 'Gestion des documents publics',
    bureauReportsTitle: 'Signalements habitants',
    bureauOralMemoryTitle: 'Gestion de la mémoire orale',
    bureauHeritageTitle: 'Gestion du patrimoine',
    bureauTimelineTitle: 'Gestion de la chronologie historique',
    bureauCommunityMapTitle: 'Gestion de la carte communautaire',
    projectsTitle: 'Projets communautaires',
    bureauProjectsTitle: 'Gestion des projets communautaires',
    eventsTitle: 'Evenements communautaires',
    bureauEventsTitle: 'Gestion des evenements communautaires',
    youthTitle: 'Jeunesse et initiatives locales',
    bureauYouthTitle: 'Gestion jeunesse et initiatives locales',
    solidarityTitle: 'Entraide sociale',
    bureauSolidarityTitle: 'Gestion entraide sociale',
    waterTitle: 'Eau et forage',
    bureauWaterTitle: 'Gestion eau et forage',
    agricultureTitle: 'Agriculture et terres communautaires',
    diasporaTitle: 'Diaspora et soutien externe',
    cooperativesTitle: 'Cooperatives et economie locale',
    bureauAgricultureTitle: 'Gestion agriculture et terres communautaires',
    bureauDiasporaTitle: 'Gestion diaspora et soutien externe',
    bureauCooperativesTitle: 'Gestion cooperatives et economie locale',
    membersTitle: 'Gestion membres',
    bureauMembersTitle: 'Gestion avancée des membres',
    contributionsTitle: 'Gestion cotisations',
    bureauContributionsTitle: 'Cotisation Imam / École coranique',
    bureauRenewalTitle: 'Renouvellement association',
    bureauContactsTitle: 'Contacts & autorités',
    bureauTasksTitle: 'Tâches & échéances internes',
    bureauPlanActionTitle: 'Plan action association',
    bureauProceduresTitle: 'Courriers & démarches administratives',
    bureauMeetingsTitle: 'Réunions, PV et décisions',
    bureauBackupTitle: 'Sauvegarde locale provisoire',
    presidentSteeringTitle: 'Pilotage interne Président',
    bureauWorkflowsTitle: 'Workflow validation complet',
    bureauStatisticsTitle: 'Tableau statistiques simple',
    bureauIntro: 'Espace interne Bureau/Président pour consulter les demandes et conserver une décision simple.',
    bureauLockedTitle: 'Module interne non activé',
    bureauLockedDesc: 'Cette route est réservée au Bureau et au Président. Elle reste fermée tant que les modules internes ne sont pas activés.',
    accessDeniedTitle: 'Accès non autorisé',
    accessDeniedDesc: 'Votre rôle actuel ne permet pas d\'ouvrir cette route interne.',
    accessDeniedNote: 'Ce contrôle prépare l\'architecture. Il ne remplace pas une authentification backend réelle.',
    internalReservedTitle: 'Accès interne réservé',
    internalReservedDesc: 'Authentification future requise. Les modules internes restent bloqués en production même si l\'option de démonstration est activée.',
    localDemoAccess: 'Mode démonstration local : accès interne possible uniquement en développement.',
    demoPresentationBanner: 'Mode démonstration - données fictives, accès non officiel',
    platformNavigation: 'Navigation de la plateforme',
    platformPublic: 'Public',
    platformPublicHint: 'Modules ouverts',
    platformResident: 'Services',
    platformResidentHint: 'Public habitants',
    platformBureau: 'Bureau',
    platformBureauHint: 'Interne',
    platformPresident: 'Président',
    platformPresidentHint: 'Pilotage',
    mosqueTitle: 'Mosquée et enseignement coranique',
    totalRequests: 'Total demandes',
    pendingRequests: 'En attente',
    acceptedRequests: 'Acceptées',
    rejectedRequests: 'Refusées',
    recommendedRequests: 'Recommandées',
    noRequests: 'Aucune demande reçue pour le moment.',
    pending: 'En attente',
    recommended: 'Recommandée',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    recommend: 'Recommander',
    accept: 'Accepter',
    reject: 'Refuser',
    applicant: 'Demandeur',
    sentAt: 'Date demande',
    decisionHistory: 'Historique',
    presidentDecision: 'Décision Président',
    internalPrivacy: 'Les informations de cette page sont internes et ne doivent pas être affichées publiquement.',
    terrainPrepNotice: 'Version de préparation : les données réelles, l\'authentification et la base Supabase seront activées après validation.',
    homeCapabilitiesTitle: 'Services publics du douar',
    homeCapabilitiesIntro: 'Informations utiles, démarches simples et contenus validés, sans données sensibles.',
    homeCapabilityInform: 'Informer les habitants',
    homeCapabilityReports: 'Recevoir les signalements',
    homeCapabilityDocuments: 'Organiser les documents publics',
    homeCapabilityGovernance: 'Préparer la gouvernance locale',
    homeCapabilitySecurity: 'Protéger les données sensibles avec Auth/Supabase après validation',
    terrainPathTitle: 'Actions principales',
    residentCoreTitle: 'Services publics',
    residentCoreIntro: "Choisissez l'action utile. Les données personnelles restent protégées.",
    residentMoreTitle: 'Explorer le douar',
    residentMoreIntro: 'Patrimoine, mémoire et initiatives publiques validées.',
    presidentPrioritiesTitle: 'Priorités du moment',
    presidentPrioritiesIntro: 'Vue de décision préparatoire : à utiliser comme guide, sans données backend réelles pour l\'instant.',
    presidentDossiersTitle: 'Dossiers stratégiques',
    presidentDossiersDesc: 'Traçabilité financements, statuts internationaux, courriers officiels',
    priorityRegistrations: 'Demandes à valider',
    priorityReports: 'Signalements ouverts',
    priorityDocuments: 'Documents importants',
    priorityGlobal: 'Suivi global',
  },
  ar: {
    badge: 'نسخة محلية هادئة',
    title: 'السجل الجماعي للدوار',
    subtitle: 'أگدير نتگيدا',
    intro: 'البوابة الرسمية لخدمات الساكنة والإعلانات والتراث والتواصل مع الجمعية.',
    platformVisionTitle: 'الرؤية العامة',
    platformVisionText1: 'تعتبر منصة AGADIRNETGUIDA أولا المنصة الرسمية لدوار أكادير نتكيدا. فهي تساعد على تقديم الدوار، وتنظيم خدمات الساكنة، وتثمين التراث المحلي، وتتبع المشاريع الجماعية، وتقوية عمل الجمعية.',
    platformVisionText2: 'تم إنشاء هذه المنصة لخدمة جماعتنا: تسهيل العمل الجمعوي، حفظ التراث الثقافي والمعماري، تسهيل التواصل بين عائلات الدوار، وتمكين كل ساكن من الوصول البسيط والواضح إلى المعلومات التي تهمه.',
    platformVisionText3: 'تعكس هذه المنصة التزامنا الجماعي بتنمية دوارنا، مع احترام قيمنا وتاريخنا.',
    explorerVisionNote: 'أكادير نتكيدا دوار غني بتراثه وذاكرته الجماعية والرابط الذي يجمع أبناءه، سواء عاشوا هنا أو بعيدا عن الدوار.',
    requestAccess: 'طلب التسجيل',
    residentSpace: 'خدمات الساكنة',
    aboutCta: 'حول الدوار والجمعية',
    publicAnnouncementsCta: 'الإعلانات العمومية',
    publicDocumentsCta: 'الوثائق العمومية',
    publicReportCta: 'إرسال تبليغ',
    publicHeritageCta: 'التراث',
    explorePlatform: 'استكشاف المنصة',
    bureauEntry: 'ولوج المكتب',
    presidentEntry: 'ولوج الرئيس',
    officialNotice: 'ولوج المكتب والرئيس',
    officialNoticeDesc: 'المساحات الداخلية منفصلة عن طلب التسجيل العمومي.',
    publicInfo: 'معلومات عمومية',
    publicInfoDesc: 'السكان يرون فقط المعلومات العامة المصادق عليها.',
    noDemo: 'لا توجد حسابات تجريبية ظاهرة في الإنتاج.',
    noPin: 'لا يوجد رمز PIN افتراضي منشور.',
    inscriptionTitle: 'طلب التسجيل',
    inscriptionIntro: 'استمارة عمومية بسيطة للسكان أو المنخرطين أو الداعمين المرتبطين بالدوار.',
    fullName: 'الاسم الكامل',
    phoneWhatsApp: 'رقم واتساب',
    douarLink: 'العلاقة مع الدوار',
    requestedStatus: 'الصفة المطلوبة',
    resident: 'ساكن',
    member: 'منخرط',
    supporter: 'داعم',
    optionalMessage: 'رسالة اختيارية',
    submit: 'إرسال الطلب',
    required: 'الاسم الكامل ورقم واتساب والعلاقة مع الدوار والصفة المطلوبة ضرورية.',
    successTitle: 'تم إرسال الطلب',
    successDesc: 'تم إرسال طلبكم. سيقوم المكتب بالتحقق منه قبل المصادقة.',
    back: 'رجوع',
    footer: 'جمعية التعاون والتنمية - أگدير نتگيدا',
    publicUrl: 'الرابط الرسمي',
    officialEmail: 'البريد الرسمي',
    residentTitle: 'خدمات الساكنة',
    residentIntro: 'فضاء بسيط لمتابعة المعلومات العمومية الخاصة بالدوار دون عرض أي بيانات حساسة.',
    residentPublicNotice: 'هذه الصفحة تجمع الخدمات العمومية الموجهة للساكنة. المعلومات الشخصية تحتاج إلى تسجيل الدخول.',
    residentPending: 'الطلب في انتظار المصادقة',
    residentNoRequest: 'لا يوجد أي طلب مسجل في هذا الجهاز.',
    residentAskAccess: 'إرسال طلب التسجيل',
    residentPublicAnnouncements: 'الإعلانات العمومية',
    residentPublicAnnouncementsDesc: 'ستظهر هنا الإعلانات الرسمية المصادق عليها من طرف المكتب.',
    residentDocuments: 'الوثائق العمومية',
    residentDocumentsDesc: 'ستعرض الوثائق العمومية وغير الحساسة بعد المصادقة.',
    residentRequests: 'طلبات إلى المكتب',
    residentRequestsDesc: 'سيتم إضافة استمارة بسيطة للطلبات بعد اعتماد المسار التنظيمي.',
    residentPrivacy: 'لا يتم عرض أي معلومات مالية أو عائلية أو خاصة في هذا الفضاء العمومي.',
    residentStatusTitle: 'تتبع طلبي',
    residentStatusEmpty: 'ابدأ بإرسال طلب التسجيل. بعد ذلك يقوم المكتب بالتحقق من المعلومات.',
    residentStatusFound: 'يوجد طلب مسجل في هذا الجهاز. يبقى في الانتظار إلى حين مصادقة المكتب.',
    residentStatusLabel: 'الصفة المطلوبة',
    residentSentOn: 'أرسل بتاريخ',
    residentContactTitle: 'التواصل مع المكتب',
    residentContactDesc: 'لأي توضيح مستعجل، استعمل القناة المعتادة مع المكتب. النظام يحتفظ فقط بأثر الطلب المحلي.',
    residentValidatedTitle: 'معلومات مصادق عليها',
    residentValidatedDesc: 'هذه المنطقة مخصصة فقط للمعلومات العمومية المصادق عليها: الإعلانات، التواريخ، الوثائق والرسائل العامة.',
    residentNoSensitiveTitle: 'حماية المعطيات',
    residentNoSensitiveDesc: 'لا توجد مساهمات فردية، ولا أوضاع عائلية، ولا ملاحظات خاصة في فضاء الساكنة العمومي.',
    bureauTitle: 'طلبات التسجيل',
    presidentHomeTitle: 'فضاء الرئيس',
    presidentHomeIntro: 'قيادة عامة وحكامة وتتبع الوحدات الحساسة.',
    bureauHomeTitle: 'مدخل المكتب',
    bureauHomeIntro: 'لوحة داخلية للولوج إلى وحدات المكتب والرئاسة.',
    bureauAnnouncementsTitle: 'تدبير الإعلانات العمومية',
    bureauPublicDocumentsTitle: 'تدبير الوثائق العمومية',
    bureauReportsTitle: 'تبليغات الساكنة',
    bureauOralMemoryTitle: 'تدبير الذاكرة الشفوية',
    bureauHeritageTitle: 'تدبير التراث',
    bureauTimelineTitle: 'تدبير التسلسل التاريخي',
    bureauCommunityMapTitle: 'تدبير الخريطة الجماعية',
    projectsTitle: 'المشاريع الجماعية',
    bureauProjectsTitle: 'تدبير المشاريع الجماعية',
    eventsTitle: 'الأحداث الجماعية',
    bureauEventsTitle: 'تدبير الأحداث الجماعية',
    youthTitle: 'الشباب والمبادرات المحلية',
    bureauYouthTitle: 'تدبير الشباب والمبادرات المحلية',
    solidarityTitle: 'التعاون الاجتماعي',
    bureauSolidarityTitle: 'تدبير التعاون الاجتماعي',
    waterTitle: 'الماء والبئر',
    bureauWaterTitle: 'تدبير الماء والبئر',
    agricultureTitle: 'الفلاحة والأراضي الجماعية',
    diasporaTitle: 'الجالية والدعم الخارجي',
    cooperativesTitle: 'التعاونيات والاقتصاد المحلي',
    bureauAgricultureTitle: 'تدبير الفلاحة والأراضي الجماعية',
    bureauDiasporaTitle: 'تدبير الجالية والدعم الخارجي',
    bureauCooperativesTitle: 'تدبير التعاونيات والاقتصاد المحلي',
    membersTitle: 'تدبير الأعضاء',
    bureauMembersTitle: 'التدبير المتقدم للأعضاء',
    contributionsTitle: 'تدبير المساهمات',
    bureauContributionsTitle: 'مساهمة الإمام / المدرسة القرآنية',
    bureauRenewalTitle: 'تجديد الجمعية',
    bureauContactsTitle: 'الاتصالات والسلطات',
    bureauTasksTitle: 'المهام والآجال الداخلية',
    bureauPlanActionTitle: 'خطة عمل الجمعية',
    bureauProceduresTitle: 'المراسلات والإجراءات الإدارية',
    bureauMeetingsTitle: 'الاجتماعات والمحاضر والقرارات',
    bureauBackupTitle: 'نسخ احتياطي محلي مؤقت',
    presidentSteeringTitle: 'قيادة داخلية للرئيس',
    bureauWorkflowsTitle: 'مسار المصادقة الكامل',
    bureauStatisticsTitle: 'لوحة إحصائيات بسيطة',
    bureauIntro: 'فضاء داخلي للمكتب والرئيس للاطلاع على الطلبات وحفظ القرار بشكل بسيط.',
    bureauLockedTitle: 'وحدة داخلية غير مفعلة',
    bureauLockedDesc: 'هذه الصفحة مخصصة للمكتب والرئيس فقط، وتبقى مغلقة إلى حين تفعيل الوحدات الداخلية.',
    accessDeniedTitle: 'ولوج غير مسموح',
    accessDeniedDesc: 'الصلاحية الحالية لا تسمح بفتح هذه الصفحة الداخلية.',
    accessDeniedNote: 'هذا التنظيم يهيئ البنية فقط ولا يعوض مصادقة خلفية حقيقية.',
    internalReservedTitle: 'ولوج داخلي محجوز',
    internalReservedDesc: 'المصادقة المستقبلية ضرورية. تبقى الوحدات الداخلية مغلقة في الإنتاج حتى إذا تم تفعيل خيار التجربة.',
    localDemoAccess: 'وضع تجريبي محلي: الولوج الداخلي ممكن فقط أثناء التطوير.',
    demoPresentationBanner: 'وضع العرض التجريبي - معطيات وهمية وولوج غير رسمي',
    platformNavigation: 'تنقل المنصة',
    platformPublic: 'عمومي',
    platformPublicHint: 'وحدات مفتوحة',
    platformResident: 'الخدمات',
    platformResidentHint: 'خدمات عمومية',
    platformBureau: 'المكتب',
    platformBureauHint: 'داخلي',
    platformPresident: 'الرئيس',
    platformPresidentHint: 'القيادة',
    mosqueTitle: 'المسجد والتعليم القرآني',
    totalRequests: 'مجموع الطلبات',
    pendingRequests: 'في الانتظار',
    acceptedRequests: 'مقبولة',
    rejectedRequests: 'مرفوضة',
    recommendedRequests: 'موصى بها',
    noRequests: 'لا توجد طلبات حاليا.',
    pending: 'في الانتظار',
    recommended: 'موصى بها',
    accepted: 'مقبولة',
    rejected: 'مرفوضة',
    recommend: 'توصية',
    accept: 'قبول',
    reject: 'رفض',
    applicant: 'صاحب الطلب',
    sentAt: 'تاريخ الطلب',
    decisionHistory: 'السجل',
    presidentDecision: 'قرار الرئيس',
    internalPrivacy: 'معلومات هذه الصفحة داخلية ولا يجب عرضها للعموم.',
    terrainPrepNotice: 'نسخة تحضيرية: سيتم تفعيل المعطيات الحقيقية والمصادقة وقاعدة Supabase بعد التحقق.',
    homeCapabilitiesTitle: 'الخدمات العمومية للدوار',
    homeCapabilitiesIntro: 'معلومات نافعة وإجراءات بسيطة ومحتويات مصادق عليها بدون معطيات حساسة.',
    homeCapabilityInform: 'إخبار الساكنة',
    homeCapabilityReports: 'استقبال التبليغات',
    homeCapabilityDocuments: 'تنظيم الوثائق العمومية',
    homeCapabilityGovernance: 'تحضير الحكامة المحلية',
    homeCapabilitySecurity: 'حماية المعطيات الحساسة عبر Auth/Supabase بعد التحقق',
    terrainPathTitle: 'الإجراءات الرئيسية',
    residentCoreTitle: 'خدمات عمومية',
    residentCoreIntro: 'اختاروا الإجراء المناسب. تبقى المعطيات الشخصية محمية.',
    residentMoreTitle: 'استكشاف الدوار',
    residentMoreIntro: 'تراث وذاكرة ومبادرات عمومية مصادق عليها.',
    presidentPrioritiesTitle: 'أولويات المرحلة',
    presidentPrioritiesIntro: 'نظرة تحضيرية للقرار: تستعمل كدليل، بدون معطيات خلفية حقيقية حاليا.',
    presidentDossiersTitle: 'الملفات الاستراتيجية',
    presidentDossiersDesc: 'متابعة التمويلات والحالات الدولية والمراسلات الرسمية',
    priorityRegistrations: 'طلبات للمصادقة',
    priorityReports: 'تبليغات مفتوحة',
    priorityDocuments: 'وثائق مهمة',
    priorityGlobal: 'تتبع عام',
  },
} as const;




function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function statusLabel(status: RequestedStatus, t: TextBundle) {
  if (status === 'adherent') return t.member;
  if (status === 'soutien') return t.supporter;
  return t.resident;
}

function decisionLabel(status: RequestDecision, t: TextBundle) {
  if (status === 'accepted') return t.accepted;
  if (status === 'rejected') return t.rejected;
  if (status === 'recommended') return t.recommended;
  return t.pending;
}


export default function App() {
  const [lang, setLang] = useState<Lang>('fr');
  const [page, setPage] = useState<Page>(getInitialPage);
  const [submitted, setSubmitted] = useState(false);
  const homeCopy = usePublicEditorialCopy('accueil', homeEditorialCopy);
  const residentCopy = usePublicEditorialCopy('habitant', residentEditorialCopy);
  const t = { ...text[lang], ...homeCopy[lang], ...residentCopy[lang] };
  const isRtl = lang === 'ar';
  const auth = useAuth();
  const currentRole: UserRole = auth.role ?? 'habitant';
  const [siteUnlocked, setSiteUnlocked] = useState(() => {
    if (!siteConfig.siteLockEnabled) return true;
    return isSiteLockSessionValid();
  });

  const switchPage = (next: Page) => {
    setPage(next);
    setSubmitted(false);
    const path = routeForPage(next);
    window.history.replaceState(null, '', path);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    if (siteConfig.siteLockEnabled) {
      clearSiteLockSession();
      setSiteUnlocked(false);
    }
    switchPage('home');
  };

  const handleSiteUnlock = () => {
    setSiteLockSession();
    setSiteUnlocked(true);
  };

  const handleSiteRelock = () => {
    clearSiteLockSession();
    setSiteUnlocked(false);
    switchPage('home');
  };

  useEffect(() => {
    const syncPageWithLocation = () => {
      setSubmitted(false);
      setPage(getInitialPage());
    };
    window.addEventListener('hashchange', syncPageWithLocation);
    window.addEventListener('popstate', syncPageWithLocation);
    return () => {
      window.removeEventListener('hashchange', syncPageWithLocation);
      window.removeEventListener('popstate', syncPageWithLocation);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  useEffect(() => {
    const editableForms = [
      '.internal-form',
      '.contributions-form',
      '.heritage-form',
      '.renewal-form',
      '.contacts-form',
      '.community-map-form',
      '.timeline-form',
      '.public-document-form',
      '.oral-memory-form',
      '.members-form',
      '.projects-form',
      '.events-form',
      '.youth-form',
      '.solidarity-form',
      '.water-form',
      '.agriculture-form',
      '.diaspora-form',
      '.cooperatives-form',
      '.announcement-form',
    ].join(', ');

    const focusEditForm = (attempt = 0) => {
      const form = document.querySelector<HTMLElement>(editableForms);
      if (!form && attempt < 6) {
        window.setTimeout(() => focusEditForm(attempt + 1), 80);
        return;
      }
      if (!form) return;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        const firstField = form.querySelector<HTMLElement>('input, textarea, select');
        firstField?.focus();
      }, 120);
    };

    const scrollToEditForm = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest('button');
      if (!button) return;
      const label = (button.textContent || '').trim().toLowerCase();
      const isEditAction = button.dataset.editAction === 'true' || label.includes('modifier') || label.includes('تعديل');
      const isDangerAction = button.classList.contains('danger-action') || label.includes('supprimer') || label.includes('حذف');
      if (!isEditAction || isDangerAction) return;

      window.setTimeout(() => focusEditForm(), 120);
    };

    document.addEventListener('click', scrollToEditForm);
    return () => document.removeEventListener('click', scrollToEditForm);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl, lang]);

  if (siteConfig.siteLockEnabled && !siteUnlocked) {
    return (
      <SiteLockPage
        lang={lang}
        isRtl={isRtl}
        onLanguageChange={setLang}
        onUnlock={handleSiteUnlock}
      />
    );
  }

  return (
    <main className="app-shell" dir={isRtl ? 'rtl' : 'ltr'}>
      {page !== 'mosquee' ? (
        <div className="lang-switch" aria-label="Language switcher">
          <button className={lang === 'fr' ? 'active' : ''} aria-label="Français" title="Français" onClick={() => setLang('fr')}>FR</button>
          <button className={lang === 'ar' ? 'active' : ''} aria-label="العربية" title="العربية" onClick={() => setLang('ar')}>AR</button>
        </div>
      ) : null}

      {siteConfig.siteLockEnabled ? (
        <button type="button" className="site-relock-button" onClick={handleSiteRelock}>
          <LockKeyhole size={15} />
          {lang === 'ar' ? 'قفل الموقع' : 'Verrouiller le site'}
        </button>
      ) : null}

      <a
        href="https://esango.un.org"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#1A3A5C',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          textDecoration: 'none',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        🌍 Membre officiel — Base de données ONU · iCSO 2026
      </a>

      {siteConfig.demoPresentation ? (
        <div className="demo-presentation-banner" role="status">
          <ShieldCheck size={16} />
          <span>{t.demoPresentationBanner}</span>
        </div>
      ) : null}

      {page !== 'home' ? <PlatformDock t={t} current={page} currentRole={currentRole} onNavigate={switchPage} /> : null}

      {page === 'login' ? (
        <LoginPage lang={lang} onBack={() => switchPage('home')} onLoggedIn={(role) => switchPage(pageForRole(role))} onSignOut={handleSignOut} />
      ) : page === 'connexionHabitant' ? (
        <HabitantLoginPage lang={lang} onBack={() => switchPage('home')} onLoggedIn={() => switchPage('habitant')} />
      ) : page === 'explorer' ? (
        <ExplorerPage lang={lang} onBack={() => switchPage('home')} onNavigate={switchPage} />
      ) : page === 'inscription' ? (
        <InscriptionPage lang={lang} t={t} submitted={submitted} setSubmitted={setSubmitted} onBack={() => switchPage('home')} />
      ) : page === 'habitant' ? (
        <ResidentPage lang={lang} t={t} currentRole={currentRole} onBack={() => switchPage('home')} onInscription={() => switchPage('inscription')} onLogin={() => switchPage('connexionHabitant')} onNavigate={switchPage} onSignOut={handleSignOut} />
      ) : page === 'aPropos' ? (
        <AProposPage lang={lang} onBack={() => switchPage('home')} onInscription={() => switchPage('inscription')} />
      ) : page === 'annonces' ? (
        <AnnoncesPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'documentsPublics' ? (
        <DocumentsPublicsPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'signalement' ? (
        <SignalementPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'douars' ? (
        <DouarsPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'douarDetail' ? (
        <DouarDetailPage lang={lang} onBack={() => switchPage('douars')} />
      ) : page === 'rejoindre' ? (
        <RejoindrePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'memoireOrale' ? (
        <MemoireOralePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'patrimoine' ? (
        <PatrimoinePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'chronologie' ? (
        <ChronologiePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'carteCommunautaire' ? (
        <CarteCommunautairePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'projets' ? (
        <ProjetsPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'evenements' ? (
        <EvenementsPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'jeunesse' ? (
        <JeunessePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'entraide' ? (
        <EntraidePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'eau' ? (
        <EauPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'agriculture' ? (
        <AgriculturePage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'diaspora' ? (
        <DiasporaPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'cooperatives' ? (
        <CooperativesPage lang={lang} onBack={() => switchPage('home')} />
      ) : page === 'cotisations' ? (
        <ProtectedInternalRoute t={t} title={t.contributionsTitle} route="/cotisations" currentRole={currentRole} onBack={() => switchPage('home')}>
          <CotisationsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'membres' ? (
        <ProtectedInternalRoute t={t} title={t.membersTitle} route="/membres" currentRole={currentRole} onBack={() => switchPage('home')}>
          <MembresPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'president' ? (
        <ProtectedInternalRoute t={t} title={t.presidentHomeTitle} route="/president" currentRole={currentRole} onBack={() => switchPage('home')}>
          <PresidentHomePage lang={lang} t={t} currentRole={currentRole} onBack={() => switchPage('home')} onNavigate={switchPage} onSignOut={handleSignOut} />
        </ProtectedInternalRoute>
      ) : page === 'presidentRecensement' ? (
        <ProtectedInternalRoute t={t} title={lang === 'ar' ? 'إحصاء الساكنة' : 'Recensement habitants'} route="/president/recensement" currentRole={currentRole} onBack={() => switchPage('president')}>
          <PresidentRecensementPage lang={lang} onBack={() => switchPage('president')} />
        </ProtectedInternalRoute>
      ) : page === 'bureau' ? (
        <ProtectedInternalRoute t={t} title={t.bureauHomeTitle} route="/bureau" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauHomePage lang={lang} t={t} currentRole={currentRole} onBack={() => switchPage('home')} onNavigate={switchPage} onSignOut={handleSignOut} />
        </ProtectedInternalRoute>
      ) : page === 'bureauInscriptions' ? (
        <ProtectedInternalRoute t={t} title={t.bureauTitle} route="/bureau/inscriptions" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauInscriptionsPage lang={lang} t={t} currentRole={currentRole} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauAnnonces' ? (
        <ProtectedInternalRoute t={t} title={t.bureauAnnouncementsTitle} route="/bureau/annonces" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauAnnoncesPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauDocumentsPublics' ? (
        <ProtectedInternalRoute t={t} title={t.bureauPublicDocumentsTitle} route="/bureau/documents-publics" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauDocumentsPublicsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauDocumentsReunion' ? (
        <ProtectedInternalRoute t={t} title={lang === 'ar' ? 'وثائق الاجتماع' : 'Documents de réunion'} route="/bureau/documents-reunion" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauDocumentsReunionPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauSignalements' ? (
        <ProtectedInternalRoute t={t} title={t.bureauReportsTitle} route="/bureau/signalements" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauSignalementsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauMemoireOrale' ? (
        <ProtectedInternalRoute t={t} title={t.bureauOralMemoryTitle} route="/bureau/memoire-orale" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauMemoireOralePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauPatrimoine' ? (
        <ProtectedInternalRoute t={t} title={t.bureauHeritageTitle} route="/bureau/patrimoine" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauPatrimoinePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauChronologie' ? (
        <ProtectedInternalRoute t={t} title={t.bureauTimelineTitle} route="/bureau/chronologie" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauChronologiePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauCarteCommunautaire' ? (
        <ProtectedInternalRoute t={t} title={t.bureauCommunityMapTitle} route="/bureau/carte-communautaire" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauCarteCommunautairePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauProjets' ? (
        <ProtectedInternalRoute t={t} title={t.bureauProjectsTitle} route="/bureau/projets" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauProjetsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauEvenements' ? (
        <ProtectedInternalRoute t={t} title={t.bureauEventsTitle} route="/bureau/evenements" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauEvenementsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauJeunesse' ? (
        <ProtectedInternalRoute t={t} title={t.bureauYouthTitle} route="/bureau/jeunesse" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauJeunessePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauEntraide' ? (
        <ProtectedInternalRoute t={t} title={t.bureauSolidarityTitle} route="/bureau/entraide" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauEntraidePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauEau' ? (
        <ProtectedInternalRoute t={t} title={t.bureauWaterTitle} route="/bureau/eau" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauEauPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauAgriculture' ? (
        <ProtectedInternalRoute t={t} title={t.bureauAgricultureTitle} route="/bureau/agriculture" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauAgriculturePage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauDiaspora' ? (
        <ProtectedInternalRoute t={t} title={t.bureauDiasporaTitle} route="/bureau/diaspora" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauDiasporaPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauCooperatives' ? (
        <ProtectedInternalRoute t={t} title={t.bureauCooperativesTitle} route="/bureau/cooperatives" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauCooperativesPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauContacts' ? (
        <ProtectedInternalRoute t={t} title={t.bureauContactsTitle} route="/bureau/contacts" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauContactsAutoritesPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauCollecte' ? (
        <ProtectedInternalRoute t={t} title={lang === 'ar' ? 'جمع معلومات الميدان' : 'Collecte terrain'} route="/bureau/collecte-terrain" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauCollecteTerrainPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauTaches' ? (
        <ProtectedInternalRoute t={t} title={t.bureauTasksTitle} route="/bureau/taches" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauTachesInternesPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauPlanAction' ? (
        <ProtectedInternalRoute t={t} title={t.bureauPlanActionTitle} route="/bureau/plan-action" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauPlanActionPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauDemarches' ? (
        <ProtectedInternalRoute t={t} title={t.bureauProceduresTitle} route="/bureau/demarches" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauDemarchesAdministrativesPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauReunions' ? (
        <ProtectedInternalRoute t={t} title={t.bureauMeetingsTitle} route="/bureau/reunions" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauReunionsDecisionsPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauSauvegarde' ? (
        <ProtectedInternalRoute t={t} title={t.bureauBackupTitle} route="/bureau/sauvegarde" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauSauvegardeLocalePage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'presidentPilotageInterne' ? (
        <ProtectedInternalRoute t={t} title={t.presidentSteeringTitle} route="/president/pilotage-interne" currentRole={currentRole} onBack={() => switchPage('president')}>
          <PresidentPilotageInternePage lang={lang} onBack={() => switchPage('president')} />
        </ProtectedInternalRoute>
      ) : page === 'presidentContentEditor' ? (
        <ProtectedInternalRoute t={t} title={lang === 'ar' ? 'محرر المحتوى' : 'Éditeur de contenu'} route="/president/editeur-contenu" currentRole={currentRole} onBack={() => switchPage('president')}>
          <PresidentContentEditorPage lang={lang} onBack={() => switchPage('president')} />
        </ProtectedInternalRoute>
      ) : page === 'presidentOrchid' ? (
        <ProtectedInternalRoute t={t} title="ORCHID" route="/president/orchid" currentRole={currentRole} onBack={() => switchPage('president')}>
          <OrchidDirecteurPage lang={lang} onBack={() => switchPage('president')} />
        </ProtectedInternalRoute>
      ) : page === 'presidentDossiers' ? (
        <ProtectedInternalRoute t={t} title={t.presidentDossiersTitle} route="/president/dossiers-strategiques" currentRole={currentRole} onBack={() => switchPage('president')}>
          <PresidentDossiersStrategiquesPage lang={lang} onBack={() => switchPage('president')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauMembres' ? (
        <ProtectedInternalRoute t={t} title={t.bureauMembersTitle} route="/bureau/membres" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauMembresPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauCotisations' ? (
        <ProtectedInternalRoute t={t} title={t.bureauContributionsTitle} route="/bureau/cotisations" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauCotisationsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauRenouvellement' ? (
        <ProtectedInternalRoute t={t} title={t.bureauRenewalTitle} route="/bureau/renouvellement" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauRenouvellementAssociationPage lang={lang} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauWorkflows' ? (
        <ProtectedInternalRoute t={t} title={t.bureauWorkflowsTitle} route="/bureau/workflows" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauWorkflowsPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauWorkflowPublication' ? (
        <ProtectedInternalRoute t={t} title={lang === 'ar' ? 'مسار النشر' : 'Workflow publication'} route="/bureau/workflow-publication" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <BureauWorkflowPublicationPage lang={lang} currentRole={currentRole} onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauStatistiques' ? (
        <ProtectedInternalRoute t={t} title={t.bureauStatisticsTitle} route="/bureau/statistiques" currentRole={currentRole} onBack={() => switchPage('home')}>
          <BureauStatistiquesPage lang={lang} onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : page === 'bureauMosquee' ? (
        <ProtectedInternalRoute t={t} title={t.mosqueTitle} route="/bureau/mosquee" currentRole={currentRole} onBack={() => switchPage('bureau')}>
          <MosqueePage onBack={() => switchPage('bureau')} />
        </ProtectedInternalRoute>
      ) : page === 'mosquee' ? (
        <ProtectedInternalRoute t={t} title={t.mosqueTitle} route="/bureau/mosquee" currentRole={currentRole} onBack={() => switchPage('home')}>
          <MosqueePage onBack={() => switchPage('home')} />
        </ProtectedInternalRoute>
      ) : (
        <HomePage lang={lang} t={t} onInscription={() => switchPage('inscription')} onResident={() => switchPage('habitant')} onAbout={() => switchPage('aPropos')} onExplorer={() => switchPage('explorer')} onBureau={() => switchPage('bureau')} onPresident={() => switchPage('president')} onNavigate={switchPage} />
      )}
    </main>
  );
}




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

const publicExploreGroups: AccessGroup[] = [
  {
    title: { fr: 'Services communautaires', ar: 'الخدمات الجماعية' },
    desc: { fr: 'Informations et services utiles au quotidien du douar.', ar: 'معلومات وخدمات نافعة للحياة اليومية في الدوار.' },
    items: [
      { page: 'annonces', title: { fr: 'Annonces publiques', ar: 'الإعلانات العمومية' }, desc: { fr: 'Messages officiels validés.', ar: 'رسائل رسمية مصادق عليها.' } },
      { page: 'documentsPublics', title: { fr: 'Documents publics', ar: 'الوثائق العمومية' }, desc: { fr: 'Documents non sensibles.', ar: 'وثائق غير حساسة.' } },
      { page: 'signalement', title: { fr: 'Signalement habitant', ar: 'تبليغ الساكنة' }, desc: { fr: 'Informer le bureau d\'un besoin simple.', ar: 'إخبار المكتب بحاجة بسيطة.' } },
      { page: 'eau', title: { fr: 'Eau et forage', ar: 'الماء والبئر' }, desc: { fr: 'Informations publiques sur l\'eau.', ar: 'معلومات عمومية حول الماء.' } },
      { page: 'entraide', title: { fr: 'Entraide sociale', ar: 'التعاون الاجتماعي' }, desc: { fr: 'Actions solidaires dignes.', ar: 'مبادرات تضامنية بكرامة.' } },
      { page: 'diaspora', title: { fr: 'Diaspora', ar: 'الجالية' }, desc: { fr: 'Lien avec les membres vivant ailleurs.', ar: 'صلة مع أبناء الدوار خارجه.' } },
    ],
  },
  {
    title: { fr: 'Mémoire et patrimoine', ar: 'الذاكرة والتراث' },
    desc: { fr: 'Préserver l\'histoire, les lieux et la mémoire du douar.', ar: 'حفظ تاريخ وأماكن وذاكرة الدوار.' },
    items: [
      { page: 'memoireOrale', title: { fr: 'Mémoire orale', ar: 'الذاكرة الشفوية' }, desc: { fr: 'Récits, témoignages et traditions.', ar: 'حكايات وشهادات وتقاليد.' } },
      { page: 'patrimoine', title: { fr: 'Patrimoine', ar: 'التراث' }, desc: { fr: 'Lieux et éléments importants.', ar: 'أماكن وعناصر مهمة.' } },
      { page: 'chronologie', title: { fr: 'Chronologie', ar: 'التسلسل التاريخي' }, desc: { fr: 'Histoire présentée étape par étape.', ar: 'تاريخ مرتب حسب المراحل.' } },
      { page: 'carteCommunautaire', title: { fr: 'Carte communautaire', ar: 'الخريطة الجماعية' }, desc: { fr: 'Repères illustratifs du territoire.', ar: 'معالم توضيحية للمجال.' } },
    ],
  },
  {
    title: { fr: 'Développement local', ar: 'التنمية المحلية' },
    desc: { fr: 'Suivre les initiatives positives et les projets collectifs.', ar: 'تتبع المبادرات الإيجابية والمشاريع الجماعية.' },
    items: [
      { page: 'projets', title: { fr: 'Projets communautaires', ar: 'المشاريع الجماعية' }, desc: { fr: 'Idées, études et avancement.', ar: 'أفكار ودراسات وتتبع.' } },
      { page: 'evenements', title: { fr: 'Événements', ar: 'الأحداث' }, desc: { fr: 'Réunions et actions collectives.', ar: 'اجتماعات وأنشطة جماعية.' } },
      { page: 'jeunesse', title: { fr: 'Jeunesse', ar: 'الشباب' }, desc: { fr: 'Initiatives locales positives.', ar: 'مبادرات محلية إيجابية.' } },
      { page: 'agriculture', title: { fr: 'Agriculture', ar: 'الفلاحة' }, desc: { fr: 'Initiatives agricoles non sensibles.', ar: 'مبادرات فلاحية غير حساسة.' } },
      { page: 'cooperatives', title: { fr: 'Coopératives', ar: 'التعاونيات' }, desc: { fr: 'Économie locale et savoir-faire.', ar: 'اقتصاد محلي ومعارف إنتاجية.' } },
    ],
  },
];

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

const residentPrimaryPages = new Set<Page>(residentPrimaryActions.items.map((item) => item.page));
const residentAdvancedGroups: AccessGroup[] = publicExploreGroups
  .map((group) => ({ ...group, items: group.items.filter((item) => !residentPrimaryPages.has(item.page)) }))
  .filter((group) => group.items.length > 0);
const bureauGroups: AccessGroup[] = [
  {
    title: { fr: 'Administration', ar: 'الإدارة' },
    desc: { fr: 'Priorité urgente pour le renouvellement de l\'association.', ar: 'أولوية مستعجلة لتجديد الجمعية.' },
    items: [
      { page: 'bureauRenouvellement', title: { fr: 'Renouvellement association', ar: 'تجديد الجمعية' }, desc: { fr: 'Checklist, échéances et suivi sans documents sensibles.', ar: 'لائحة وآجال وتتبع بدون وثائق حساسة.' } },
      { page: 'bureauPlanAction', title: { fr: 'Plan action', ar: 'خطة العمل' }, desc: { fr: 'Urgences, financements et responsables.', ar: 'المستعجلات والدعم والمسؤولون.' } },
      { page: 'bureauContacts', title: { fr: 'Contacts & autorités', ar: 'الاتصالات والسلطات' }, desc: { fr: 'Appels, WhatsApp, email et suivis utiles.', ar: 'اتصال وواتساب وإيميل وتتبع مفيد.' } },
      { page: 'bureauCollecte', title: { fr: 'Collecte terrain', ar: 'جمع معلومات الميدان' }, desc: { fr: 'Cartes à compléter, télécharger ou intégrer plus tard.', ar: 'بطاقات للتكميل أو التحميل أو الإدماج لاحقا.' } },
      { page: 'bureauTaches', title: { fr: 'Tâches & échéances', ar: 'المهام والآجال' }, desc: { fr: 'Priorités, responsables et dates limites.', ar: 'أولويات ومسؤولون وآجال.' } },
      { page: 'bureauDemarches', title: { fr: 'Courriers & démarches', ar: 'المراسلات والإجراءات' }, desc: { fr: 'Suivre dépôts, demandes et rendez-vous.', ar: 'تتبع الإيداعات والطلبات والمواعيد.' } },
      { page: 'bureauReunions', title: { fr: 'Réunions, PV, décisions', ar: 'اجتماعات ومحاضر وقرارات' }, desc: { fr: 'Organiser réunions et actions à faire.', ar: 'تنظيم الاجتماعات والأعمال المطلوبة.' } },
      { page: 'bureauSauvegarde', title: { fr: 'Sauvegarde locale', ar: 'نسخ احتياطي محلي' }, desc: { fr: 'Exporter les données non sensibles.', ar: 'تصدير المعطيات غير الحساسة.' } },
    ],
  },
  {
    title: { fr: 'Habitants', ar: 'الساكنة' },
    desc: { fr: 'Demandes et membres à vérifier humainement.', ar: 'طلبات وأعضاء مع تحقق بشري.' },
    items: [
      { page: 'bureauInscriptions', title: { fr: 'Inscriptions', ar: 'طلبات التسجيل' }, desc: { fr: 'Demandes en attente de validation.', ar: 'طلبات في انتظار المصادقة.' } },
      { page: 'bureauMembres', title: { fr: 'Membres', ar: 'الأعضاء' }, desc: { fr: 'Statuts simples, sans données sensibles.', ar: 'صفات بسيطة بدون معطيات حساسة.' } },
    ],
  },
  {
    title: { fr: 'Communication', ar: 'التواصل' },
    desc: { fr: 'Messages officiels et informations utiles.', ar: 'رسائل رسمية ومعلومات نافعة.' },
    items: [
      { page: 'bureauAnnonces', title: { fr: 'Annonces', ar: 'الإعلانات' }, desc: { fr: 'Soumettre un message au workflow.', ar: 'إرسال رسالة لمسار المصادقة.' } },
      { page: 'bureauWorkflowPublication', title: { fr: 'Workflow publication', ar: 'مسار النشر' }, desc: { fr: 'Valider, publier ou rejeter les contenus.', ar: 'المصادقة أو النشر أو الرفض.' } },
      { page: 'bureauEau', title: { fr: 'Eau', ar: 'الماء' }, desc: { fr: 'Informations eau et forage.', ar: 'معلومات الماء والبئر.' } },
    ],
  },
  {
    title: { fr: 'Documents', ar: 'الوثائق' },
    desc: { fr: 'Documents publics et supports internes de réunion.', ar: 'وثائق عمومية ووثائق داخلية للاجتماع.' },
    items: [
      { page: 'bureauDocumentsPublics', title: { fr: 'Documents publics', ar: 'الوثائق العمومية' }, desc: { fr: 'Préparer et publier ce qui peut être public.', ar: 'تحضير ونشر ما يمكن أن يكون عموميا.' } },
      { page: 'bureauDocumentsReunion', title: { fr: 'Documents de réunion', ar: 'وثائق الاجتماع' }, desc: { fr: 'Synthèses internes à valider et imprimer.', ar: 'خلاصات داخلية للمصادقة والطباعة.' } },
    ],
  },
  {
    title: { fr: 'Signalements', ar: 'التبليغات' },
    desc: { fr: 'Suivi des besoins terrain sans accusation.', ar: 'تتبع حاجيات الميدان بدون اتهام.' },
    items: [
      { page: 'bureauSignalements', title: { fr: 'Signalements', ar: 'التبليغات' }, desc: { fr: 'Classer, suivre et ajouter une note interne.', ar: 'تصنيف وتتبع وإضافة ملاحظة داخلية.' } },
    ],
  },
  {
    title: { fr: 'Finance sensible', ar: 'المساهمات الحساسة' },
    desc: { fr: 'Contributions internes à traiter avec dignité.', ar: 'مساهمات داخلية يجب تدبيرها بكرامة.' },
    items: [
      { page: 'bureauCotisations', title: { fr: 'Cotisation Imam', ar: 'مساهمة الإمام' }, desc: { fr: 'Foyers, école coranique et retards en local.', ar: 'الأسر والمدرسة القرآنية والتأخر محليا.' } },
      { page: 'bureauMosquee', title: { fr: 'Mosquée', ar: 'المسجد' }, desc: { fr: 'Module séparé et prudent.', ar: 'وحدة منفصلة وبحذر.' } },
    ],
  },
  {
    title: { fr: 'Patrimoine / mémoire', ar: 'التراث والذاكرة' },
    desc: { fr: 'Contenus publics à vérifier avant publication.', ar: 'محتويات عمومية يجب التحقق منها قبل النشر.' },
    items: [
      { page: 'bureauMemoireOrale', title: { fr: 'Mémoire orale', ar: 'الذاكرة الشفوية' }, desc: { fr: 'Préparer les récits publics.', ar: 'تحضير الروايات العمومية.' } },
      { page: 'bureauPatrimoine', title: { fr: 'Patrimoine', ar: 'التراث' }, desc: { fr: 'Gérer les éléments patrimoniaux.', ar: 'تدبير العناصر التراثية.' } },
      { page: 'bureauChronologie', title: { fr: 'Chronologie', ar: 'التسلسل التاريخي' }, desc: { fr: 'Organiser les événements historiques.', ar: 'تنظيم الأحداث التاريخية.' } },
      { page: 'bureauCarteCommunautaire', title: { fr: 'Carte du douar', ar: 'خريطة الدوار' }, desc: { fr: 'Points illustratifs, sans GPS réel.', ar: 'نقاط توضيحية بدون GPS حقيقي.' } },
    ],
  },
  {
    title: { fr: 'Développement local', ar: 'التنمية المحلية' },
    desc: { fr: 'Projets et initiatives progressives.', ar: 'مشاريع ومبادرات تدريجية.' },
    items: [
      { page: 'bureauProjets', title: { fr: 'Projets', ar: 'المشاريع' }, desc: { fr: 'Suivre les projets collectifs.', ar: 'تتبع المشاريع الجماعية.' } },
      { page: 'bureauEvenements', title: { fr: 'Événements', ar: 'الأحداث' }, desc: { fr: 'Organiser les événements.', ar: 'تنظيم الأحداث.' } },
      { page: 'bureauJeunesse', title: { fr: 'Jeunesse', ar: 'الشباب' }, desc: { fr: 'Valoriser les initiatives jeunes.', ar: 'إبراز مبادرات الشباب.' } },
      { page: 'bureauEntraide', title: { fr: 'Entraide', ar: 'التعاون' }, desc: { fr: 'Coordonner les actions solidaires.', ar: 'تنسيق الأعمال التضامنية.' } },
      { page: 'bureauAgriculture', title: { fr: 'Agriculture', ar: 'الفلاحة' }, desc: { fr: 'Suivre les initiatives agricoles.', ar: 'تتبع المبادرات الفلاحية.' } },
      { page: 'bureauDiaspora', title: { fr: 'Diaspora', ar: 'الجالية' }, desc: { fr: 'Garder le lien extérieur.', ar: 'حفظ الصلة الخارجية.' } },
      { page: 'bureauCooperatives', title: { fr: 'Coopératives', ar: 'التعاونيات' }, desc: { fr: 'Gérer les initiatives économiques.', ar: 'تدبير المبادرات الاقتصادية.' } },
    ],
  },
];


function BureauHomePage({ lang, t, currentRole, onBack, onNavigate, onSignOut }: { lang: Lang; t: TextBundle; currentRole: UserRole; onBack: () => void; onNavigate: (page: Page) => void; onSignOut: () => Promise<void> }) {
  const auth = useAuth();
  const { badge: inscriptionBadge, clearBadge } = useInscriptionsBadge(auth.role);
  const inscriptionBadges: Partial<Record<Page, number>> = inscriptionBadge > 0 ? { bureauInscriptions: inscriptionBadge } : {};

  function handleNavigate(page: Page) {
    if (page === 'bureauInscriptions') clearBadge();
    onNavigate(page);
  }

  return (
    <section className="panel access-page bureau-entry-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      {auth.user ? (
        <button type="button" className="logout-button" onClick={onSignOut}>
          {lang === 'ar' ? 'خروج' : 'Se déconnecter'}
        </button>
      ) : null}
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{t.bureauHomeTitle}</h1>
      <p className="intro">{t.bureauHomeIntro}</p>
      <AudioHelp scriptId="bureau-accueil" />
      <SpaceNav lang={lang} current="bureau" currentRole={currentRole} onNavigate={handleNavigate} />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.localDemoAccess}</p>
      {bureauGroups.map((group) => <AccessGroupSection key={group.title.fr} lang={lang} group={group} onNavigate={handleNavigate} badges={inscriptionBadges} />)}
    </section>
  );
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
