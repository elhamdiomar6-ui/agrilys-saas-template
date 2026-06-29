export type AnnouncementCategory = 'reunion' | 'travaux' | 'eau' | 'mosquee' | 'evenement' | 'info';
export type AnnouncementImportance = 'normal' | 'important' | 'urgent';

export type PublicAnnouncement = {
  id: string;
  title: string;
  date: string;
  category: AnnouncementCategory;
  importance: AnnouncementImportance;
  content: string;
  updatedAt: string;
};
