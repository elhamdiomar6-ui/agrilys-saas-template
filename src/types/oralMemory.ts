export type OralMemoryCategory = 'histoire' | 'traditions' | 'agriculture' | 'eau' | 'mosquee' | 'solidarite' | 'evenements';
export type OralMemoryStatus = 'verified' | 'to_confirm';

export type OralMemoryStory = {
  id: string;
  title: string;
  narrator: string;
  approximatePeriod: string;
  summary: string;
  category: OralMemoryCategory;
  status: OralMemoryStatus;
  published: boolean;
  audioPlanned: boolean;
  createdAt: string;
  updatedAt: string;
};
