// Strategic dossiers tracking for <ORGANIZATION_NAME>

export type FinancingStatus = 'envoyé' | 'en attente' | 'réponse' | 'accordé' | 'refusé';
export type EmailStatus = 'envoyé' | 'réponse reçue' | 'relance' | 'accordé' | 'refusé';
export type InternationalStatus = 'obtenu' | 'en attente' | 'prévu' | 'à faire';
export type OfficialStatus = 'préparé' | 'déposé' | 'en cours' | 'accepté' | 'refusé';

export interface FinancingRecord {
  id: string;
  funder: string;
  type: 'formulaire' | 'email' | 'appel' | 'réunion';
  amountRequested: number; // in DH
  sendDate: string; // YYYY-MM-DD
  status: FinancingStatus;
  nextAction: string;
  notes: string;
}

export interface InternationalStatusRecord {
  id: string;
  name: string;
  acronym: string;
  status: InternationalStatus;
  deadline?: string; // YYYY-MM-DD
  notes: string;
}

export interface OfficialLetterRecord {
  id: string;
  title: string;
  institution: string;
  status: OfficialStatus;
  dateSubmitted?: string; // YYYY-MM-DD
  dateReceived?: string;
  notes: string;
}

export interface EmailRecord {
  id: string;
  funder: string;
  email: string;
  emailSubject: string;
  dateSent: string; // YYYY-MM-DD
  status: EmailStatus;
  nextActionDate?: string; // YYYY-MM-DD
  notes: string;
}

const defaultFinancings: FinancingRecord[] = [
  {
    id: 'fin-afd',
    funder: 'AFD',
    type: 'formulaire',
    amountRequested: 125000,
    sendDate: '2026-06-27',
    status: 'envoyé',
    nextAction: 'Attendre réponse du formulaire',
    notes: 'Agence Française de Développement - rural development focus',
  },
  {
    id: 'fin-giz',
    funder: 'GIZ',
    type: 'formulaire',
    amountRequested: 100000,
    sendDate: '2026-06-27',
    status: 'envoyé',
    nextAction: 'Attendre réponse du formulaire',
    notes: 'Deutsche Gesellschaft für Internationale Zusammenarbeit - governance focus',
  },
  {
    id: 'fin-ocp',
    funder: 'OCP Foundation',
    type: 'email',
    amountRequested: 150000,
    sendDate: '2026-06-27',
    status: 'envoyé',
    nextAction: 'Appel de suivi prévu',
    notes: 'Patrimoine culturel et développement communautaire',
  },
  {
    id: 'fin-bmce',
    funder: 'BMCE Foundation',
    type: 'email',
    amountRequested: 100000,
    sendDate: '2026-06-27',
    status: 'envoyé',
    nextAction: 'Attendre accusé réception',
    notes: 'Focus inclusion financière et économie locale',
  },
  {
    id: 'fin-pnud',
    funder: 'PNUD Maroc',
    type: 'email',
    amountRequested: 120000,
    sendDate: '2026-06-27',
    status: 'envoyé',
    nextAction: 'Appel de présentation SDGs',
    notes: 'Programme des Nations Unies - SDG alignment',
  },
  {
    id: 'fin-indh',
    funder: 'INDH Sidi Ifni',
    type: 'appel',
    amountRequested: 80000,
    sendDate: '2026-07-10',
    status: 'en attente',
    nextAction: 'Préparer dossier officiel',
    notes: 'Initiative Nationale de Développement Humain - eau et digital',
  },
];

const defaultInternationalStatus: InternationalStatusRecord[] = [
  {
    id: 'intl-icso',
    name: 'ONU iCSO/DESA',
    acronym: 'iCSO',
    status: 'obtenu',
    deadline: '2026-12-31',
    notes: 'Obtenu en 2026 - Civil Society Database',
  },
  {
    id: 'intl-unesco',
    name: 'UNESCO Patrimoine Culturel Immatériel',
    acronym: 'ICH-09',
    status: 'en attente',
    deadline: '2027-04-30',
    notes: 'Candidature soumise - Deadline avril 2027',
  },
  {
    id: 'intl-ecosoc',
    name: 'Statut Consultatif ECOSOC ONU',
    acronym: 'ECOSOC',
    status: 'prévu',
    deadline: '2027-06-30',
    notes: 'Prévu pour juin 2027 après validation UNESCO',
  },
  {
    id: 'intl-unesco-consult',
    name: 'UNESCO Organe Consultatif',
    acronym: 'UNESCO',
    status: 'prévu',
    notes: 'Prévu 2027 suite à ICH-09',
  },
  {
    id: 'intl-globalgiving',
    name: 'GlobalGiving Fundraising Platform',
    acronym: 'GG',
    status: 'à faire',
    notes: 'À initier pour crowdfunding international',
  },
];

