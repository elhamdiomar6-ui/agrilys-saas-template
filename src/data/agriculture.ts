import type { AgricultureInitiative } from '../types/agriculture';

export const agricultureStorageKey = 'agadirnetguida.agriculture.v3-with-arabic';

const NOW = '2026-06-22T00:00:00.000Z';

const initialAgricultureInitiatives: AgricultureInitiative[] = [
  {
    id: 'AGR-001',
    title: 'Préservation des oliviers — Variétés ancestrales du douar',
    titleAr: 'حماية أشجار الزيتون — الأنواع التقليدية للدوار',
    description: 'Programme de protection et de documentation des oliviers traditionnels du douar, pour préserver les variétés locales adaptées au climat Anti-Atlas et valoriser le patrimoine agricole.',
    descriptionAr: 'برنامج حماية وتوثيق أشجار الزيتون التقليدية بالدوار، للحفاظ على الأنواع المحلية المتكيفة مع مناخ الأطلس الصغير وتثمين التراث الزراعي.',
    scriptId: 'agriculture-oliviers',
    category: 'oliviers',
    status: 'active',
    date: '2026-03-15',
    responsible: 'ANATDC',
    internalNote: 'Documentation en cours avec experts régionaux.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'AGR-002',
    title: 'Système d\'irrigation communautaire — Gestion collective de l\'eau',
    titleAr: 'نظام السقي الجماعي — الإدارة المشتركة للمياه',
    description: 'Suivi collectif des sources d\'eau du douar, maintien des khettara (tunnels d\'irrigation souterrains) et gestion partagée des ressources hydriques entre les familles.',
    descriptionAr: 'المراقبة المشتركة لمصادر المياه بالدوار، الحفاظ على الختارة (أنفاق السقي تحت الأرض) والإدارة المشتركة للموارد المائية بين الأسر.',
    scriptId: 'agriculture-irrigation',
    category: 'irrigation',
    status: 'active',
    date: '2026-02-10',
    responsible: 'ANATDC',
    internalNote: 'Réunions mensuelles de coordination. Respect des droits d\'eau traditionnels.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'AGR-003',
    title: 'Reboisement et reforestation — Lutte contre l\'érosion',
    titleAr: 'التشجير وإعادة التشجير — محاربة التعرية',
    description: 'Initiative de plantation d\'arbres d\'arganier et d\'amandier pour stabiliser les sols, améliorer le couvert végétal et adapter le douar aux défis climatiques de la région.',
    descriptionAr: 'مبادرة غرس أشجار الأرجان واللوز لتثبيت التربة وتحسين الغطاء النباتي وتكيف الدوار مع التحديات المناخية للمنطقة.',
    scriptId: 'agriculture-reboisement',
    category: 'reboisement',
    status: 'preparing',
    date: '2026-05-01',
    responsible: 'ANATDC',
    internalNote: 'Plans d\'aménagement finalisés. Lancement automne 2026.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readAgricultureInitiatives(): AgricultureInitiative[] {
  const stored = localStorage.getItem(agricultureStorageKey);
  if (!stored) return initialAgricultureInitiatives;
  try {
    const parsed = JSON.parse(stored) as AgricultureInitiative[];
    if (parsed.length === 0) return initialAgricultureInitiatives;
    // Ensure all parsed items have required fields (titleAr, descriptionAr, scriptId)
    return parsed.map((item) => {
      const initial = initialAgricultureInitiatives.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'AGR-001': 'agriculture-oliviers',
        'AGR-002': 'agriculture-irrigation',
        'AGR-003': 'agriculture-reboisement',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'agriculture-init',
      };
    });
  } catch {
    return initialAgricultureInitiatives;
  }
}

export function saveAgricultureInitiatives(initiatives: AgricultureInitiative[]) {
  localStorage.setItem(agricultureStorageKey, JSON.stringify(initiatives));
}