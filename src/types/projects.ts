export type ProjectCategory = 'eau' | 'agriculture' | 'mosquee' | 'routes' | 'solidarite' | 'patrimoine' | 'jeunesse' | 'environnement' | 'equipements';
export type ProjectState = 'idea' | 'study' | 'in_progress' | 'completed';
export type ProjectPriority = 'normal' | 'important' | 'high';

export type CommunityProject = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  scriptId: string;
  category: ProjectCategory;
  state: ProjectState;
  priority: ProjectPriority;
  date: string;
  progress: number;
  published: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};
