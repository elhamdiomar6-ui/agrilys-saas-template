export type CooperativeCategory =
  | 'agriculture'
  | 'artisanat'
  | 'produitsTerroir'
  | 'elevage'
  | 'transformationAlimentaire'
  | 'tourismeRural'
  | 'jeunesse'
  | 'femmesRurales';

export type CooperativeStatus = 'idea' | 'active' | 'development' | 'completed';

export type CooperativeInitiative = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: CooperativeCategory;
  status: CooperativeStatus;
  date: string;
  responsible: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};