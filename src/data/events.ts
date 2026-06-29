import type { CommunityEvent } from '../types/events';

export const eventsStorageKey = 'agadirnetguida.events.v3-with-arabic';

const NOW = '2026-06-22T00:00:00.000Z';

const initialEvents: CommunityEvent[] = [
  {
    id: 'EVT-001',
    title: 'Réunion générale communautaire — Gouvernance du douar',
    titleAr: 'الاجتماع العام للمجتمع — حكم الدوار',
    description: 'Assemblée générale mensuelle de la communauté du douar pour discuter des enjeux collectifs, prendre les décisions communautaires et planifier les initiatives futures.',
    descriptionAr: 'جمعية عمومية شهرية لمجتمع الدوار لمناقشة القضايا الجماعية واتخاذ القرارات المجتمعية وتخطيط المبادرات المستقبلية.',
    scriptId: 'events-reunion',
    date: '2026-07-15',
    location: 'Espace communautaire du douar',
    category: 'reunion',
    status: 'planned',
    importance: 'important',
    organizer: 'ANATDC',
    internalNote: 'Ordre du jour : gestion de l\'eau, projets de développement, entraide.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'EVT-002',
    title: 'Fête locale — Célébration du patrimoine du douar',
    titleAr: 'الاحتفالية المحلية — الاحتفال بتراث الدوار',
    description: 'Fête annuelle du douar réunissant habitants et migrants pour célébrer le patrimoine collectif, partager les traditions culinaires et renforcer les liens communautaires.',
    descriptionAr: 'احتفالية سنوية للدوار تجمع السكان والمهاجرين للاحتفال بالتراث الجماعي وتبادل التقاليد الطهي وتعزيز الروابط المجتمعية.',
    scriptId: 'events-fete',
    date: '2026-08-20',
    location: 'Cour du Grenier d\'Agadir N\'Tguida',
    category: 'feteLocale',
    status: 'planned',
    importance: 'important',
    organizer: 'ANATDC',
    internalNote: 'Coordination avec diaspora pour participation à distance.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'EVT-003',
    title: 'Journée de nettoyage et d\'entretien collectif',
    titleAr: 'يوم التنظيف والصيانة الجماعية',
    description: 'Mobilisation collective pour entretenir les espaces publics du douar, les accès, les khettara et les zones communes — solidarité pratique et responsabilité partagée.',
    descriptionAr: 'التعبئة الجماعية للحفاظ على الأماكن العامة بالدوار والممرات والختارة والمناطق المشتركة — التضامن العملي والمسؤولية المشتركة.',
    scriptId: 'events-nettoyage',
    date: '2026-07-05',
    location: 'Douar Agadir N\'Tguida',
    category: 'nettoyage',
    status: 'planned',
    importance: 'normal',
    organizer: 'ANATDC',
    internalNote: 'Implication des familles et des jeunes.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readEvents(): CommunityEvent[] {
  const stored = localStorage.getItem(eventsStorageKey);
  if (!stored) return initialEvents;
  try {
    const parsed = JSON.parse(stored) as CommunityEvent[];
    if (parsed.length === 0) return initialEvents;
    return parsed.map((item) => {
      const initial = initialEvents.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'EVT-001': 'events-reunion',
        'EVT-002': 'events-fete',
        'EVT-003': 'events-nettoyage',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'events-init',
      };
    });
  } catch {
    return initialEvents;
  }
}

export function saveEvents(events: CommunityEvent[]) {
  localStorage.setItem(eventsStorageKey, JSON.stringify(events));
}