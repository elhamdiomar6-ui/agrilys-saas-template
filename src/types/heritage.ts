export type HeritageCategory =
  | 'architecture'
  | 'water_source'
  | 'agriculture'
  | 'mosquee'
  | 'landscape'
  | 'memory'
  | 'traditions'
  | 'collective_places'
  | 'agricultural_landscapes'
  | 'viewpoints'
  | 'walking_trails'
  | 'quranic_school'
  | 'oral_history'
  | 'water_points'
  | 'cave_shelter'
  | 'rock_engraving'
  | 'mineral_landscape'
  | 'local_products'
  | 'crafts'
  | 'local_meal'
  | 'homestay_potential'
  | 'local_guide'
  | 'photo_gallery'
  | 'tourism_map'
  | 'activity';

export type HeritageStatus = 'published' | 'validated_internal' | 'to_verify';
export type HeritageAccessDifficulty = 'easy' | 'medium' | 'hard' | 'to_verify';
export type HeritageEconomicPotential = 'low' | 'medium' | 'high' | 'to_verify';
export type HeritagePriority = 'high' | 'medium' | 'to_verify';
export type HeritageSensitivity = 'public' | 'caution' | 'sensitive';

export type HeritageItem = {
  id: string;
  title: string;
  category: HeritageCategory;
  description: string;
  heritageValue: string;
  tourismInterest: string;
  accessDifficulty: HeritageAccessDifficulty;
  economicPotential: HeritageEconomicPotential;
  priority: HeritagePriority;
  sensitivity: HeritageSensitivity;
  accessNotes: string;
  internalNotes: string;
  verifiedAt: string;
  verifiedBy: string;
  imagePath?: string;
  status: HeritageStatus;
  published: boolean;
  photoPlanned: boolean;
  createdAt: string;
  updatedAt: string;
};
