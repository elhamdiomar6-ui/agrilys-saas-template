export type YouthCategory = 'education' | 'sport' | 'culture' | 'solidarite' | 'environnement' | 'numerique' | 'agriculture' | 'patrimoine';
export type YouthStatus = 'idea' | 'preparing' | 'active' | 'completed';

export type YouthInitiative = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: YouthCategory;
  status: YouthStatus;
  responsible: string;
  date: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};