import type { PublicAnnouncement } from '../types/announcement';

import { getStorageKey } from '../lib/storage/storageUtils';
export const announcementsStorageKey = getStorageKey('publicAnnouncements', 'v1');

export const initialPublicAnnouncements: PublicAnnouncement[] = [
  {
    id: 'ANN_DEMO_001',
    title: 'Bienvenue sur le site officiel du douar',
    date: '2026-06-01',
    category: 'info',
    importance: 'important',
    content: "L'Association Agadir N'Tguida est heureuse de vous accueillir sur sa plateforme numérique officielle. Retrouvez ici toutes les informations sur le douar, le patrimoine et les services communautaires.",
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'ANN_DEMO_002',
    title: 'Réunion du bureau — Nouveaux statuts adoptés',
    date: '2026-06-06',
    category: 'reunion',
    importance: 'important',
    content: "Le bureau de l'association s'est réuni pour adopter les nouveaux statuts incluant le tourisme culturel, les partenariats internationaux et les activités numériques.",
    updatedAt: '2026-06-06T09:00:00.000Z',
  },
  {
    id: 'ANN_DEMO_003',
    title: 'Le Grenier Collectif Tguida — Notre patrimoine',
    date: '2026-06-05',
    category: 'info',
    importance: 'normal',
    content: 'Le Grenier Collectif Tguida, site patrimonial amazigh répertorié par le Ministère de la Culture, est désormais documenté sur notre plateforme avec coordonnées GPS et photos.',
    updatedAt: '2026-06-05T09:00:00.000Z',
  },
];

export function readAnnouncements(): PublicAnnouncement[] {
  const stored = localStorage.getItem(announcementsStorageKey);
  if (!stored) return initialPublicAnnouncements;
  try {
    const storedAnnouncements = JSON.parse(stored) as PublicAnnouncement[];
    const merged = [...storedAnnouncements];

    initialPublicAnnouncements.forEach((demoAnnouncement) => {
      const index = merged.findIndex((announcement) => announcement.id === demoAnnouncement.id);
      if (index >= 0) {
        merged[index] = demoAnnouncement;
        return;
      }
      merged.push(demoAnnouncement);
    });

    return merged;
  } catch {
    return initialPublicAnnouncements;
  }
}

export function saveAnnouncements(announcements: PublicAnnouncement[]) {
  localStorage.setItem(announcementsStorageKey, JSON.stringify(announcements));
}
