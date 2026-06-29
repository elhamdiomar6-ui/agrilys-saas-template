import type { ActionPlanItem, AdministrativeProcedure, FieldCollectionItem, InternalTask, MeetingDecisionRecord } from '../types/internalOperations';

import { getStorageKey } from '../lib/storage/storageUtils';
export const internalTasksStorageKey = getStorageKey('internalTasks', 'v1');
export const administrativeProceduresStorageKey = getStorageKey('internalTasks', 'v1');
export const meetingDecisionRecordsStorageKey = getStorageKey('internalTasks', 'v1');
export const fieldCollectionStorageKey = getStorageKey('internalTasks', 'v1');
export const actionPlanStorageKey = getStorageKey('internalTasks', 'v1');

const today = new Date().toISOString().slice(0, 10);

export const initialInternalTasks: InternalTask[] = [
  {
    id: 'TASK-DEMO-1',
    title: 'Préparer convocation de réunion',
    description: 'Vérifier le modèle de convocation avant diffusion interne.',
    responsible: 'Président / secrétaire',
    priority: 'urgent',
    status: 'todo',
    deadline: today,
    category: 'renewal',
    nextAction: 'Relire les informations obligatoires.',
    notes: 'Exemple non sensible à adapter.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TASK-DEMO-2',
    title: 'Classer les documents déjà disponibles',
    description: 'Noter seulement leur emplacement réel, sans déposer de scan.',
    responsible: 'Bureau',
    priority: 'high',
    status: 'in_progress',
    deadline: today,
    category: 'documents',
    nextAction: 'Vérifier le dossier physique.',
    notes: 'Ne pas saisir de CIN ou document sensible.',
    updatedAt: new Date().toISOString(),
  },
];

export const initialAdministrativeProcedures: AdministrativeProcedure[] = [
  {
    id: 'PROC-DEMO-1',
    title: 'Préparer dossier de dépôt renouvellement',
    organization: 'Autorité compétente à confirmer',
    linkedContact: 'Contact à compléter',
    type: 'deposit',
    status: 'to_prepare',
    plannedDate: today,
    sentOrDepositDate: '',
    nextAction: 'Lister les pièces manquantes.',
    responsible: 'Président',
    priority: 'urgent',
    internalReference: 'RENOUV-INTERNE-01',
    physicalLocation: 'Dossier physique à préciser',
    notes: 'Exemple non sensible.',
    updatedAt: new Date().toISOString(),
  },
];

export const initialMeetingDecisionRecords: MeetingDecisionRecord[] = [
  {
    id: 'MEET-DEMO-1',
    title: 'Réunion préparatoire renouvellement',
    date: today,
    place: 'Lieu à confirmer',
    purpose: 'Organiser les étapes du renouvellement.',
    participants: 'Président, bureau, membres concernés',
    decisions: 'Décisions à compléter après réunion.',
    actions: 'Préparer PV et liste de présence.',
    responsible: 'Secrétaire',
    minuteStatus: 'to_write',
    physicalLocation: 'Dossier physique PV à préciser',
    notes: 'Ne pas saisir de signatures ou scans.',
    updatedAt: new Date().toISOString(),
  },
];

export const initialFieldCollectionItems: FieldCollectionItem[] = [
  {
    id: 'COLLECT-DEMO-1',
    title: 'Photo réelle du <CULTURAL_HERITAGE>,
    category: 'heritage_photos',
    linkedPlace: 'Agadir n’Tguida',
    status: 'to_collect',
    note: 'Collecter une photo nette, puis vérifier qu’elle peut être publiée.',
    date: today,
    source: 'Visite terrain ou personne du village',
    fileName: '',
    priority: 'high',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'COLLECT-DEMO-2',
    title: 'Coordonnées GPS à confirmer',
    category: 'place_gps',
    linkedPlace: 'Lieu à préciser',
    status: 'to_verify',
    note: 'Confirmer l’information avant intégration dans le module patrimoine.',
    date: today,
    source: 'Observation terrain',
    fileName: '',
    priority: 'medium',
    updatedAt: new Date().toISOString(),
  },
];

