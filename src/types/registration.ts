export type RequestedStatus = 'habitant' | 'adherent' | 'soutien';
export type RequestDecision = 'pending' | 'recommended' | 'accepted' | 'rejected';

export type RegistrationHistoryItem = {
  status: RequestDecision;
  at: string;
  by: 'bureau' | 'president' | 'system';
};

export type RegistrationRequest = {
  id: string;
  fullName: string;
  phoneWhatsApp: string;
  douarLink: string;
  requestedStatus: RequestedStatus;
  message: string;
  createdAt: string;
  status: RequestDecision;
  history?: RegistrationHistoryItem[];
};
