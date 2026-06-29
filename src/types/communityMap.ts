export type CommunityMapCategory = 'water' | 'agriculture' | 'mosquee' | 'heritage' | 'collective' | 'historical' | 'services';
export type CommunityMapStatus = 'public' | 'to_verify';

export type CommunityMapPoint = {
  id: string;
  title: string;
  category: CommunityMapCategory;
  description: string;
  status: CommunityMapStatus;
  published: boolean;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
};
