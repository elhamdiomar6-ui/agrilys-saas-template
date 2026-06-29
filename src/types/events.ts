export type EventCategory = 'reunion' | 'solidarite' | 'mosquee' | 'jeunesse' | 'agriculture' | 'patrimoine' | 'nettoyage' | 'formation' | 'feteLocale';
export type EventStatus = 'planned' | 'confirmed' | 'completed';
export type EventImportance = 'normal' | 'important' | 'urgent';

export type CommunityEvent = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  date: string;
  location: string;
  category: EventCategory;
  status: EventStatus;
  importance: EventImportance;
  organizer: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};