export const initialActionPlanItems: ActionPlanItem[] = [
  {
    id: 'ACTION-001',
    title: "[FAIT] Creer l'association <ORGANIZATION_NAME> (Dahir 1.58.376)",
    status: 'complete',
    priority: 'normal',
    dueDate: '2026-01-01',
    description: 'Association legalement constituee.',
    responsible: 'President',
    tags: 'fondations',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-002',
    title: '[FAIT] Elire le bureau - 13 membres (06/06/2026)',
    status: 'complete',
    priority: 'normal',
    dueDate: '2026-06-06',
    description: 'Bureau complet elu - PV signe.',
    responsible: 'Bureau',
    tags: 'fondations,gouvernance',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-003',
    title: '[FAIT] Obtenir statut ONU iCSO/DESA',
    status: 'complete',
    priority: 'normal',
    dueDate: '2026-06-01',
    description: 'Statut accepte 2026 - badge visible sur la plateforme.',
    responsible: 'President',
    tags: 'fondations,international',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-004',
    title: '[FAIT] Deployer <DOMAIN> en production',
    status: 'complete',
    priority: 'normal',
    dueDate: '2026-06-09',
    description: 'Production Vercel active, Supabase configure, modules internes proteges.',
    responsible: 'President / technique',
    tags: 'plateforme',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-005',
    title: '[FAIT] Documenter 6 sites patrimoniaux GPS trilingues',
    status: 'complete',
    priority: 'normal',
    dueDate: '2026-06-01',
    description: 'Descriptions fr/ar/amazigh - <CULTURAL_HERITAGE>.',
    responsible: 'Commission patrimoine',
    tags: 'patrimoine',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-006',
    title: '[FAIT] Synchroniser cotisations 103 foyers',
    status: 'complete',
    priority: 'normal',
    dueDate: '2026-06-09',
    description: 'Suivi financier structure pour les foyers cotisants.',
    responsible: 'Tresorier',
    tags: 'finances',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-007',
    title: '[EN COURS] Contacter 8 organismes de financement',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-06-20',
    description: 'SMIT, Ministere Culture, CFLI Canada, M&D, OIF, Institut Francais, GIZ, AFD - relances a faire.',
    responsible: 'President / bureau',
    tags: 'subventions',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-008',
    title: 'Rediger dossier INDH Sidi Ifni',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-06-20',
    description: 'Projet : amenagement <CULTURAL_HERITAGE>. Montant cible : 50 000-150 000 MAD.',
    responsible: 'President / secretaire',
    tags: 'subventions',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-009',
    title: 'Deposer dossier INDH - Division Action Sociale Sidi Ifni',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-06-23',
    description: 'Depot physique avec dossier complet : statuts + PV + budget + indicateurs SMART.',
    responsible: 'President',
    tags: 'subventions',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-010',
    title: 'Preparer dossier CFLI Canada',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-06-30',
    description: 'Verifier ouverture appel a projets juillet 2026 - Ambassade Canada Rabat - Montant cible 10 000-50 000 CAD.',
    responsible: 'President / diaspora',
    tags: 'subventions,international',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-011',
    title: 'Creer compte GlobalGiving et soumettre validation',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-07-05',
    description: 'Processus validation 3-4 semaines - preparer histoire <ORGANIZATION_NAME> + visuels <CULTURAL_HERITAGE>.',
    responsible: 'President / diaspora',
    tags: 'subventions,diaspora',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-012',
    title: 'Soumettre dossier GIZ / AFD (patrimoine rural)',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-07-15',
    description: 'Patrimoine + développement territorial + partenaires publics à identifier - Bureau Maroc : Rabat.',
    responsible: 'President',
    tags: 'subventions,international',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-013',
    title: 'Lancer campagne diaspora LaunchGood',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-07-20',
    description: 'Objectif : 20 000 MAD - video courte <CULTURAL_HERITAGE>.',
    responsible: 'Commission diaspora',
    tags: 'diaspora,financement',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-014',
    title: 'Constituer la cooperative ODCO',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-07-15',
    description: 'Dossier legal - produits : argan, miel, artisanat amazigh - membres fondateurs a identifier.',
    responsible: 'Bureau / commission cooperative',
    tags: 'cooperative',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-015',
    title: 'Ouvrir compte bancaire cooperative',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-08-01',
    description: 'Apres validation ODCO - banque locale Sidi Ifni.',
    responsible: 'Tresorier / cooperative',
    tags: 'cooperative,finances',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-016',
    title: 'Préparer partenariats coopérative à l’export',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-09-01',
    description: 'Protocoles à étudier avec partenaires validés - marchés : Maroc, Europe, monde arabe.',
    responsible: 'President / cooperative',
    tags: 'cooperative,export',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-017',
    title: 'Premières commandes test argan/miel via coopérative',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-10-01',
    description: 'Objectif : premiere commande test avant fin 2026.',
    responsible: 'Cooperative',
    tags: 'cooperative,export',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-018',
    title: 'Amenager acces et signaletique <CULTURAL_HERITAGE>,
    status: 'todo',
    priority: 'high',
    dueDate: '2026-08-15',
    description: 'Conditionne au financement INDH - GPS : 29.347, -9.289.',
    responsible: 'Bureau / patrimoine',
    tags: 'tourisme,patrimoine',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-019',
    title: 'Former guide local certifie',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-09-01',
    description: 'Formation + accreditation - tarif indicatif : 200 MAD/personne.',
    responsible: 'Commission tourisme',
    tags: 'tourisme',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-020',
    title: 'Lancer premieres visites guidees officielles',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-10-01',
    description: 'Objectif : 10 visiteurs/semaine = 8 000 MAD/mois.',
    responsible: 'Commission tourisme',
    tags: 'tourisme,revenus',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-021',
    title: 'Contacter 3 Tour Operateurs tourisme solidaire',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-09-15',
    description: 'TO specialises Anti-Atlas - packages culturels.',
    responsible: 'President / tourisme',
    tags: 'tourisme',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-022',
    title: 'Finaliser et deposer le dossier INDH Sidi Ifni',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-06-20',
    description: 'Finaliser le dossier INDH pour l amenagement du <CULTURAL_HERITAGE>, signaletique, budget et pieces justificatives.',
    responsible: 'President / bureau',
    tags: 'subventions,patrimoine,INDH',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-023',
    title: 'Deposer le dossier complet du nouveau bureau a la qiyada Tighirt',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-07-06',
    description: 'Depot administratif du nouveau bureau dans le delai legal de 30 jours apres l assemblee du 06/06/2026.',
    responsible: 'President / secretaire general',
    tags: 'gouvernance,autorites,administratif',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-024',
    title: 'Inscrire membres diaspora sur la plateforme',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-07-01',
    description: 'Partager lien <DOMAIN> - objectif : 30 membres MRE inscrits.',
    responsible: 'Commission diaspora',
    tags: 'plateforme,diaspora',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-025',
    title: 'Partager la plateforme avec les 13 membres du bureau',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2026-06-12',
    description: 'Demonstration live - adoption interne prioritaire.',
    responsible: 'President',
    tags: 'gouvernance,plateforme',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-026',
    title: 'Revue hebdomadaire bureau (chaque dimanche)',
    status: 'todo',
    priority: 'normal',
    dueDate: '2026-06-15',
    description: '20 min - verifier avancement taches + decisions de la semaine.',
    responsible: 'Bureau',
    tags: 'gouvernance',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ACTION-027',
    title: 'Preparer le dossier de candidature nationale UNESCO pour les Igoudars',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-11-01',
    description: 'Preparer les pieces, preuves patrimoniales et coordination institutionnelle pour le dossier national des Igoudars.',
    responsible: 'President / patrimoine',
    tags: 'patrimoine,UNESCO,igoudars',
    notes: '',
    updatedAt: new Date().toISOString(),
  },
];

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T[] : fallback;
  } catch {
    return fallback;
  }
}