const defaultOfficialLetters: OfficialLetterRecord[] = [
  {
    id: 'official-culture',
    title: 'Courrier Ministère Culture',
    institution: 'Ministère de la Culture et de la Communication',
    status: 'préparé',
    dateSubmitted: undefined,
    notes: 'Demande reconnaissance patrimoine immatériel - Préparé juin 2026',
  },
  {
    id: 'official-qiyada',
    title: 'Dossier Qiyada Tighirt (Autorité locale)',
    institution: 'Qiyada Tighirt, Sidi Ifni',
    status: 'déposé',
    dateSubmitted: '2026-06-27',
    dateReceived: '2026-06-27',
    notes: 'Récépissé déposé - Obtenu juin 2026',
  },
];

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const defaultEmails: EmailRecord[] = [
  {
    id: 'email-ocp',
    funder: 'OCP Foundation',
    email: 'contact@ocpfoundation.org',
    emailSubject: 'Patrimoine Amazigh Vivant – <CULTURAL_HERITAGE>,
    dateSent: '2026-06-27',
    status: 'envoyé',
    nextActionDate: addDays('2026-06-27', 7),
    notes: 'Email personnalisé - Patrimoine focus. Disponibilité appel 30 min: lundi 30 juin 10h-12h, mardi 1er juillet 14h-16h',
  },
  {
    id: 'email-bmce',
    funder: 'BMCE Foundation',
    email: 'fondation@bmce.ma',
    emailSubject: 'Inclusion Financière Féminine – <CULTURAL_HERITAGE>,
    dateSent: '2026-06-27',
    status: 'envoyé',
    nextActionDate: addDays('2026-06-27', 7),
    notes: 'Email personnalisé - Inclusion financière focus. Disponibilité appel 30 min: lundi 30 juin 10h-12h, mardi 1er juillet 14h-16h',
  },
  {
    id: 'email-pnud',
    funder: 'PNUD Maroc',
    email: 'registry.ma@undp.org',
    emailSubject: 'SDG Achievement through Digital Inclusion',
    dateSent: '2026-06-27',
    status: 'envoyé',
    nextActionDate: addDays('2026-06-27', 7),
    notes: 'Email EN ANGLAIS - SDGs focus (1,4,5,6,10,11,16,17). Disponibilité appel 30 min: lundi 30 juin 10am-12pm, mardi 1er juillet 2pm-4pm',
  },
  {
    id: 'email-afd',
    funder: 'AFD Maroc',
    email: 'afdrabat@afd.fr / proparcocasablanca@afd.fr',
    emailSubject: 'Eau, Numérique & Développement Rural Durable',
    dateSent: '2026-06-27',
    status: 'envoyé',
    nextActionDate: addDays('2026-06-27', 7),
    notes: 'Email + documents complémentaires envoyés. Focus INDH (eau courante). Disponibilité appel: lundi 30 juin 10h-12h, mardi 1er juillet 14h-16h',
  },
  {
    id: 'email-giz',
    funder: 'GIZ Maroc',
    email: 'formulaire giz.de/en/fr/contact',
    emailSubject: 'Gouvernance Locale Participative - Douar Agadir N\'Tguida',
    dateSent: '2026-06-27',
    status: 'envoyé',
    nextActionDate: addDays('2026-06-27', 7),
    notes: 'Formulaire web + documents complémentaires envoyés. Focus gouvernance participative Anti-Atlas. Suivi via formulaire',
  },
];

export function readFinancingRecords(): FinancingRecord[] {
  try {
    const stored = localStorage.getItem('strategicDossiers_financings');
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall back to defaults
  }
  return defaultFinancings;
}

export function readInternationalStatusRecords(): InternationalStatusRecord[] {
  try {
    const stored = localStorage.getItem('strategicDossiers_international');
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall back to defaults
  }
  return defaultInternationalStatus;
}

export function readOfficialLetterRecords(): OfficialLetterRecord[] {
  try {
    const stored = localStorage.getItem('strategicDossiers_official');
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall back to defaults
  }
  return defaultOfficialLetters;
}

export function readEmailRecords(): EmailRecord[] {
  try {
    const stored = localStorage.getItem('strategicDossiers_emails');
    if (stored) return JSON.parse(stored);
  } catch {
    // Fall back to defaults
  }
  return defaultEmails;
}

export function saveFinancingRecords(records: FinancingRecord[]): void {
  localStorage.setItem('strategicDossiers_financings', JSON.stringify(records));
}

export function saveInternationalStatusRecords(records: InternationalStatusRecord[]): void {
  localStorage.setItem('strategicDossiers_international', JSON.stringify(records));
}

export function saveOfficialLetterRecords(records: OfficialLetterRecord[]): void {
  localStorage.setItem('strategicDossiers_official', JSON.stringify(records));
}

export function saveEmailRecords(records: EmailRecord[]): void {
  localStorage.setItem('strategicDossiers_emails', JSON.stringify(records));
}

export function updateFinancingRecord(id: string, updates: Partial<FinancingRecord>): void {
  const records = readFinancingRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveFinancingRecords(records);
  }
}

export function updateInternationalStatusRecord(id: string, updates: Partial<InternationalStatusRecord>): void {
  const records = readInternationalStatusRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveInternationalStatusRecords(records);
  }
}

export function updateOfficialLetterRecord(id: string, updates: Partial<OfficialLetterRecord>): void {
  const records = readOfficialLetterRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveOfficialLetterRecords(records);
  }
}

export function updateEmailRecord(id: string, updates: Partial<EmailRecord>): void {
  const records = readEmailRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveEmailRecords(records);
  }
}
