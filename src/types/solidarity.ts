export type SolidarityCategory = 'solidarite' | 'sante' | 'familles' | 'urgence' | 'benevolat' | 'alimentation' | 'education' | 'environnement';
export type SolidarityStatus = 'preparing' | 'active' | 'completed';

export type SolidarityAction = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: SolidarityCategory;
  status: SolidarityStatus;
  date: string;
  organizer: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};