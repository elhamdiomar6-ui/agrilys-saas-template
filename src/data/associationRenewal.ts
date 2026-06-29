import type { AssociationRenewalItem } from '../types/associationRenewal';

import { getStorageKey } from '../lib/storage/storageUtils';
export const associationRenewalStorageKey = getStorageKey('associationRenewal', 'v1');

const today = new Date().toISOString().slice(0, 10);

export const initialAssociationRenewalItems: AssociationRenewalItem[] = [
  {
    id: 'REN-001',
    title: "Statuts de l'association",
    category: 'statutes',
    status: 'to_prepare',
    priority: 'urgent',
    responsible: 'Président',
    deadline: today,
    nextAction: 'Vérifier la dernière version papier avant toute numérisation future.',
    physicalLocation: 'Classeur administratif hors application',
    notes: 'Ne pas déposer ici de scan signé ou document sensible.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-002',
    title: 'PV assemblée générale',
    category: 'meeting',
    status: 'in_progress',
    priority: 'urgent',
    responsible: 'Secrétaire',
    deadline: today,
    nextAction: 'Préparer le brouillon et confirmer la liste de présence.',
    physicalLocation: 'Dossier papier renouvellement',
    notes: 'Version de travail uniquement. Signature et scan restent hors application.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-003',
    title: 'Liste de présence',
    category: 'meeting',
    status: 'to_prepare',
    priority: 'high',
    responsible: 'Bureau',
    deadline: today,
    nextAction: 'Préparer une liste simple à imprimer.',
    physicalLocation: 'À préparer hors application',
    notes: 'Ne pas saisir de données personnelles détaillées ici.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-004',
    title: 'Liste des membres du bureau',
    category: 'members',
    status: 'to_prepare',
    priority: 'high',
    responsible: 'Président',
    deadline: today,
    nextAction: 'Confirmer les noms et fonctions avec les concernés.',
    physicalLocation: 'Dossier bureau hors application',
    notes: 'Pas de CIN ni coordonnées sensibles dans cette version.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-005',
    title: 'Copies CIN à préparer hors application',
    category: 'administration',
    status: 'blocked',
    priority: 'urgent',
    responsible: 'Président',
    deadline: today,
    nextAction: 'Préparer uniquement dans un dossier sécurisé hors application.',
    physicalLocation: 'Hors application - support sécurisé',
    notes: 'Interdit de stocker CIN, signatures ou scans dans le frontend.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-006',
    title: 'Convocation',
    category: 'meeting',
    status: 'to_prepare',
    priority: 'medium',
    responsible: 'Secrétaire',
    deadline: today,
    nextAction: 'Préparer le texte et le canal de diffusion.',
    physicalLocation: 'Brouillon hors application',
    notes: 'Contenu non sensible seulement.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-007',
    title: 'Demande administrative',
    category: 'administration',
    status: 'to_prepare',
    priority: 'high',
    responsible: 'Président',
    deadline: today,
    nextAction: 'Vérifier le modèle demandé par l’autorité compétente.',
    physicalLocation: 'Dossier administratif hors application',
    notes: 'Ne pas joindre de document réel avant Storage privé.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-008',
    title: 'Reçu ou récépissé',
    category: 'receipt',
    status: 'to_prepare',
    priority: 'medium',
    responsible: 'Président',
    deadline: today,
    nextAction: 'Prévoir emplacement physique pour conserver l’original.',
    physicalLocation: 'À recevoir puis archiver hors application',
    notes: 'Le scan viendra seulement après stockage sécurisé.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-009',
    title: 'Courriers aux autorités',
    category: 'letters',
    status: 'to_prepare',
    priority: 'medium',
    responsible: 'Bureau',
    deadline: today,
    nextAction: 'Lister les courriers nécessaires sans données personnelles.',
    physicalLocation: 'Classeur courriers hors application',
    notes: 'Aucun courrier signé dans cette interface temporaire.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REN-010',
    title: 'Dossier final de dépôt',
    category: 'final_file',
    status: 'to_prepare',
    priority: 'urgent',
    responsible: 'Président',
    deadline: today,
    nextAction: 'Regrouper les pièces après vérification finale.',
    physicalLocation: 'Dossier physique final',
    notes: 'Suivi organisationnel uniquement, pas de dépôt numérique sensible.',
    updatedAt: new Date().toISOString(),
  },
];

export function readAssociationRenewalItems(): AssociationRenewalItem[] {
  const stored = localStorage.getItem(associationRenewalStorageKey);
  if (!stored) return initialAssociationRenewalItems;
  try {
    return JSON.parse(stored) as AssociationRenewalItem[];
  } catch {
    return initialAssociationRenewalItems;
  }
}

export function saveAssociationRenewalItems(items: AssociationRenewalItem[]) {
  localStorage.setItem(associationRenewalStorageKey, JSON.stringify(items));
}
