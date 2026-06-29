export type RenewalStatus = 'to_prepare' | 'in_progress' | 'ready' | 'submitted' | 'validated' | 'blocked';
export type RenewalPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RenewalCategory = 'statutes' | 'meeting' | 'members' | 'administration' | 'letters' | 'receipt' | 'final_file';

export type AssociationRenewalItem = {
  id: string;
  title: string;
  category: RenewalCategory;
  status: RenewalStatus;
  priority: RenewalPriority;
  responsible: string;
  deadline: string;
  nextAction: string;
  physicalLocation: string;
  notes: string;
  updatedAt: string;
};
