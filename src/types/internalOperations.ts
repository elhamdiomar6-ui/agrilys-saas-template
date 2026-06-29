export type InternalPriority = 'low' | 'medium' | 'high' | 'urgent';

export type InternalTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type InternalTaskCategory = 'renewal' | 'documents' | 'contacts' | 'meeting' | 'authority' | 'other';

export type InternalTask = {
  id: string;
  title: string;
  description: string;
  responsible: string;
  priority: InternalPriority;
  status: InternalTaskStatus;
  deadline: string;
  category: InternalTaskCategory;
  nextAction: string;
  notes: string;
  updatedAt: string;
};

export type AdministrativeProcedureType = 'letter' | 'request' | 'deposit' | 'appointment' | 'follow_up' | 'response';
export type AdministrativeProcedureStatus = 'to_prepare' | 'sent' | 'deposited' | 'waiting' | 'validated' | 'rejected';

export type AdministrativeProcedure = {
  id: string;
  title: string;
  organization: string;
  linkedContact: string;
  type: AdministrativeProcedureType;
  status: AdministrativeProcedureStatus;
  plannedDate: string;
  sentOrDepositDate: string;
  nextAction: string;
  responsible: string;
  priority: InternalPriority;
  internalReference: string;
  physicalLocation: string;
  notes: string;
  updatedAt: string;
};

export type MeetingMinuteStatus = 'to_write' | 'in_progress' | 'ready' | 'signed' | 'archived';

export type MeetingDecisionRecord = {
  id: string;
  title: string;
  date: string;
  place: string;
  purpose: string;
  participants: string;
  decisions: string;
  actions: string;
  responsible: string;
  minuteStatus: MeetingMinuteStatus;
  physicalLocation: string;
  notes: string;
  updatedAt: string;
};

export type FieldCollectionStatus = 'to_collect' | 'received' | 'to_verify' | 'validated' | 'integrated';
export type FieldCollectionCategory =
  | 'heritage_photos'
  | 'place_gps'
  | 'elders_stories'
  | 'oral_memory_audio'
  | 'videos'
  | 'local_products'
  | 'local_guides'
  | 'scanned_documents'
  | 'tourism_circuit_ideas'
  | 'free_observations';
export type FieldCollectionPriority = 'low' | 'medium' | 'high' | 'urgent';

export type FieldCollectionItem = {
  id: string;
  title: string;
  category: FieldCollectionCategory;
  linkedPlace: string;
  status: FieldCollectionStatus;
  note: string;
  date: string;
  source: string;
  fileName: string;
  priority: FieldCollectionPriority;
  updatedAt: string;
};

export type ActionPlanStatus = 'todo' | 'in_progress' | 'complete';
export type ActionPlanPriority = 'normal' | 'high' | 'urgent';
export type ActionPlanTag =
  | 'fondations'
  | 'gouvernance'
  | 'international'
  | 'plateforme'
  | 'patrimoine'
  | 'finances'
  | 'subventions'
  | 'diaspora'
  | 'cooperative'
  | 'export'
  | 'tourisme'
  | 'revenus'
  | 'technique'
  | 'financement';

export type ActionPlanItem = {
  id: string;
  title: string;
  status: ActionPlanStatus;
  priority: ActionPlanPriority;
  dueDate: string;
  description: string;
  responsible: string;
  tags: string;
  notes: string;
  updatedAt: string;
};
