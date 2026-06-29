import type { RoutePath, UserRole } from '../../types/roles';

export type Page = 'home' | 'login' | 'connexionHabitant' | 'explorer' | 'bureau' | 'president' | 'presidentRecensement' | 'presidentDossiers' | 'inscription' | 'habitant' | 'aPropos' | 'annonces' | 'documentsPublics' | 'signalement' | 'douars' | 'douarDetail' | 'rejoindre' | 'memoireOrale' | 'patrimoine' | 'chronologie' | 'carteCommunautaire' | 'projets' | 'evenements' | 'jeunesse' | 'entraide' | 'eau' | 'agriculture' | 'diaspora' | 'cooperatives' | 'cotisations' | 'membres' | 'bureauInscriptions' | 'bureauAnnonces' | 'bureauDocumentsPublics' | 'bureauDocumentsReunion' | 'bureauSignalements' | 'bureauMemoireOrale' | 'bureauPatrimoine' | 'bureauPlanAction' | 'bureauChronologie' | 'bureauCarteCommunautaire' | 'bureauProjets' | 'bureauEvenements' | 'bureauJeunesse' | 'bureauEntraide' | 'bureauEau' | 'bureauAgriculture' | 'bureauDiaspora' | 'bureauCooperatives' | 'bureauContacts' | 'bureauCollecte' | 'bureauTaches' | 'bureauDemarches' | 'bureauReunions' | 'bureauSauvegarde' | 'presidentPilotageInterne' | 'presidentContentEditor' | 'presidentOrchid' | 'bureauMembres' | 'bureauCotisations' | 'bureauRenouvellement' | 'bureauWorkflows' | 'bureauWorkflowPublication' | 'bureauStatistiques' | 'mosquee' | 'bureauMosquee';

