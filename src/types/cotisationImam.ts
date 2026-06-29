export type CotisationImamStatus = 'a_jour' | 'en_retard' | 'exonere' | 'a_verifier';

export type CotisationImamMaritalStatus = 'marie' | 'non_marie' | 'veuf_veuve' | 'inconnu' | 'non_applicable';

export type CotisationPaymentKind = 'imam' | 'ecole_coranique';

export type CotisationPaymentHistoryItem = {
  id: string;
  kind: CotisationPaymentKind;
  amount: number;
  period: string;
  at: string;
  note: string;
};

export type CotisationImamHousehold = {
  id: string;
  headName: string;
  localName: string;
  area: string;
  maritalStatus: CotisationImamMaritalStatus;
  status: CotisationImamStatus;
  period: string;
  imamDue: number;
  imamPaid: number;
  schoolDue: number;
  schoolPaid: number;
  privateObservation: string;
  history: CotisationPaymentHistoryItem[];
  createdAt: string;
  updatedAt: string;
};
