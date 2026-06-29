export type WorkflowStatus = 'draft' | 'sent' | 'pending' | 'under_review' | 'accepted' | 'rejected' | 'archived';
export type WorkflowSource = 'registration' | 'manual';

export type WorkflowAction = {
  id: string;
  status: WorkflowStatus;
  label: string;
  at: string;
  by: 'bureau' | 'president' | 'system';
};

export type ValidationWorkflow = {
  id: string;
  source: WorkflowSource;
  sourceId?: string;
  title: string;
  requesterName: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  internalNote: string;
  finalDecision: string;
  history: WorkflowAction[];
};
