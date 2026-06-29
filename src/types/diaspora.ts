export type DiasporaCategory =
  | 'projectSupport'
  | 'education'
  | 'solidarity'
  | 'skills'
  | 'communityInvestment'
  | 'heritage'
  | 'youth'
  | 'agriculture';

export type DiasporaStatus = 'idea' | 'active' | 'completed';

export type DiasporaInitiative = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: DiasporaCategory;
  status: DiasporaStatus;
  region: string;
  date: string;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};