export function getInitialPage(): Page {
  if (window.location.pathname === '/login' || window.location.hash === '#/login') return 'login';
  if (window.location.pathname === '/connexion-habitant' || window.location.hash === '#/connexion-habitant') return 'connexionHabitant';
  if (window.location.pathname === '/explorer' || window.location.hash === '#/explorer') return 'explorer';
  if (window.location.pathname === '/bureau' || window.location.hash === '#/bureau') return 'bureau';
  if (window.location.pathname === '/president' || window.location.hash === '#/president') return 'president';
  if (window.location.pathname === '/bureau/mosquee' || window.location.hash === '#/bureau/mosquee') return 'bureauMosquee';
  if (window.location.pathname === '/mosquee' || window.location.hash === '#/mosquee') {
    window.history.replaceState(null, '', '/bureau/mosquee');
    return 'bureauMosquee';
  }
  if (window.location.pathname === '/a-propos' || window.location.hash === '#/a-propos') return 'aPropos';
  if (window.location.pathname === '/bureau/cotisations' || window.location.hash === '#/bureau/cotisations') return 'bureauCotisations';
  if (window.location.pathname === '/bureau/statistiques' || window.location.hash === '#/bureau/statistiques') return 'bureauStatistiques';
  if (window.location.pathname === '/bureau/renouvellement' || window.location.hash === '#/bureau/renouvellement') return 'bureauRenouvellement';
  if (window.location.pathname === '/bureau/workflows' || window.location.hash === '#/bureau/workflows') return 'bureauWorkflows';
  if (window.location.pathname === '/bureau/workflow-publication' || window.location.hash === '#/bureau/workflow-publication') return 'bureauWorkflowPublication';
  if (window.location.pathname === '/bureau/membres' || window.location.hash === '#/bureau/membres') return 'bureauMembres';
  if (window.location.pathname === '/bureau/documents-reunion' || window.location.hash === '#/bureau/documents-reunion') return 'bureauDocumentsReunion';
  if (window.location.pathname === '/bureau/carte-communautaire' || window.location.hash === '#/bureau/carte-communautaire') return 'bureauCarteCommunautaire';
  if (window.location.pathname === '/bureau/projets' || window.location.hash === '#/bureau/projets') return 'bureauProjets';
  if (window.location.pathname === '/bureau/evenements' || window.location.hash === '#/bureau/evenements') return 'bureauEvenements';
  if (window.location.pathname === '/bureau/jeunesse' || window.location.hash === '#/bureau/jeunesse') return 'bureauJeunesse';
  if (window.location.pathname === '/bureau/entraide' || window.location.hash === '#/bureau/entraide') return 'bureauEntraide';
  if (window.location.pathname === '/bureau/eau' || window.location.hash === '#/bureau/eau') return 'bureauEau';
  if (window.location.pathname === '/bureau/agriculture' || window.location.hash === '#/bureau/agriculture') return 'bureauAgriculture';
  if (window.location.pathname === '/bureau/diaspora' || window.location.hash === '#/bureau/diaspora') return 'bureauDiaspora';
  if (window.location.pathname === '/bureau/cooperatives' || window.location.hash === '#/bureau/cooperatives') return 'bureauCooperatives';
  if (window.location.pathname === '/bureau/contacts' || window.location.hash === '#/bureau/contacts') return 'bureauContacts';
  if (window.location.pathname === '/bureau/collecte-terrain' || window.location.hash === '#/bureau/collecte-terrain') return 'bureauCollecte';
  if (window.location.pathname === '/bureau/collecte' || window.location.hash === '#/bureau/collecte') {
    window.history.replaceState(null, '', '/bureau/collecte-terrain');
    return 'bureauCollecte';
  }
  if (window.location.pathname === '/bureau/taches' || window.location.hash === '#/bureau/taches') return 'bureauTaches';
  if (window.location.pathname === '/bureau/plan-action' || window.location.hash === '#/bureau/plan-action') return 'bureauPlanAction';
  if (window.location.pathname === '/bureau/demarches' || window.location.hash === '#/bureau/demarches') return 'bureauDemarches';
  if (window.location.pathname === '/bureau/reunions' || window.location.hash === '#/bureau/reunions') return 'bureauReunions';
  if (window.location.pathname === '/bureau/sauvegarde' || window.location.hash === '#/bureau/sauvegarde') return 'bureauSauvegarde';
  if (window.location.pathname === '/president/pilotage-interne' || window.location.hash === '#/president/pilotage-interne') return 'presidentPilotageInterne';
  if (window.location.pathname === '/president/editeur-contenu' || window.location.hash === '#/president/editeur-contenu') return 'presidentContentEditor';
  if (window.location.pathname === '/president/orchid' || window.location.hash === '#/president/orchid') return 'presidentOrchid';
  if (window.location.pathname === '/president/dossiers-strategiques' || window.location.hash === '#/president/dossiers-strategiques') return 'presidentDossiers';
  if (window.location.pathname === '/president/recensement' || window.location.hash === '#/president/recensement') return 'presidentRecensement';
  if (window.location.pathname === '/bureau/chronologie' || window.location.hash === '#/bureau/chronologie') return 'bureauChronologie';
  if (window.location.pathname === '/cotisations' || window.location.hash === '#/cotisations') { window.history.replaceState(null, '', '/bureau/cotisations'); return 'bureauCotisations'; }
  if (window.location.pathname === '/membres' || window.location.hash === '#/membres') { window.history.replaceState(null, '', '/bureau/membres'); return 'bureauMembres'; }
  if (window.location.pathname === '/chronologie' || window.location.hash === '#/chronologie') return 'chronologie';
  if (window.location.pathname === '/carte' || window.location.hash === '#/carte') {
    return 'carteCommunautaire';
  }
  if (window.location.pathname === '/carte-communautaire' || window.location.hash === '#/carte-communautaire') return 'carteCommunautaire';
  if (window.location.pathname === '/projets' || window.location.hash === '#/projets') return 'projets';
  if (window.location.pathname === '/evenements' || window.location.hash === '#/evenements') return 'evenements';
  if (window.location.pathname === '/jeunesse' || window.location.hash === '#/jeunesse') return 'jeunesse';
  if (window.location.pathname === '/entraide' || window.location.hash === '#/entraide') return 'entraide';
  if (window.location.pathname === '/eau' || window.location.hash === '#/eau') return 'eau';
  if (window.location.pathname === '/agriculture' || window.location.hash === '#/agriculture') return 'agriculture';
  if (window.location.pathname === '/diaspora' || window.location.hash === '#/diaspora') return 'diaspora';
  if (window.location.pathname === '/cooperatives' || window.location.hash === '#/cooperatives') return 'cooperatives';
  if (window.location.pathname === '/douars' || window.location.hash === '#/douars') { window.history.replaceState(null, '', '/'); return 'home'; }
  if (window.location.pathname.startsWith('/douars/') || window.location.hash.startsWith('#/douars/')) { window.history.replaceState(null, '', '/'); return 'home'; }
  if (window.location.pathname === '/rejoindre' || window.location.hash === '#/rejoindre') { window.history.replaceState(null, '', '/'); return 'home'; }
  if (window.location.pathname === '/bureau/patrimoine' || window.location.hash === '#/bureau/patrimoine') return 'bureauPatrimoine';
  if (window.location.pathname === '/bureau/memoire-orale' || window.location.hash === '#/bureau/memoire-orale') return 'bureauMemoireOrale';
  if (window.location.pathname === '/bureau/signalements' || window.location.hash === '#/bureau/signalements') return 'bureauSignalements';
  if (window.location.pathname === '/bureau/documents-publics' || window.location.hash === '#/bureau/documents-publics') return 'bureauDocumentsPublics';
  if (window.location.pathname === '/bureau/annonces' || window.location.hash === '#/bureau/annonces') return 'bureauAnnonces';
  if (window.location.pathname === '/patrimoine' || window.location.hash === '#/patrimoine') return 'patrimoine';
  if (window.location.pathname === '/memoire-orale' || window.location.hash === '#/memoire-orale') return 'memoireOrale';
  if (window.location.pathname === '/signalement' || window.location.hash === '#/signalement') return 'signalement';
  if (window.location.pathname === '/documents' || window.location.hash === '#/documents') {
    window.history.replaceState(null, '', '/documents-publics');
    return 'documentsPublics';
  }
  if (window.location.pathname === '/documents-publics' || window.location.hash === '#/documents-publics') return 'documentsPublics';
  if (window.location.pathname === '/annonces' || window.location.hash === '#/annonces') return 'annonces';
  if (window.location.pathname === '/bureau/inscriptions' || window.location.hash === '#/bureau/inscriptions') return 'bureauInscriptions';
  if (window.location.pathname === '/habitant' || window.location.hash === '#/habitant') return 'habitant';
  return window.location.pathname === '/inscription' || window.location.hash === '#/inscription' ? 'inscription' : 'home';
}

