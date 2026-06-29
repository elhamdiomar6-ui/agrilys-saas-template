import type { CooperativeInitiative } from '../types/cooperatives';

import { getStorageKey } from '../lib/storage/storageUtils';
export const cooperativesStorageKey = getStorageKey('cooperatives', 'v3-with-arabic');

const NOW = '2026-06-22T00:00:00.000Z';

const initialCooperativeInitiatives: CooperativeInitiative[] = [
  {
    id: 'COOP-001',
    title: 'Coopérative d\'arganier — Valorisation du patrimoine',
    titleAr: 'تعاونية الأرجان — تثمين التراث',
    description: 'Coopérative pour l\'exploitation durable de l\'arganier, la production d\'huile d\'argan et la commercialisation des produits traditionnels du douar auprès des marchés locaux et régionaux.',
    descriptionAr: 'تعاونية لاستغلال شجرة الأرجان بطريقة مستدامة وإنتاج زيت الأرجان وتسويق منتجات الدوار التقليدية في الأسواق المحلية والإقليمية.',
    scriptId: 'cooperatives-terroir',
    category: 'produitsTerroir',
    status: 'active',
    date: '2025-09-15',
    responsible: '', // Client-specific
    internalNote: 'Partenariat avec les femmes du douar pour production et emballage.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'COOP-002',
    title: 'Coopérative d\'artisanat — Savoir-faire local',
    titleAr: 'تعاونية الحرف اليدوية — المعرفة المحلية',
    description: 'Regroupement des artisans du douar (tissage, poterie, menuiserie) pour préserver les techniques traditionnelles, former les jeunes et créer des revenus à partir de l\'artisanat.',
    descriptionAr: 'تجميع حرفيي الدوار (النسج والفخار والنجارة) للحفاظ على التقنيات التقليدية وتكوين الشباب وإنشاء دخل من الحرف اليدوية.',
    scriptId: 'cooperatives-artisanat',
    category: 'artisanat',
    status: 'development',
    date: '2026-04-20',
    responsible: '', // Client-specific
    internalNote: 'Formation en cours pour les jeunes artisans du douar.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'COOP-003',
    title: 'Coopérative d\'élevage — Gestion communautaire des troupeaux',
    titleAr: 'تعاونية تربية الماشية — إدارة القطعان بشكل جماعي',
    description: 'Coopérative regroupant les éleveurs du douar pour partager les ressources fourragères, améliorer les races locales (chèvres, moutons) et garantir un revenu stable aux familles.',
    descriptionAr: 'تعاونية تجمع مربي الماشية بالدوار لمشاركة الموارد العلفية وتحسين السلالات المحلية (الماعز والأغنام) وضمان دخل مستقر للعائلات.',
    scriptId: 'cooperatives-elevage',
    category: 'elevage',
    status: 'active',
    date: '2025-07-10',
    responsible: '', // Client-specific
    internalNote: 'Partenariat avec vétérinaire régional pour suivi sanitaire.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readCooperativeInitiatives(): CooperativeInitiative[] {
  const stored = localStorage.getItem(cooperativesStorageKey);
  if (!stored) return initialCooperativeInitiatives;

  try {
    const parsed = JSON.parse(stored) as CooperativeInitiative[];
    if (parsed.length === 0) return initialCooperativeInitiatives;
    return parsed.map((item) => {
      const initial = initialCooperativeInitiatives.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'COOP-001': 'cooperatives-terroir',
        'COOP-002': 'cooperatives-artisanat',
        'COOP-003': 'cooperatives-elevage',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'cooperatives-init',
      };
    });
  } catch {
    return initialCooperativeInitiatives;
  }
}

export function saveCooperativeInitiatives(initiatives: CooperativeInitiative[]) {
  localStorage.setItem(cooperativesStorageKey, JSON.stringify(initiatives));
}