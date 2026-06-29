import type { WaterInformation } from '../types/water';

import { getStorageKey } from '../lib/storage/storageUtils';
export const waterStorageKey = getStorageKey('water', 'v3-with-arabic');

const NOW = '2026-06-22T00:00:00.000Z';

const initialWaterInformations: WaterInformation[] = [
  {
    id: 'WATER-001',
    title: 'Maintenance des khettara — Nettoyage et restauration',
    titleAr: 'صيانة الختارة — التنظيف والاستعادة',
    description: 'Suivi régulier de l\'entretien des tunnels d\'irrigation souterrains (khettara) du douar, incluant le dégagement des obstructions, la réparation des sections endommagées et la gestion collective de l\'eau.',
    descriptionAr: 'المراقبة المنتظمة لصيانة أنفاق السقي تحت الأرض (الختارة) بالدوار، بما في ذلك تفريغ الانسدادات وإصلاح الأقسام التالفة والإدارة المشتركة للمياه.',
    scriptId: 'water-maintenance',
    category: 'maintenance',
    status: 'normal',
    date: '2026-04-10',
    responsible: '' // Client-specific,
    internalNote: 'Cycle d\'entretien trimestriel. Mobilisation familiale.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'WATER-002',
    title: 'Qualité de l\'eau — Suivi et analyse',
    titleAr: 'جودة المياه — المراقبة والتحليل',
    description: 'Programme de monitoring de la qualité de l\'eau du douar pour s\'assurer que les sources (khettara, puits) restent propres et saines pour la consommation et l\'agriculture.',
    descriptionAr: 'برنامج مراقبة جودة المياه بالدوار للتأكد من أن المصادر (الختارة والآبار) تبقى نظيفة وصحية للاستهلاك والزراعة.',
    scriptId: 'water-qualite',
    category: 'qualiteEau',
    status: 'normal',
    date: '2026-01-15',
    responsible: '' // Client-specific,
    internalNote: 'Tests semestriels avec laboratoire régional.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'WATER-003',
    title: 'Projet hydraulique — Retenue d\'eau saisonnière',
    titleAr: 'مشروع هيدروليكي — خزان المياه الموسمي',
    description: 'Projet de construction d\'une petite retenue d\'eau pour stocker les flux saisonniers, améliorer la disponibilité d\'eau en saison sèche et soutenir l\'agriculture du douar.',
    descriptionAr: 'مشروع بناء خزان مياه صغير لتخزين التدفقات الموسمية وتحسين توفر المياه في الموسم الجاف ودعم زراعة الدوار.',
    scriptId: 'water-hydraulique',
    category: 'projetHydraulique',
    status: 'project',
    date: '2026-06-01',
    responsible: '' // Client-specific,
    internalNote: 'Étude technique et consultation communautaire en cours.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readWaterInformations(): WaterInformation[] {
  const stored = localStorage.getItem(waterStorageKey);
  if (!stored) return initialWaterInformations;
  try {
    const parsed = JSON.parse(stored) as WaterInformation[];
    if (parsed.length === 0) return initialWaterInformations;
    return parsed.map((item) => {
      const initial = initialWaterInformations.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'WATER-001': 'water-maintenance',
        'WATER-002': 'water-qualite',
        'WATER-003': 'water-hydraulique',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'water-init',
      };
    });
  } catch {
    return initialWaterInformations;
  }
}

export function saveWaterInformations(items: WaterInformation[]) {
  localStorage.setItem(waterStorageKey, JSON.stringify(items));
}