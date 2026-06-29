import type { PublicDocument } from '../types/publicDocument';

export const publicDocumentsStorageKey = 'agadirnetguida.publicDocuments.v1';

export const initialPublicDocuments: PublicDocument[] = [
  {
    id: 'DOC-STATUTS-V4-DEFINITIF-2026',
    title: "Statuts officiels arabes de l'association - 2026",
    category: 'public_rules',
    date: '2026-06-08',
    description: "Version arabe officielle des statuts de l'association, conservée en interne avant décision de publication.",
    status: 'coming_soon',
    published: false,
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
  {
    id: 'DOC-PV-AG-FINAL-13-MEMBRES-2026',
    title: 'PV AG extraordinaire final - Bureau Directeur 13 membres',
    category: 'public_minutes',
    date: '2026-06-07',
    description: "Procès-verbal final de l'assemblée générale extraordinaire avec Bureau Directeur final de 13 membres, conservé en interne.",
    status: 'coming_soon',
    published: false,
    updatedAt: '2026-06-07T00:00:00.000Z',
  },
  {
    id: 'DOC-BUREAU-DIRECTEUR-FINAL-2026',
    title: 'Liste officielle du Bureau Directeur - 13 membres',
    category: 'official_announcements',
    date: '2026-06-07',
    description: "Version corrigée finale 2026 de la composition du Bureau Directeur de l'association, conservée en interne.",
    status: 'coming_soon',
    published: false,
    updatedAt: '2026-06-07T00:00:00.000Z',
  },
];

const retiredPublicDocumentIds = new Set([
  'DOC-DEMO-STATUTS-2026',
  'DOC-DEMO-ONU-ICSO-2026',
]);

function withRequiredDemoDocuments(documents: PublicDocument[]) {
  const sanitizedDocuments = documents.filter((document) => !retiredPublicDocumentIds.has(document.id));
  const existingIds = new Set(sanitizedDocuments.map((document) => document.id));
  const requiredById = new Map(initialPublicDocuments.map((document) => [document.id, document]));
  return [
    ...initialPublicDocuments.filter((document) => !existingIds.has(document.id)),
    ...sanitizedDocuments.map((document) => {
      const required = requiredById.get(document.id);
      return required ? { ...document, ...required } : document;
    }),
  ];
}

export function readPublicDocuments(): PublicDocument[] {
  const stored = localStorage.getItem(publicDocumentsStorageKey);
  if (!stored) return initialPublicDocuments;
  try {
    return withRequiredDemoDocuments(JSON.parse(stored) as PublicDocument[]);
  } catch {
    return initialPublicDocuments;
  }
}

export function savePublicDocuments(documents: PublicDocument[]) {
  localStorage.setItem(publicDocumentsStorageKey, JSON.stringify(documents));
}
