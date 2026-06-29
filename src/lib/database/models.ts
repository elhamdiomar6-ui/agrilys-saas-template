export type DataVisibility = 'public' | 'internal' | 'administrative';
export type RecordStatus = 'draft' | 'pending' | 'active' | 'archived' | 'hidden';

export type DatabaseId = string;
export type IsoDate = string;
export type IsoDateTime = string;

export type TenantScope = {
  associationId: DatabaseId;
  douarId: DatabaseId;
};

export type AuditFields = {
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  createdBy?: DatabaseId;
  updatedBy?: DatabaseId;
};

export type BaseRecord = TenantScope & AuditFields & {
  id: DatabaseId;
  status: RecordStatus;
};

export type AppRole = 'habitant' | 'adherent' | 'soutien' | 'bureau' | 'president';

export type UserModel = BaseRecord & {
  displayName: string;
  phone?: string;
  preferredLanguage: 'fr' | 'ar' | 'tzm';
  role: AppRole;
};

export type MemberModel = BaseRecord & {
  userId?: DatabaseId;
  fullName: string;
  memberRole: AppRole;
  joinedAt: IsoDate;
  internalNote?: string;
};

export type WorkflowModel = BaseRecord & {
  source: 'registration' | 'report' | 'document' | 'manual';
  sourceId?: DatabaseId;
  title: string;
  requesterName?: string;
  workflowStatus: 'draft' | 'sent' | 'pending' | 'under_review' | 'accepted' | 'rejected' | 'archived';
  internalNote?: string;
  finalDecision?: string;
};

export type WorkflowActionModel = TenantScope & AuditFields & {
  id: DatabaseId;
  workflowId: DatabaseId;
  actionStatus: WorkflowModel['workflowStatus'];
  label: string;
  actorRole: AppRole | 'system';
};

export type AnnouncementModel = BaseRecord & {
  title: string;
  category: 'reunion' | 'travaux' | 'eau' | 'mosquee' | 'evenement' | 'info';
  importance: 'normal' | 'important' | 'urgent';
  content: string;
  publishedAt?: IsoDateTime;
};

export type ReportModel = BaseRecord & {
  category: 'eau' | 'eclairage' | 'route' | 'proprete' | 'securite' | 'autre';
  level: 'normal' | 'important' | 'urgent';
  reportStatus: 'sent' | 'in_progress' | 'resolved';
  description: string;
  internalNote?: string;
};

export type PublicDocumentModel = BaseRecord & {
  title: string;
  category: 'official_announcements' | 'public_minutes' | 'douar_documents' | 'public_rules' | 'community_projects';
  documentStatus: 'available' | 'coming_soon';
  description: string;
  storagePath?: string;
};

export type OralMemoryModel = BaseRecord & {
  title: string;
  narrator?: string;
  approximatePeriod?: string;
  category: 'histoire' | 'traditions' | 'agriculture' | 'eau' | 'mosquee' | 'solidarite' | 'evenements';
  verificationStatus: 'verified' | 'to_confirm';
  summary: string;
  audioPath?: string;
};

export type HeritageModel = BaseRecord & {
  title: string;
  category: 'architecture' | 'water_source' | 'agriculture' | 'mosquee' | 'landscape' | 'memory' | 'traditions' | 'collective_places';
  verificationStatus: 'published' | 'to_verify';
  description: string;
  heritageValue: string;
  photoPath?: string;
};

export type ContributionModel = BaseRecord & {
  memberId?: DatabaseId;
  memberName: string;
  contributionType: 'association' | 'soutien' | 'exceptionnel' | 'mosquee' | 'projet_collectif';
  amount: number;
  contributionDate: IsoDate;
  contributionStatus: 'paid' | 'partial' | 'pending';
  note?: string;
};

export type PermissionModel = TenantScope & AuditFields & {
  id: DatabaseId;
  role: AppRole;
  moduleKey: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canValidate: boolean;
  canArchive: boolean;
};
