import type { ReactNode } from 'react';
import type { UserRole } from '../../types/roles';

export type Page = 'home' | 'login' | 'connexionHabitant' | 'explorer' | 'bureau' | 'president' | 'presidentRecensement' | 'presidentDossiers' | 'inscription' | 'habitant' | 'aPropos' | 'annonces' | 'documentsPublics' | 'signalement' | 'douars' | 'douarDetail' | 'rejoindre' | 'memoireOrale' | 'patrimoine' | 'chronologie' | 'carteCommunautaire' | 'projets' | 'evenements' | 'jeunesse' | 'entraide' | 'eau' | 'agriculture' | 'diaspora' | 'cooperatives' | 'cotisations' | 'membres' | 'bureauInscriptions' | 'bureauAnnonces' | 'bureauDocumentsPublics' | 'bureauDocumentsReunion' | 'bureauSignalements' | 'bureauMemoireOrale' | 'bureauPatrimoine' | 'bureauPlanAction' | 'bureauChronologie' | 'bureauCarteCommunautaire' | 'bureauProjets' | 'bureauEvenements' | 'bureauJeunesse' | 'bureauEntraide' | 'bureauEau' | 'bureauAgriculture' | 'bureauDiaspora' | 'bureauCooperatives' | 'bureauContacts' | 'bureauCollecte' | 'bureauTaches' | 'bureauDemarches' | 'bureauReunions' | 'bureauSauvegarde' | 'presidentPilotageInterne' | 'presidentContentEditor' | 'presidentOrchid' | 'bureauMembres' | 'bureauCotisations' | 'bureauRenouvellement' | 'bureauWorkflows' | 'bureauWorkflowPublication' | 'bureauStatistiques' | 'mosquee' | 'bureauMosquee';

export function spaceForPage(page: Page): 'public' | 'habitant' | 'bureau' | 'president' {
  if (page === 'president' || page.startsWith('president')) return 'president';
  if (page === 'habitant') return 'habitant';
  if (page === 'bureau' || page.startsWith('bureau') || page === 'membres' || page === 'cotisations' || page === 'mosquee') return 'bureau';
  return 'public';
}

export function canShowSpace(space: 'public' | 'habitant' | 'bureau' | 'president', role: UserRole) {
  if (space === 'bureau') return role === 'bureau' || role === 'president';
  if (space === 'president') return role === 'president';
  return true;
}

export function visibleSpaceItems(current: Page, currentRole: UserRole) {
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

export function accessIconForPage(page: Page): ReactNode {
  switch (page) {
    case 'habitant': return '🏠';
    case 'explorer': return '🌍';
    case 'bureau': return '🏢';
    case 'president': return '🎖️';
    case 'presidentRecensement': return '📊';
    case 'presidentDossiers': return '📋';
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
