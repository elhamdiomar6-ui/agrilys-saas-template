export type PublicDocumentCategory = 'official_announcements' | 'public_minutes' | 'douar_documents' | 'public_rules' | 'community_projects';
export type PublicDocumentStatus = 'available' | 'coming_soon';

export type PublicDocument = {
  id: string;
  title: string;
  category: PublicDocumentCategory;
  date: string;
  description: string;
  status: PublicDocumentStatus;
  fileUrl?: string;
  storagePath?: string;
  published: boolean;
  updatedAt: string;
};
