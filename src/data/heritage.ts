import type {
  HeritageAccessDifficulty,
  HeritageCategory,
  HeritageEconomicPotential,
  HeritageItem,
  HeritagePriority,
  HeritageSensitivity,
  HeritageStatus,
} from '../types/heritage';
import villageData from './village_data.json';

export const heritageStorageKey = 'agadirnetguida.heritage.v1';

const terrainDraftCreatedAt = '2026-06-01T00:00:00.000Z';
const heritageImagePaths = new Map(villageData.points_interet.map((item) => [item.id, item.images[0]]));

export const terrainDraftHeritageItems: HeritageItem[] = [
  {
    id: 'LOC_AGADIR_001',
    title: "Agadir n'Tguida / ⴰⴳⴰⴷⵉⵔ ⵏ ⵜⴳⵉⴷⴰ / أكادير نتقيدْا",
    category: 'architecture',
    description: "Édifié sur une crête stratégique à 1030m d'altitude, cet Agadir en pierres sèches servait de coffre-fort collectif contre les famines et les pillages. Il intègre des ruches traditionnelles murales uniques.",
    heritageValue: "هو القلب التاريخي ديال الدوار، تبنى بحجارة صلبة باش يحمي المخزون ديال العائلات (الشعير، الزيت، اللوز) والوراق المهمة من الجوع والسرقة. فيه جباحي ديال العسل مبنيين وسط الحيط.\n\nⴰⴳⴰⴷⵉⵔ ⵏ ⵜⴳⵉⴷⴰ ⵓⵍ ⵏ ⴷⴷⵓⵡⴰⵔ ⴰⴷ ⵉⴳⴰ. ⵉⵜⵜⵓⴱⵏⴰ ⵙ ⵉⵥⵕⴰⵏ ⴱⴰⵛ ⴰⴷ ⵉⵃⵟⵟⵓ ⵜⵓⵎⵣⵉⵏ ⴷ ⵣⵣⵉⵜ ⴼ ⵍⵍⴰⵥ ⴷ ⵉⵎⵛⵓⵎⵏ.",
    tourismInterest: 'Patrimoine historique principal du douar. Coordonnées GPS : 29.347893, -9.291229. Distance centre : 0 m. Niveau d intérêt : fort. Visitable : oui, avec prudence.',
    accessDifficulty: 'medium',
    economicPotential: 'high',
    priority: 'high',
    sensitivity: 'public',
    accessNotes: "Risques : risque d'éboulement partiel sur les structures non restaurées. Respecter le caractère privé des cases de stockage familiales.",
    internalNotes: 'Site principal validé pour publication publique. GPS : latitude 29.347893, longitude -9.291229.',
    verifiedAt: '',
    verifiedBy: '',
    status: 'published',
    published: true,
    photoPlanned: true,
    createdAt: terrainDraftCreatedAt,
    updatedAt: terrainDraftCreatedAt,
  },
  {
    id: 'LOC_MOSQUEE_002',
    title: 'Timzgida Taqbourt / ⵜⵉⵎⵣⴳⵉⴷⴰ ⵜⴰⵇⴱⵓⵔⵜ / المسجد القديم والمدرسة',
    category: 'mosquee',
    description: "Centre spirituel historique du village qui abritait l'ancienne école coranique pour l'apprentissage des enfants.",
    heritageValue: "الجامع القديم والمدرسة فين كانوا ولاد الدوار كيقراو ويكتبوا القران وكيتعلموا القواعد الأولى ديال الدين.\n\nⵜⵉⵎⵣⴳⵉⴷⴰ ⵜⴰⵇⴱⵓⵔⵜ ⴷ ⵜⵉⵏⵎⵍ ⵍⵍⵉ ⴳ ⵜⵜⵉⵏⵉⵏ ⵉⴼⵔⵅⴰⵏ ⵇⵇⵓﺮⴰⵏ ⴷ ⵜⵉⵔⵔⴰ ⴳ ⵓⵣⵎⵣ ⵉⵣⵔⵉⵏ.",
    tourismInterest: 'Spiritualité & Éducation. Coordonnées GPS : 29.346820, -9.289150. Distance approximative : 50 m. Niveau d intérêt : fort. Visitable : oui.',
    accessDifficulty: 'medium',
    economicPotential: 'medium',
    priority: 'high',
    sensitivity: 'caution',
    accessNotes: "Risques : toiture ancienne, prudence à l'intérieur.",
    internalNotes: 'GPS définitif : latitude 29.346820, longitude -9.289150.',
    verifiedAt: '',
    verifiedBy: '',
    status: 'published',
    published: true,
    photoPlanned: true,
    createdAt: terrainDraftCreatedAt,
    updatedAt: terrainDraftCreatedAt,
  },
  {
    id: 'LOC_PUITS_003',
    title: 'Tanout / Aghbalou / ⵜⴰⵏⵓⵜ / ⴰⵖⴱⴰⵍⵓ / البير التقليدي',
    category: 'water_points',
    description: "Le puits historique indispensable qui assurait l'approvisionnement en eau potable de tout le ksar.",
    heritageValue: "البير القديم اللي كان هو الروح ديال الدوار، منه كانوا الناس والعيالات كيجيبوا الما باش يعيشوا.\n\nⵜⴰⵏⵓⵜ ⵍⵍⵉ ⵣⴳ ⴷⴰ ⵜⵜⴰⴳⵎⵏ ⵉⵎⵣⴷⴰⵖ ⴰⵎⴰⵏ ⵉⵎⴰⵏ ⴱⴰⵛ ⴰⴷ ⴷⴷⵔⵏ ⴳ ⵓⴼⵍﻠا ⵏ ⵓⴷⵔⴰⵔ.",
    tourismInterest: 'Ressources vitales. Coordonnées GPS : 29.345850, -9.289620. Distance approximative : 150 m. Niveau d intérêt : fort. Visitable : oui.',
    accessDifficulty: 'medium',
    economicPotential: 'medium',
    priority: 'high',
    sensitivity: 'caution',
    accessNotes: 'Risques : risque de chute, garder la grille fermée.',
    internalNotes: 'GPS définitif : latitude 29.345850, longitude -9.289620.',
    verifiedAt: '',
    verifiedBy: '',
    status: 'published',
    published: true,
    photoPlanned: true,
    createdAt: terrainDraftCreatedAt,
    updatedAt: terrainDraftCreatedAt,
  },
  {
    id: 'LOC_PORTE_004',
    title: "Tagourt n'Oughrem / ⵜⴰⴳⵓⵔⵜ ⵏ ⵓⵖⵔⵎ / باب القصر القديم",
    category: 'architecture',
    description: "Ancienne porte fortifiée qui sécurisait l'accès des habitants à l'intérieur des remparts du ksar.",
    heritageValue: "الباب الكبيرة ديال القصر اللي كانت كتسد بالليل باش تحمي الناس من الخوف ومن الشفارة.\n\nⵜⴰଗⵓⵔⵜ ⵍⵍⵉ ⴷⴰ ⵉⵜⵜⵔⴳⴰⵍⵏ ⵙ ⵜⴳⴹⵡⵉن ⴱⴰⵛ ⴰⴷ ⵓري ⴽⵛⵎⵏ ⵉⵎⵛⵓⵎⵏ ⵙ ⵓⵖⵔⵎ.",
    tourismInterest: 'Architecture. Coordonnées GPS : 29.347120, -9.289350. Distance approximative : 30 m. Niveau d intérêt : moyen. Visitable : oui.',
    accessDifficulty: 'medium',
    economicPotential: 'medium',
    priority: 'medium',
    sensitivity: 'caution',
    accessNotes: 'Risques : passage escarpé sur les pierres.',
    internalNotes: 'GPS définitif : latitude 29.347120, longitude -9.289350.',
    verifiedAt: '',
    verifiedBy: '',
    status: 'published',
    published: true,
    photoPlanned: true,
    createdAt: terrainDraftCreatedAt,
    updatedAt: terrainDraftCreatedAt,
  },
  {
    id: 'LOC_BATTAGE_005',
    title: 'Anrar / ⴰⵏⵔⴰⵔ / المنـدر (نادر الشعير)',
    category: 'agricultural_landscapes',
    description: "Espace de battage collectif de l'orge, symbole du travail de solidarité (Twiza) après les récoltes.",
    heritageValue: "الـنادر فين كانت العائلات كتجمع وتدرس الشعير بالدواب باش تعزل الزرع على التبن فيام الصيف.\n\nⴰⵏⵔⴰⵔ ⵍⵍⵉ ⴳ ⴷⴰ ⵜⵜⵎⵢⴰⵡⴰⵙⵏ ⵉⵎⵣⴷⴰⵖ ⴳ ⵓⵣⵎⵣ ⵏ ⵜⵎⴳⵔⴰ ⴷ ⵓⴼⵔⴰ ⵏ ⵓⵎⵣⵉⵏ.",
    tourismInterest: 'Agriculture. Coordonnées GPS : 29.346510, -9.288400. Distance approximative : 100 m. Niveau d intérêt : moyen. Visitable : oui.',
    accessDifficulty: 'easy',
    economicPotential: 'medium',
    priority: 'medium',
    sensitivity: 'public',
    accessNotes: 'Risques : aucun risque particulier.',
    internalNotes: 'GPS définitif : latitude 29.346510, longitude -9.288400.',
    verifiedAt: '',
    verifiedBy: '',
    status: 'published',
    published: true,
    photoPlanned: true,
    createdAt: terrainDraftCreatedAt,
    updatedAt: terrainDraftCreatedAt,
  },
  {
    id: 'LOC_ASSOCIATION_006',
    title: "Timskert n'Association / ⵜⵉⵎⵙⴽⵔⵜ ⵏ ⵓⵎⵎⴰⵙ / مقر الجمعية والمدرسة الجديدة",
    category: 'collective_places',
    description: "Le bâtiment moderne dédié à l'alphabétisation, aux cours de soutien et à la gestion des projets du village.",
    heritageValue: "المقر الجديد ديال الجمعية فين كيداروا الاجتماعات وتدريس النساء ومشاريع التنمية ديال الدوار.\n\nⴰⵎⵎⴰⵙ ⵏ ⵜⵎⵙⴽⵔⵜ ⵍⵍⵉ ⴳ ⴷⴰ ⵜⵜⵎⵢⴰⵡⴰⴷⵏ ⵉⵎⵣⴷⴰⵖ ⴼ ⵉⵙնⴼⴰⵔⵏ ⵏ ⵡⴰⵎⴰⵏ ⴷ ⵜⵉⴼⴰⵡⵜ.",
    tourismInterest: 'Développement local. Coordonnées GPS : 29.347650, -9.287800. Distance approximative : 200 m. Niveau d intérêt : moyen. Visitable : oui.',
    accessDifficulty: 'easy',
    economicPotential: 'low',
    priority: 'medium',
    sensitivity: 'caution',
    accessNotes: 'Risques : aucun risque particulier.',
    internalNotes: 'GPS définitif : latitude 29.347650, longitude -9.287800.',
    verifiedAt: '',
    verifiedBy: '',
    status: 'published',
    published: true,
    photoPlanned: true,
    createdAt: terrainDraftCreatedAt,
    updatedAt: terrainDraftCreatedAt,
  },
];

