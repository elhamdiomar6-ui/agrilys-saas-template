import type { DiasporaInitiative } from '../types/diaspora';

import { getStorageKey } from '../lib/storage/storageUtils';
export const diasporaStorageKey = getStorageKey('diaspora', 'v3-with-arabic');

const NOW = '2026-06-22T00:00:00.000Z';

const initialDiasporaInitiatives: DiasporaInitiative[] = [
  {
    id: 'DIASP-001',
    title: 'Accompagnement des migrants — Soutien administratif et retour',
    titleAr: 'مرافقة المهاجرين — الدعم الإداري والعودة',
    description: 'Soutien administratif, orientation professionnelle et facilitation du retour temporaire ou définitif pour les habitants du douar vivant à l\'étranger. Prévention de l\'isolement administratif, facilitation des démarches de retour et de réinsertion professionnelle.',
    descriptionAr: 'الدعم الإداري والتوجيه المهني وتسهيل العودة المؤقتة أو الدائمة لسكان الدوار الذين يعيشون في الخارج. منع العزلة الإدارية وتسهيل إجراءات العودة وإعادة الإدماج المهني.',
    scriptId: 'diaspora-accompagnement',
    category: 'projectSupport',
    status: 'active',
    region: 'France, Belgique, Italie, Espagne',
    date: '2026-02-01',
    internalNote: 'Réseau de contact diaspora maintenu par l\'organisation. Assistance documentaire et accompagnement.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'DIASP-002',
    title: 'Participation à distance — Gouvernance et décisions collectives',
    titleAr: 'المشاركة عن بعد — حكم واتخاذ القرارات الجماعية',
    description: 'Habilitation des migrants à suivre la vie du douar, participer aux réunions communautaires et contribuer aux décisions collectives depuis l\'étranger. Accès aux informations, consultations en ligne et vote électronique pour les décisions stratégiques.',
    descriptionAr: 'تمكين المهاجرين من متابعة حياة الدوار والمشاركة في الاجتماعات المجتمعية والمساهمة في القرارات الجماعية من الخارج. الوصول إلى المعلومات والاستشارات عبر الإنترنت والتصويت الإلكتروني للقرارات الاستراتيجية.',
    scriptId: 'diaspora-participation',
    category: 'communityInvestment',
    status: 'active',
    region: 'Diaspora France, Belgique, Italie, Espagne',
    date: '2026-03-15',
    internalNote: 'Plateforme de communication mise en place. Réunions diffusées mensuellement.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'DIASP-003',
    title: 'Investissements diaspora — Soutien financier aux projets collectifs',
    titleAr: 'استثمارات الجالية — الدعم المالي للمشاريع الجماعية',
    description: 'Canalisation de l\'épargne et des investissements des migrants vers les projets de développement du douar (eau, énergie, agriculture, routes). Facilitation du financement participatif pour les initiatives communautaires et économiques.',
    descriptionAr: 'توجيه الادخار والاستثمارات من المهاجرين نحو مشاريع تطوير الدوار (المياه والطاقة والزراعة والطرق). تيسير التمويل التشاركي للمبادرات المجتمعية والاقتصادية.',
    scriptId: 'diaspora-investissements',
    category: 'communityInvestment',
    status: 'idea',
    region: 'France, Belgique, Italie, Espagne',
    date: '2026-04-10',
    internalNote: 'Étude de mécanismes de financement en cours. Projet de coopérative d\'épargne.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readDiasporaInitiatives(): DiasporaInitiative[] {
  const stored = localStorage.getItem(diasporaStorageKey);
  if (!stored) return initialDiasporaInitiatives;

  try {
    const parsed = JSON.parse(stored) as DiasporaInitiative[];
    if (parsed.length === 0) return initialDiasporaInitiatives;
    return parsed.map((item) => {
      const initial = initialDiasporaInitiatives.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'DIASP-001': 'diaspora-accompagnement',
        'DIASP-002': 'diaspora-participation',
        'DIASP-003': 'diaspora-investissements',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'diaspora-init',
      };
    });
  } catch {
    return initialDiasporaInitiatives;
  }
}

export function saveDiasporaInitiatives(initiatives: DiasporaInitiative[]) {
  localStorage.setItem(diasporaStorageKey, JSON.stringify(initiatives));
}