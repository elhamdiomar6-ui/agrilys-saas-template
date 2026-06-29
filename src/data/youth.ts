import type { YouthInitiative } from '../types/youth';

import { getStorageKey } from '../lib/storage/storageUtils';
export const youthStorageKey = getStorageKey('youth', 'v3-with-arabic');

const NOW = '2026-06-22T00:00:00.000Z';

const initialYouthInitiatives: YouthInitiative[] = [
  {
    id: 'YOUTH-001',
    title: 'Soutien scolaire et alphabétisation — Accompagnement des jeunes',
    titleAr: 'الدعم الدراسي والتعليم الأساسي — مرافقة الشباب',
    description: 'Programme d\'accompagnement scolaire pour les jeunes du douar, incluant l\'aide aux devoirs, la préparation aux examens et l\'alphabétisation des jeunes adultes ne sachant ni lire ni écrire.',
    descriptionAr: 'برنامج المرافقة الدراسية للشباب بالدوار، يشمل المساعدة في الواجبات والتحضير للامتحانات وتعليم القراءة والكتابة للشباب البالغين الأميين.',
    scriptId: 'youth-education',
    category: 'education',
    status: 'active',
    responsible: '' // Client-specific,
    date: '2026-01-20',
    internalNote: 'Bénévoles de la communauté. Séances 2-3 fois par semaine.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'YOUTH-002',
    title: 'Activités sportives et loisirs — Développement physique et cohésion',
    titleAr: 'الأنشطة الرياضية والترفيهية — التطور البدني والتماسك',
    description: 'Organisation de matchs de football, courses d\'orientation et activités de plein air pour renforcer la cohésion entre jeunes, favoriser un mode de vie sain et créer des espaces d\'expression loin des travaux agricoles.',
    descriptionAr: 'تنظيم مباريات كرة القدم والسباقات الموجهة والأنشطة في الهواء الطلق لتعزيز التماسك بين الشباب وتعزيز أسلوب حياة صحي وخلق مساحات للتعبير بعيداً عن الأعمال الزراعية.',
    scriptId: 'youth-sport',
    category: 'sport',
    status: 'active',
    responsible: '' // Client-specific,
    date: '2026-02-05',
    internalNote: 'Terrains aménagés du douar. Participation libre et gratuite.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'YOUTH-003',
    title: 'Transmission du patrimoine — Ateliers de culture et traditions',
    titleAr: 'نقل التراث — ورش الثقافة والتقاليد',
    description: 'Ateliers de danse traditionnelle, musique locale, contes et légendes du douar pour que les jeunes connaissent et valorisent leur patrimoine culturel face aux influences extérieures.',
    descriptionAr: 'ورش الرقص التقليدي والموسيقى المحلية والحكايات والأساطير بالدوار لكي يتعرف الشباب على تراثهم الثقافي ويثمنوه في مواجهة التأثيرات الخارجية.',
    scriptId: 'youth-patrimoine',
    category: 'patrimoine',
    status: 'preparing',
    responsible: '' // Client-specific,
    date: '2026-06-01',
    internalNote: 'Coordination avec les aînés du douar. Début de saison estivale.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readYouthInitiatives(): YouthInitiative[] {
  const stored = localStorage.getItem(youthStorageKey);
  if (!stored) return initialYouthInitiatives;
  try {
    const parsed = JSON.parse(stored) as YouthInitiative[];
    if (parsed.length === 0) return initialYouthInitiatives;
    return parsed.map((item) => {
      const initial = initialYouthInitiatives.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'YOUTH-001': 'youth-education',
        'YOUTH-002': 'youth-sport',
        'YOUTH-003': 'youth-patrimoine',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'youth-init',
      };
    });
  } catch {
    return initialYouthInitiatives;
  }
}

export function saveYouthInitiatives(initiatives: YouthInitiative[]) {
  localStorage.setItem(youthStorageKey, JSON.stringify(initiatives));
}