const legacyCategories: HeritageCategory[] = [
  'architecture',
  'water_source',
  'agriculture',
  'mosquee',
  'landscape',
  'memory',
  'traditions',
  'collective_places',
  'agricultural_landscapes',
  'viewpoints',
  'walking_trails',
  'quranic_school',
  'oral_history',
  'water_points',
  'cave_shelter',
  'rock_engraving',
  'mineral_landscape',
  'local_products',
  'crafts',
  'local_meal',
  'homestay_potential',
  'local_guide',
  'photo_gallery',
  'tourism_map',
  'activity',
];

const statuses: HeritageStatus[] = ['published', 'validated_internal', 'to_verify'];
const accessDifficulties: HeritageAccessDifficulty[] = ['easy', 'medium', 'hard', 'to_verify'];
const economicPotentials: HeritageEconomicPotential[] = ['low', 'medium', 'high', 'to_verify'];
const priorities: HeritagePriority[] = ['high', 'medium', 'to_verify'];
const sensitivities: HeritageSensitivity[] = ['public', 'caution', 'sensitive'];

function asString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function asEnum<T extends string>(value: unknown, values: T[], fallback: T) {
  return typeof value === 'string' && values.includes(value as T) ? value as T : fallback;
}

function normalizeHeritageItem(raw: unknown): HeritageItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<HeritageItem>;
  const now = new Date().toISOString();
  const status = asEnum(item.status, statuses, item.published ? 'published' : 'to_verify');
  const sensitivity = asEnum(item.sensitivity, sensitivities, 'caution');

  return {
    id: asString(item.id) || `PAT-${Date.now()}`,
    title: asString(item.title),
    category: asEnum(item.category, legacyCategories, 'architecture'),
    description: asString(item.description),
    heritageValue: asString(item.heritageValue),
    tourismInterest: asString(item.tourismInterest),
    accessDifficulty: asEnum(item.accessDifficulty, accessDifficulties, 'to_verify'),
    economicPotential: asEnum(item.economicPotential, economicPotentials, 'to_verify'),
    priority: asEnum(item.priority, priorities, 'to_verify'),
    sensitivity,
    accessNotes: asString(item.accessNotes),
    internalNotes: asString(item.internalNotes),
    verifiedAt: asString(item.verifiedAt),
    verifiedBy: asString(item.verifiedBy),
    imagePath: asString(item.imagePath) || heritageImagePaths.get(asString(item.id)) || undefined,
    status,
    published: asBoolean(item.published, status === 'published' && sensitivity !== 'sensitive'),
    photoPlanned: asBoolean(item.photoPlanned, true),
    createdAt: asString(item.createdAt) || now,
    updatedAt: asString(item.updatedAt) || now,
  };
}

function mergeTerrainDrafts(items: HeritageItem[]) {
  const officialIds = new Set(terrainDraftHeritageItems.map((item) => item.id));
  const customItems = items.filter((item) => !officialIds.has(item.id));
  return [...terrainDraftHeritageItems, ...customItems].map((item) => ({
    ...item,
    imagePath: item.imagePath || heritageImagePaths.get(item.id),
  }));
}

function withHeritageImagePaths(items: HeritageItem[]) {
  return items.map((item) => ({
    ...item,
    imagePath: item.imagePath || heritageImagePaths.get(item.id),
  }));
}

export function readHeritageItems(): HeritageItem[] {
  const stored = localStorage.getItem(heritageStorageKey);
  if (!stored) return withHeritageImagePaths(terrainDraftHeritageItems);
  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return withHeritageImagePaths(terrainDraftHeritageItems);
    const normalized = parsed.map(normalizeHeritageItem).filter((item): item is HeritageItem => Boolean(item));
    return mergeTerrainDrafts(normalized);
  } catch {
    return withHeritageImagePaths(terrainDraftHeritageItems);
  }
}

export function saveHeritageItems(items: HeritageItem[]) {
  localStorage.setItem(heritageStorageKey, JSON.stringify(items));
}