function saveList<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function asText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeFieldCollectionItem(item: Record<string, unknown>): FieldCollectionItem {
  const category = asText(item.category);
  const status = asText(item.status);
  const legacyCategory = category === 'patrimoine' ? 'heritage_photos' : category;
  const legacyStatus = status === 'archived' ? 'integrated' : status;
  return {
    id: asText(item.id) || `COLLECT-${Date.now()}`,
    title: asText(item.title) || 'Information à compléter',
    category: (legacyCategory || 'free_observations') as FieldCollectionItem['category'],
    linkedPlace: asText(item.linkedPlace),
    status: (legacyStatus || 'to_collect') as FieldCollectionItem['status'],
    note: asText(item.note) || asText(item.nextAction) || asText(item.notes),
    date: asText(item.date) || today,
    source: asText(item.source),
    fileName: asText(item.fileName) || asText(item.storageLocation),
    priority: (asText(item.priority) || 'medium') as FieldCollectionItem['priority'],
    updatedAt: asText(item.updatedAt) || new Date().toISOString(),
  };
}

export function readInternalTasks() {
  return readList<InternalTask>(internalTasksStorageKey, initialInternalTasks);
}

export function saveInternalTasks(items: InternalTask[]) {
  saveList(internalTasksStorageKey, items);
}

export function readAdministrativeProcedures() {
  return readList<AdministrativeProcedure>(administrativeProceduresStorageKey, initialAdministrativeProcedures);
}

export function saveAdministrativeProcedures(items: AdministrativeProcedure[]) {
  saveList(administrativeProceduresStorageKey, items);
}

export function readMeetingDecisionRecords() {
  return readList<MeetingDecisionRecord>(meetingDecisionRecordsStorageKey, initialMeetingDecisionRecords);
}

export function saveMeetingDecisionRecords(items: MeetingDecisionRecord[]) {
  saveList(meetingDecisionRecordsStorageKey, items);
}

export function readFieldCollectionItems() {
  return readList<FieldCollectionItem>(fieldCollectionStorageKey, initialFieldCollectionItems).map(normalizeFieldCollectionItem);
}

export function saveFieldCollectionItems(items: FieldCollectionItem[]) {
  saveList(fieldCollectionStorageKey, items);
}

export function readActionPlanItems() {
  return readList<ActionPlanItem>(actionPlanStorageKey, initialActionPlanItems);
}

export function saveActionPlanItems(items: ActionPlanItem[]) {
  saveList(actionPlanStorageKey, items);
}