export function routeForPage(page: Page): RoutePath {
  switch (page) {
    case 'login': return '/login';
    case 'connexionHabitant': return '/connexion-habitant';
    case 'explorer': return '/explorer';
    case 'bureau': return '/bureau';
    case 'president': return '/president';
    case 'presidentRecensement': return '/president/recensement';
    case 'inscription': return '/inscription';
    case 'habitant': return '/habitant';
    case 'aPropos': return '/a-propos';
    case 'annonces': return '/annonces';
    case 'documentsPublics': return '/documents-publics';
    case 'signalement': return '/signalement';
    case 'douars': return '/douars';
    case 'douarDetail': return '/douars/:slug';
    case 'rejoindre': return '/rejoindre';
    case 'memoireOrale': return '/memoire-orale';
    case 'patrimoine': return '/patrimoine';
    case 'chronologie': return '/chronologie';
    case 'carteCommunautaire': return '/carte-communautaire';
    case 'projets': return '/projets';
    case 'evenements': return '/evenements';
    case 'jeunesse': return '/jeunesse';
    case 'entraide': return '/entraide';
    case 'eau': return '/eau';
    case 'agriculture': return '/agriculture';
    case 'diaspora': return '/diaspora';
    case 'cooperatives': return '/cooperatives';
    case 'cotisations': return '/bureau/cotisations';
    case 'membres': return '/bureau/membres';
    case 'bureauInscriptions': return '/bureau/inscriptions';
    case 'bureauAnnonces': return '/bureau/annonces';
    case 'bureauDocumentsPublics': return '/bureau/documents-publics';
    case 'bureauDocumentsReunion': return '/bureau/documents-reunion';
    case 'bureauSignalements': return '/bureau/signalements';
    case 'bureauMemoireOrale': return '/bureau/memoire-orale';
    case 'bureauPatrimoine': return '/bureau/patrimoine';
    case 'bureauChronologie': return '/bureau/chronologie';
    case 'bureauCarteCommunautaire': return '/bureau/carte-communautaire';
    case 'bureauProjets': return '/bureau/projets';
    case 'bureauEvenements': return '/bureau/evenements';
    case 'bureauJeunesse': return '/bureau/jeunesse';
    case 'bureauEntraide': return '/bureau/entraide';
    case 'bureauEau': return '/bureau/eau';
    case 'bureauAgriculture': return '/bureau/agriculture';
    case 'bureauDiaspora': return '/bureau/diaspora';
    case 'bureauCooperatives': return '/bureau/cooperatives';
    case 'bureauContacts': return '/bureau/contacts';
    case 'bureauCollecte': return '/bureau/collecte-terrain';
    case 'bureauTaches': return '/bureau/taches';
    case 'bureauPlanAction': return '/bureau/plan-action';
    case 'bureauDemarches': return '/bureau/demarches';
    case 'bureauReunions': return '/bureau/reunions';
    case 'bureauSauvegarde': return '/bureau/sauvegarde';
    case 'presidentPilotageInterne': return '/president/pilotage-interne';
    case 'presidentContentEditor': return '/president/editeur-contenu';
    case 'presidentOrchid': return '/president/orchid';
    case 'presidentDossiers': return '/president/dossiers-strategiques';
    case 'bureauMembres': return '/bureau/membres';
    case 'bureauCotisations': return '/bureau/cotisations';
    case 'bureauRenouvellement': return '/bureau/renouvellement';
    case 'bureauWorkflows': return '/bureau/workflows';
    case 'bureauWorkflowPublication': return '/bureau/workflow-publication';
    case 'bureauStatistiques': return '/bureau/statistiques';
    case 'mosquee': return '/bureau/mosquee';
    case 'bureauMosquee': return '/bureau/mosquee';
    default: return '/';
  }
}

export function pageForRole(role: UserRole | null): Page {
  if (role === 'president') return 'president';
  if (role === 'bureau') return 'bureau';
  return 'habitant';
}
