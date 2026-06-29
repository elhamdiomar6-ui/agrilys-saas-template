export type TimelineCategory = 'foundation' | 'water' | 'agriculture' | 'mosquee' | 'climate' | 'solidarity' | 'development' | 'collective_projects' | 'heritage' | 'education';
export type TimelineImportance = 'normal' | 'important' | 'major_historical';
export type TimelineStatus = 'verified' | 'to_confirm';

export type TimelineEvent = {
  id: string;
  period: string;
  period_ar?: string;
  event: string;
  event_ar?: string;
  description: string;
  description_ar?: string;
  category: TimelineCategory;
  importance: TimelineImportance;
  status: TimelineStatus;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
