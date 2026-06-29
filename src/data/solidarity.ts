import type { SolidarityAction } from '../types/solidarity';

import { getStorageKey } from '../lib/storage/storageUtils';
export const solidarityStorageKey = getStorageKey('solidarity', 'v3-with-arabic');

const NOW = '2026-06-22T00:00:00.000Z';

const initialSolidarityActions: SolidarityAction[] = [
  {
    id: 'SOLIDY-001',
    title: 'Entraide familiale — Soutien en cas de difficultés',
    titleAr: 'المساعدة المتبادلة بين العائلات — الدعم في أوقات الصعوبات',
    description: 'Réseau d\'entraide pour aider les familles face aux crises (décès, maladie, chômage, accident). Mobilisation collective pour les travaux agricoles, le financement d\'urgence et l\'accompagnement social des ménages en difficulté.',
    descriptionAr: 'شبكة مساعدة متبادلة لدعم العائلات في مواجهة الأزمات (الوفيات والمرض والبطالة والحوادث). التعبئة الجماعية للأعمال الزراعية والتمويل الطارئ والدعم الاجتماعي للأسر المحتاجة.',
    scriptId: 'solidarity-familiale',
    category: 'solidarite',
    status: 'active',
    organizer: '', // Client-specific
    date: '2026-01-10',
    internalNote: 'Fonds de solidarité géré collectivement. Interventions rapides.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'SOLIDY-002',
    title: 'Assistance sanitaire — Soutien pour l\'accès aux soins',
    titleAr: 'الدعم الصحي — المساعدة للوصول إلى الرعاية',
    description: 'Aide à l\'accès aux services de santé pour les familles sans moyens : transport vers cliniques, frais de consultation, médicaments et suivi post-traitement en partenariat avec agents sanitaires régionaux.',
    descriptionAr: 'المساعدة في الوصول إلى خدمات الصحة للعائلات الفقيرة: النقل إلى العيادات وتكاليف الاستشارات والأدوية والمتابعة بعد العلاج بالشراكة مع الوكلاء الصحيين الإقليميين.',
    scriptId: 'solidarity-sante',
    category: 'sante',
    status: 'active',
    organizer: '', // Client-specific
    date: '2026-02-15',
    internalNote: 'Partenariat avec infirmière régionale. Campagnes semestrielles.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'SOLIDY-003',
    title: 'Aide alimentaire saisonnière — Soutien nutritionnel',
    titleAr: 'المساعدة الغذائية الموسمية — الدعم التغذوي',
    description: 'Distribution de provisions alimentaires et d\'eau en saison sèche et aux périodes de soudure (juin-septembre) pour assurer la sécurité alimentaire des familles les plus vulnérables du douar.',
    descriptionAr: 'توزيع المواد الغذائية والمياه في الموسم الجاف وفترات الجوع (يونيو-سبتمبر) لضمان الأمن الغذائي للعائلات الأكثر ضعفاً بالدوار.',
    scriptId: 'solidarity-alimentaire',
    category: 'alimentation',
    status: 'preparing',
    organizer: '', // Client-specific
    date: '2026-05-20',
    internalNote: 'Stock préparé. Distribution prévue avant soudure estivale.',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readSolidarityActions(): SolidarityAction[] {
  const stored = localStorage.getItem(solidarityStorageKey);
  if (!stored) return initialSolidarityActions;
  try {
    const parsed = JSON.parse(stored) as SolidarityAction[];
    if (parsed.length === 0) return initialSolidarityActions;
    return parsed.map((item) => {
      const initial = initialSolidarityActions.find((init) => init.id === item.id);
      const defaultScriptIds: Record<string, string> = {
        'SOLIDY-001': 'solidarity-familiale',
        'SOLIDY-002': 'solidarity-sante',
        'SOLIDY-003': 'solidarity-alimentaire',
      };
      return {
        ...item,
        titleAr: item.titleAr || initial?.titleAr || '',
        descriptionAr: item.descriptionAr || initial?.descriptionAr || '',
        scriptId: item.scriptId || defaultScriptIds[item.id] || initial?.scriptId || 'solidarity-init',
      };
    });
  } catch {
    return initialSolidarityActions;
  }
}

export function saveSolidarityActions(actions: SolidarityAction[]) {
  localStorage.setItem(solidarityStorageKey, JSON.stringify(actions));
}