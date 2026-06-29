export type ContributionType = 'association' | 'soutien' | 'exceptionnel' | 'mosquee' | 'projet_collectif';
export type ContributionStatus = 'paid' | 'partial' | 'pending';

export type ContributionHistoryItem = {
  id: string;
  status: ContributionStatus;
  at: string;
  label: string;
};

export type CommunityContribution = {
  id: string;
  memberId?: string;
  memberName: string;
  type: ContributionType;
  amount: number;
  date: string;
  status: ContributionStatus;
  note: string;
  history: ContributionHistoryItem[];
  createdAt: string;
  updatedAt: string;
};
