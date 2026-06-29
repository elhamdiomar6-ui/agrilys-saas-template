import type { TimelineEvent } from '../types/timeline';

import { getStorageKey } from '../lib/storage/storageUtils';
export const timelineStorageKey = getStorageKey('timeline', 'v1');

const NOW = '2026-06-21T00:00:00.000Z';

export const initialTimelineEvents: TimelineEvent[] = [
  {
    id: 'TL-001',
    period: 'Vers 1620',
    period_ar: 'نحو القرن 17',
    event: "Construction du <CULTURAL_HERITAGE>,
    event_ar: 'بناء المخزن الجماعي لأكادير نتڭيدا',
    description:
      "Les tribus Majjat Aït Moussa construisent le <CULTURAL_HERITAGE>, reconnaissable à sa forme circulaire distinctive. Ce patrimoine ancestral est la propriété collective de la communauté. L'<ORGANIZATION_NAME> est la seule structure représentative de cette communauté propriétaire.",
    description_ar:
      'بنت قبائل الأخصاص آيت موسى مخزن أكادير نتڭيدا الجماعي، المتميز بشكله الدائري الفريد. يمثل هذا الإرث الأجدادي ملكية جماعية للمجتمع. وتُعدّ جمعية <ORGANIZATION_NAME> الهيئة التمثيلية الوحيدة للمجتمع المالك لهذا التراث.',
    category: 'heritage',
    importance: 'major_historical',
    status: 'to_confirm',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'TL-002',
    period: '30 juin 1969',
    period_ar: '30 يونيو 1969',
    event: "Récupération de Sidi Ifni — Résistance des Aït Baamrane",
    event_ar: 'استعادة سيدي إفني — مقاومة قبائل آيت باعمران',
    description:
      "Le 30 juin 1969, le Maroc récupère la ville de Sidi Ifni après 33 ans de présence espagnole (depuis 1934). Cet événement historique est marqué par la résistance des tribus Aït Baamrane et est commémoré chaque année dans la région. Le douar <COMMUNITY_NAME>, situé dans la zone tribale des Khssas voisine des Aït Baamrane, partage cette mémoire collective de résistance et d'attachement à la souveraineté nationale.",
    description_ar:
      'في 30 يونيو 1969، استعاد المغرب مدينة سيدي إفني بعد 33 سنة من الوجود الإسباني (منذ 1934). وقد اتسم هذا الحدث التاريخي بمقاومة قبائل آيت باعمران، ويُحتفى به كل سنة في المنطقة. ويشترك دوار أكادير نتڭيدا، الواقع في المنطقة القبلية للخصاص المجاورة لآيت باعمران، في هذه الذاكرة الجماعية للمقاومة والتمسك بالسيادة الوطنية.',
    category: 'heritage',
    importance: 'major_historical',
    status: 'verified',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'TL-003',
    period: '2018',
    period_ar: '2018',
    event: "Inventaire du patrimoine — 50+ <CULTURAL_HERITAGE>,
    event_ar: 'جرد التراث — حصر أكثر من 50 مخزناً جماعياً',
    description:
      "En 2018, un inventaire conjoint réalisé par la Direction régionale de la Culture et une association locale recense plus de 50 forts et <CULTURAL_HERITAGE>, dont ceux de Boutrouch, Tabaaroust et Izrwalen. <COMMUNITY_NAME> est identifié comme le plus grand <CULTURAL_HERITAGE>. L'<ORGANIZATION_NAME> est la seule structure représentative de la communauté propriétaire de ce patrimoine.",
    description_ar:
      'في سنة 2018، أجرى جرداً مشتركاً بين المديرية الجهوية للثقافة وجمعية محلية، رصد أكثر من 50 حصناً ومخزناً جماعياً تاريخياً في منطقة بوطروش وما حولها، من بينها حصون بوطروش وتابعروست وإزروالن. وقد تم التعرف على أكادير نتڭيدا باعتباره أكبر مخزن جماعي قبلي في المنطقة، والموقع الوحيد الذي استفاد من مشروع للترميم في ذلك التاريخ. وتُعدّ جمعية <ORGANIZATION_NAME> الهيئة التمثيلية الوحيدة للمجتمع المالك لهذا الموروث.',
    category: 'heritage',
    importance: 'important',
    status: 'verified',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'TL-004',
    period: 'Décembre 2020',
    period_ar: 'ديسمبر 2020',
    event: "Enquête publique — Classement national du <CULTURAL_HERITAGE>.O. n°6941)",
    event_ar: 'بحث عمومي — التصنيف الوطني للمخزن (ج.ر. عدد 6941)',
    description:
      "En décembre 2020, le Journal Officiel n°6941 publie l'avis d'enquête publique préalable au classement d'<COMMUNITY_NAME> parmi les monuments historiques nationaux. Cette étape formelle marque la reconnaissance institutionnelle du <CULTURAL_HERITAGE>. L'<ORGANIZATION_NAME> est la seule structure représentative de la communauté propriétaire impliquée dans cette procédure officielle de classement.",
    description_ar:
      'في ديسمبر 2020، نشرت الجريدة الرسمية عدد 6941 إعلاناً بفتح بحث عمومي تمهيداً لتصنيف مخزن أكادير نتڭيدا ضمن المعالم التاريخية الوطنية. وتمثل هذه المرحلة الرسمية اعترافاً مؤسسياً بالمخزن الجماعي من طرف الدولة المغربية. وتُعدّ جمعية <ORGANIZATION_NAME> الهيئة التمثيلية الوحيدة للمجتمع المالك المعنية بهذا الإجراء الرسمي.',
    category: 'heritage',
    importance: 'major_historical',
    status: 'verified',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'TL-005',
    period: 'Mars 2026',
    period_ar: 'مارس 2026',
    event: "Décret gouvernemental — Classement officiel du <CULTURAL_HERITAGE>,
    event_ar: 'مرسوم حكومي — التصنيف الرسمي للمخزن معلمة تاريخية وطنية',
    description:
      "En mars 2026, un décret gouvernemental classe officiellement le <CULTURAL_HERITAGE>. Cette reconnaissance consacre la valeur patrimoniale exceptionnelle du site. L'<ORGANIZATION_NAME>, seule structure représentative de la communauté propriétaire, est partie prenante dans la protection et la valorisation de ce patrimoine classé.",
    description_ar:
      'في مارس 2026، صادقت الحكومة بمرسوم رسمي على تصنيف مخزن أكادير نتڭيدا الجماعي ضمن المعالم التاريخية الوطنية للمملكة المغربية. ويُكرّس هذا الاعتراف القيمة التراثية الاستثنائية للموقع. وتُعدّ جمعية <ORGANIZATION_NAME>، باعتبارها الهيئة التمثيلية الوحيدة للمجتمع المالك، طرفاً أساسياً في حماية هذا الموروث المصنَّف وتثمينه.',
    category: 'heritage',
    importance: 'major_historical',
    status: 'verified',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'TL-006',
    period: '6 juin 2026',
    period_ar: '6 يونيو 2026',
    event: "AG extraordinaire <ORGANIZATION_NAME> — Élection du bureau directeur de 13 membres",
    event_ar: 'الجمع العام الاستثنائي لـ <ORGANIZATION_NAME> — انتخاب مكتب مسير من 13 عضواً',
    description:
      "Le 6 juin 2026, l'Assemblée Générale extraordinaire de l'<ORGANIZATION_NAME> (Association <COMMUNITY_NAME> de Développement et de Coopération) élit un bureau directeur de 13 membres représentant les familles du douar. Cette réunion historique marque un tournant dans la gouvernance de l'association et ouvre une nouvelle phase de développement pour le douar et son patrimoine classé. L'<ORGANIZATION_NAME> est la seule structure représentative de la communauté propriétaire du <CULTURAL_HERITAGE>.",
    description_ar:
      'في 6 يونيو 2026، انعقد الجمع العام الاستثنائي لجمعية أكادير نتڭيدا للتنمية والتعاون (<ORGANIZATION_NAME>)، وانتخب مكتباً مسيراً جديداً يضم 13 عضواً يمثلون أسر الدوار. ويُعدّ هذا الاجتماع التاريخي منعطفاً في حوكمة الجمعية، ويفتح مرحلة جديدة من التنمية للدوار وتراثه المصنَّف. وتُعدّ جمعية <ORGANIZATION_NAME> الهيئة التمثيلية الوحيدة للمجتمع المالك لمخزن أكادير نتڭيدا.',
    category: 'collective_projects',
    importance: 'major_historical',
    status: 'verified',
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export function readTimelineEvents(): TimelineEvent[] {
  const stored = localStorage.getItem(timelineStorageKey);
  if (!stored) return initialTimelineEvents;
  try {
    const parsed = JSON.parse(stored) as TimelineEvent[];
    return parsed.length > 0 ? parsed : initialTimelineEvents;
  } catch {
    return initialTimelineEvents;
  }
}

export function saveTimelineEvents(events: TimelineEvent[]) {
  localStorage.setItem(timelineStorageKey, JSON.stringify(events));
}
