export type AgricultureCategory = 'irrigation' | 'oliviers' | 'amandiers' | 'elevage' | 'entretienTerres' | 'environnement' | 'reboisement' | 'agricultureDurable';
export type AgricultureStatus = 'preparing' | 'active' | 'seasonal' | 'completed';

export type AgricultureInitiative = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: AgricultureCategory;
  status: AgricultureStatus;
  date: string;
  responsible: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};