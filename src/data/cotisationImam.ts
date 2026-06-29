import type { CotisationImamHousehold } from '../types/cotisationImam';
import { statsCotisationUpdatedEvent } from '../components/StatsCotisation';

import { getStorageKey } from '../lib/storage/storageUtils';
export const cotisationImamStorageKey = getStorageKey('cotisationImam', 'v1');
export const cotisationImamStatsStorageKey = 'agadir_cotisations_imam';

function syncCotisationStatsStorage(households: CotisationImamHousehold[]) {
  localStorage.setItem(cotisationImamStatsStorageKey, JSON.stringify(households.map((household) => ({
    id: household.id,
    nom_famille_fr: household.headName,
    nom_famille_ar: household.localName,
    statut: household.status,
    montant_du: household.imamDue + household.schoolDue,
    montant_paye: household.imamPaid + household.schoolPaid,
    periode: household.period,
    observation_privee: household.privateObservation,
  }))));
}

export const demoCotisationImamHouseholds: CotisationImamHousehold[] = [
  {
    id: 'FOYER-DEMO-001',
    headName: 'Foyer test A',
    localName: 'Maison exemple nord',
    area: 'Repere fictif 1',
    maritalStatus: 'marie',
    status: 'a_jour',
    period: 'Juin 2026',
    imamDue: 100,
    imamPaid: 100,
    schoolDue: 50,
    schoolPaid: 50,
    privateObservation: 'Donnee fictive de demonstration.',
    history: [
      { id: 'PAY-DEMO-001', kind: 'imam', amount: 100, period: 'Juin 2026', at: '2026-06-01T08:00:00.000Z', note: 'Paiement demo imam.' },
      { id: 'PAY-DEMO-002', kind: 'ecole_coranique', amount: 50, period: 'Juin 2026', at: '2026-06-01T08:05:00.000Z', note: 'Paiement demo ecole coranique.' },
    ],
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-01T08:05:00.000Z',
  },
  {
    id: 'FOYER-DEMO-002',
    headName: 'Foyer test B',
    localName: 'Maison exemple centre',
    area: 'Repere fictif 2',
    maritalStatus: 'inconnu',
    status: 'en_retard',
    period: 'Juin 2026',
    imamDue: 100,
    imamPaid: 40,
    schoolDue: 50,
    schoolPaid: 0,
    privateObservation: 'Retard fictif pour tester le suivi interne.',
    history: [
      { id: 'PAY-DEMO-003', kind: 'imam', amount: 40, period: 'Juin 2026', at: '2026-06-01T09:00:00.000Z', note: 'Paiement partiel demo.' },
    ],
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'FOYER-DEMO-003',
    headName: 'Foyer test C',
    localName: 'Maison exemple sud',
    area: 'Repere fictif 3',
    maritalStatus: 'veuf_veuve',
    status: 'exonere',
    period: 'Juin 2026',
    imamDue: 0,
    imamPaid: 0,
    schoolDue: 0,
    schoolPaid: 0,
    privateObservation: 'Exoneration fictive validee pour demonstration.',
    history: [],
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
];

export function readCotisationImamHouseholds(): CotisationImamHousehold[] {
  const stored = localStorage.getItem(cotisationImamStorageKey);
  if (!stored) {
    syncCotisationStatsStorage(demoCotisationImamHouseholds);
    return demoCotisationImamHouseholds;
  }
  try {
    const households = JSON.parse(stored) as CotisationImamHousehold[];
    syncCotisationStatsStorage(households);
    return households;
  } catch {
    syncCotisationStatsStorage(demoCotisationImamHouseholds);
    return demoCotisationImamHouseholds;
  }
}

export function saveCotisationImamHouseholds(households: CotisationImamHousehold[]) {
  localStorage.setItem(cotisationImamStorageKey, JSON.stringify(households));
  syncCotisationStatsStorage(households);
  window.dispatchEvent(new Event(statsCotisationUpdatedEvent));
}
