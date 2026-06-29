export const databaseTableNames = {
  associations: 'associations',
  douars: 'douars',
  users: 'users',
  members: 'members',
  workflows: 'workflows',
  workflowActions: 'workflow_actions',
  announcements: 'announcements',
  reports: 'reports',
  publicDocuments: 'public_documents',
  oralMemory: 'oral_memory',
  heritageItems: 'heritage_items',
  contributions: 'contributions',
  permissions: 'permissions',
} as const;

export const dataAreas = {
  public: ['announcements', 'public_documents', 'oral_memory', 'heritage_items'],
  internal: ['members', 'workflows', 'workflow_actions', 'reports', 'contributions'],
  administrative: ['associations', 'douars', 'users', 'permissions'],
} as const;
