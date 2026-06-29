export type MemberRole = 'habitant' | 'adherent' | 'soutien' | 'bureau' | 'president';
export type MemberState = 'active' | 'pending' | 'suspended';

export type AssociationMember = {
  id: string;
  fullName: string;
  role: MemberRole;
  registeredAt: string;
  state: MemberState;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};
