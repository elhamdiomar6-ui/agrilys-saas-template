export type DatabaseArea = 'public' | 'internal' | 'administrative';

export type TableBlueprint = {
  tableName: string;
  area: DatabaseArea;
  purpose: string;
  futureRls: string;
  multiTenant: boolean;
};

export const tableBlueprints: TableBlueprint[] = [
  {
    tableName: 'associations',
    area: 'administrative',
    purpose: 'Root entity for each association using the platform.',
    futureRls: 'Only platform/admin governance roles can create associations.',
    multiTenant: false,
  },
  {
    tableName: 'douars',
    area: 'administrative',
    purpose: 'Local territory attached to one association.',
    futureRls: 'Association roles can view their own douars only.',
    multiTenant: false,
  },
  {
    tableName: 'users',
    area: 'administrative',
    purpose: 'Future authenticated users and role assignment anchor.',
    futureRls: 'Users can view self; bureau/president can view scoped users.',
    multiTenant: true,
  },
  {
    tableName: 'members',
    area: 'internal',
    purpose: 'Association members and local statuses.',
    futureRls: 'Bureau/president manage; users view limited self data.',
    multiTenant: true,
  },
  {
    tableName: 'workflows',
    area: 'internal',
    purpose: 'Human validation process for requests and decisions.',
    futureRls: 'Bureau/president manage scoped workflows.',
    multiTenant: true,
  },
  {
    tableName: 'workflow_actions',
    area: 'internal',
    purpose: 'Append-only action history for audit trail.',
    futureRls: 'No public access; append through controlled server action later.',
    multiTenant: true,
  },
  {
    tableName: 'announcements',
    area: 'public',
    purpose: 'Official public announcements after validation.',
    futureRls: 'Public can read published rows only; bureau can manage.',
    multiTenant: true,
  },
  {
    tableName: 'reports',
    area: 'internal',
    purpose: 'Resident reports and internal follow-up.',
    futureRls: 'Reporter can view own report; bureau/president manage scoped reports.',
    multiTenant: true,
  },
  {
    tableName: 'public_documents',
    area: 'public',
    purpose: 'Non-sensitive public documents metadata.',
    futureRls: 'Public can read published rows only; bureau can manage.',
    multiTenant: true,
  },
  {
    tableName: 'oral_memory',
    area: 'public',
    purpose: 'Published oral memory stories and verification status.',
    futureRls: 'Public can read published rows only; bureau can manage.',
    multiTenant: true,
  },
  {
    tableName: 'heritage_items',
    area: 'public',
    purpose: 'Published heritage records and future photo metadata.',
    futureRls: 'Public can read published rows only; bureau can manage.',
    multiTenant: true,
  },
  {
    tableName: 'contributions',
    area: 'internal',
    purpose: 'Respectful internal contribution records without payment processing.',
    futureRls: 'No public list; member can view own rows later; bureau/president manage.',
    multiTenant: true,
  },
  {
    tableName: 'permissions',
    area: 'administrative',
    purpose: 'Future granular permissions by role, module, association, and douar.',
    futureRls: 'President/admin can manage; other roles read allowed subset only.',
    multiTenant: true,
  },
];

export const namingConventions = {
  tables: 'snake_case plural names, for example public_documents',
  primaryKeys: 'id as uuid in future database',
  tenantKeys: 'association_id and douar_id on every tenant-scoped table',
  dates: 'created_at, updated_at, published_at with timestamptz in PostgreSQL',
  statuses: 'lowercase snake_case enum values',
  storage: 'store only metadata/path in database; files stay in storage buckets later',
} as const;
