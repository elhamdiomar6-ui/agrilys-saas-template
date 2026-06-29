const CACHE_NAME = 'audio-darija-v1';

const DARIJA_FILES = [
  '/audio/darija/agriculture.mp3',
  '/audio/darija/annonces.mp3',
  '/audio/darija/a-propos.mp3',
  '/audio/darija/bureau-accueil.mp3',
  '/audio/darija/bureau-annonces.mp3',
  '/audio/darija/bureau-documents-publics.mp3',
  '/audio/darija/bureau-inscriptions.mp3',
  '/audio/darija/bureau-plan-action.mp3',
  '/audio/darija/bureau-renouvellement.mp3',
  '/audio/darija/bureau-signalements.mp3',
  '/audio/darija/bureau-workflow-publication.mp3',
  '/audio/darija/carte-patrimoine.mp3',
  '/audio/darija/chronologie.mp3',
  '/audio/darija/chronologie-jalon-001.mp3',
  '/audio/darija/chronologie-jalon-002.mp3',
  '/audio/darija/chronologie-jalon-003.mp3',
  '/audio/darija/chronologie-jalon-004.mp3',
  '/audio/darija/chronologie-jalon-005.mp3',
  '/audio/darija/chronologie-jalon-006.mp3',
  '/audio/darija/cooperatives.mp3',
  '/audio/darija/diaspora.mp3',
  '/audio/darija/documents-publics.mp3',
  '/audio/darija/eau.mp3',
  '/audio/darija/entraide.mp3',
  '/audio/darija/evenements.mp3',
  '/audio/darija/explorer.mp3',
  '/audio/darija/habitant.mp3',
  '/audio/darija/home-guide.mp3',
  '/audio/darija/inscription.mp3',
  '/audio/darija/jeunesse.mp3',
  '/audio/darija/memoire-orale.mp3',
  '/audio/darija/projets.mp3',
  '/audio/darija/signalement.mp3',
  '/audio/darija/connexion.mp3',
  '/audio/darija/bureau-memoire-orale.mp3',
  '/audio/darija/bureau-chronologie.mp3',
  '/audio/darija/bureau-carte.mp3',
  '/audio/darija/bureau-workflows.mp3',
  '/audio/darija/bureau-contacts.mp3',
  '/audio/darija/bureau-taches.mp3',
  '/audio/darija/bureau-demarches.mp3',
  '/audio/darija/bureau-reunions.mp3',
  '/audio/darija/president-pilotage.mp3',
  '/audio/darija/bureau-patrimoine.mp3',
  '/audio/darija/bureau-collecte.mp3',
  '/audio/darija/bureau-cotisations-imam.mp3',
  '/audio/darija/bureau-sauvegarde.mp3',
  '/audio/darija/bureau-operations.mp3',
  '/audio/darija/bureau-orchid.mp3',
  '/audio/darija/bureau-projets.mp3',
  '/audio/darija/bureau-membres.mp3',
  '/audio/darija/bureau-jeunesse.mp3',
  '/audio/darija/bureau-eau.mp3',
  '/audio/darija/bureau-diaspora.mp3',
  '/audio/darija/bureau-cooperatives.mp3',
  '/audio/darija/bureau-agriculture.mp3',
  '/audio/darija/bureau-statistiques.mp3',
  '/audio/darija/bureau-evenements.mp3',
  '/audio/darija/bureau-entraide.mp3',
  '/audio/darija/bureau-documents-reunion.mp3',
  '/audio/darija/president-editor.mp3',
  '/audio/darija/president-recensement.mp3',
  '/audio/darija/agriculture-init.mp3',
  '/audio/darija/cooperatives-init.mp3',
  '/audio/darija/events-init.mp3',
  '/audio/darija/projects-init.mp3',
  '/audio/darija/water-init.mp3',
  '/audio/darija/youth-init.mp3',
  '/audio/darija/solidarity-init.mp3',
  '/audio/darija/diaspora-init.mp3',
  '/audio/darija/agriculture-oliviers.mp3',
  '/audio/darija/agriculture-irrigation.mp3',
  '/audio/darija/agriculture-reboisement.mp3',
  '/audio/darija/cooperatives-terroir.mp3',
  '/audio/darija/cooperatives-artisanat.mp3',
  '/audio/darija/cooperatives-elevage.mp3',
  '/audio/darija/water-maintenance.mp3',
  '/audio/darija/water-qualite.mp3',
  '/audio/darija/water-hydraulique.mp3',
  '/audio/darija/events-reunion.mp3',
  '/audio/darija/events-fete.mp3',
  '/audio/darija/events-nettoyage.mp3',
  '/audio/darija/projects-eau.mp3',
  '/audio/darija/projects-routes.mp3',
  '/audio/darija/projects-energie.mp3',
  '/audio/darija/youth-education.mp3',
  '/audio/darija/youth-sport.mp3',
  '/audio/darija/youth-patrimoine.mp3',
  '/audio/darija/solidarity-familiale.mp3',
  '/audio/darija/solidarity-sante.mp3',
  '/audio/darija/solidarity-alimentaire.mp3',
  '/audio/darija/diaspora-accompagnement.mp3',
  '/audio/darija/diaspora-participation.mp3',
  '/audio/darija/diaspora-investissements.mp3',
];

const objectUrlMap = new Map<string, string>();

export function initAudioCache(): void {
  if (!('caches' in window)) return;
  caches
    .open(CACHE_NAME)
    .then((cache) => Promise.allSettled(DARIJA_FILES.map((url) => cache.add(url))))
    .catch(() => {});
}

export async function getCachedAudioSrc(url: string): Promise<string> {
  const cached = objectUrlMap.get(url);
  if (cached) return cached;

  if (!('caches' in window)) return url;

  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      objectUrlMap.set(url, objUrl);
      return objUrl;
    }
  } catch {
    // cache unavailable — fall through to network URL
  }

  return url;
}
