export type ReportCategory = 'eau' | 'eclairage' | 'route' | 'proprete' | 'securite' | 'autre';
export type ReportLevel = 'normal' | 'important' | 'urgent';
export type ReportStatus = 'sent' | 'in_progress' | 'resolved';

export type ResidentReport = {
  id: string;
  category: ReportCategory;
  description: string;
  level: ReportLevel;
  status: ReportStatus;
  createdAt: string;
  internalNote?: string;
  updatedAt: string;
};
