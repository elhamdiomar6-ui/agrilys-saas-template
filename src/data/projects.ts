import type { CommunityProject } from '../types/projects';

import { getStorageKey } from '../lib/storage/storageUtils';
export const projectsStorageKey = getStorageKey('projects', 'v3-with-arabic');

const NOW = '2026-06-22T00:00:00.000Z';

const initialProjects: CommunityProject[] = [
  {
    id: 'PROJ-001',
    title: 'Amélioration du réseau d\'eau — Rénovation des khettara',
    titleAr: 'تحسين شبكة المياه — تجديد الختارة',
    description: 'Projet de restauration et d\'amélioration des tunnels d\'irrigation souterrains (khettara) du douar pour garantir un accès fiable à l\'eau toute l\'année.',
    descriptionAr: 'مشروع استعادة وتحسين أنفاق السقي تحت الأرض (الختارة) بالدوار لضمان الوصول الموثوق للمياه على مدار السنة.',
    scriptId: 'projects-eau',
    category: 'eau',
    state: 'in_progress',
    priority: 'high',
    date: '2026-03-01',
    progress: 65,
    internalNote: 'Partenariat avec experts eau. Étapes : diagnostic, nettoyage, réparation.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'PROJ-002',
    title: 'Amélioration de l\'accès au douar — Entretien des routes',
    titleAr: 'تحسين الوصول إلى الدوار — صيانة الطرق',
    description: 'Projet d\'entretien et de stabilisation des accès terrestres au douar pour faciliter la mobilité des habitants, le transport de marchandises et les visites.',
    descriptionAr: 'مشروع صيانة واستقرار الوصول البري للدوار لتسهيل حركة السكان ونقل البضائع والزيارات.',
    scriptId: 'projects-routes',
    category: 'routes',
    state: 'study',
    priority: 'important',
    date: '2026-05-15',
    progress: 20,
    internalNote: 'Demande de financement en cours auprès des autorités régionales.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'PROJ-003',
    title: 'Équipement électrique — Énergie renouvelable pour le douar',
    titleAr: 'المعدات الكهربائية — الطاقة المتجددة للدوار',
    description: 'Projet d\'installation de panneaux solaires et d\'équipements énergétiques pour l\'éclairage public et l\'alimentation en électricité des espaces communautaires du douar.',
    descriptionAr: 'مشروع تركيب الألواح الشمسية والمعدات الطاقية للإضاءة العامة وتوفير الكهرباء للأماكن المجتمعية بالدوار.',
    scriptId: 'projects-energie',
    category: 'equipements',
    state: 'study',
    priority: 'important',
    date: '2026-06-01',
    progress: 30,
    internalNote: 'Étude technique en cours. Possibilité de financement via coopérative.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readProjects(): CommunityProject[] {
  const stored = localStorage.getItem(projectsStorageKey);
  if (!stored) return initialProjects;
  try {
    const parsed = JSON.parse(stored) as CommunityProject[];
    if (parsed.length === 0) return initialProjects;
    return parsed.map((item) => {
      const initial = initialProjects.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'PROJ-001': 'projects-eau',
        'PROJ-002': 'projects-routes',
        'PROJ-003': 'projects-energie',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'projects-init',
      };
    });
  } catch {
    return initialProjects;
  }
}

export function saveProjects(projects: CommunityProject[]) {
  localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
}
