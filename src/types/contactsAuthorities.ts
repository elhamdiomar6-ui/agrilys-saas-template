export type ContactCategory =
  | 'bureau_association'
  | 'association_members'
  | 'local_authority'
  | 'commune'
  | 'caidat_pachalik'
  | 'province'
  | 'public_service'
  | 'technician'
  | 'supplier'
  | 'partner'
  | 'other';

export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';

export type InternalContact = {
  id: string;
  name: string;
  role: string;
  organization: string;
  category: ContactCategory;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  zone: string;
  associationRelation: string;
  priority: ContactPriority;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  updatedAt: string;
};