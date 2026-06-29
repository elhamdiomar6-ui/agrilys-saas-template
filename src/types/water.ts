export type WaterCategory = 'forage' | 'reservoir' | 'reseau' | 'maintenance' | 'qualiteEau' | 'sensibilisation' | 'projetHydraulique';
export type WaterStatus = 'normal' | 'maintenance' | 'alert' | 'project';

export type WaterInformation = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: WaterCategory;
  status: WaterStatus;
  date: string;
  responsible: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};