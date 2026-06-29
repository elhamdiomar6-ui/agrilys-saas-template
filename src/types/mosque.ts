export type ContributionStatus = 'paid' | 'pending' | 'exempted' | 'deferred' | 'covered_anonymously';
export type FamilyStatus = 'married' | 'single' | 'widow' | 'absent' | 'diaspora';
export type ImamRole = 'imam' | 'quran_teacher' | 'imam_and_quran_teacher';
export type ImamStatus = 'active' | 'paused' | 'ended';
export type AttendanceStatus = 'regular' | 'irregular' | 'absent' | 'needs_followup';

export interface HouseholdContribution {
  id: string;
  householdId: string;
  month: number;
  year: number;
  amountExpected: number;
  amountPaid: number;
  status: ContributionStatus;
  paymentDate?: string;
  validatedBy?: string;
  receiptNumber?: string;
  notesPrivate?: string;
}

export interface MosqueHousehold {
  id: string;
  headName: string;
  phone?: string;
  familyStatus: FamilyStatus;
  location?: string;
  isEligible: boolean;
  exemptionStatus?: 'none' | 'temporary' | 'long_term';
  exemptionReasonPrivate?: string;
}

export interface ImamProfile {
  id: string;
  name: string;
  role: ImamRole;
  startDate: string;
  monthlyHonorarium: number;
  status: ImamStatus;
  notes?: string;
}

export interface QuranStudent {
  id: string;
  name: string;
  familyId: string;
  age?: number;
  group: string;
  attendanceStatus: AttendanceStatus;
  progressNote?: string;
  needsSupport?: Array<'books' | 'mat' | 'supplies' | 'maintenance'>;
}

export interface MosqueReport {
  month: number;
  year: number;
  totalExpected: number;
  totalCollected: number;
  totalPaidToImam: number;
  remaining: number;
  householdsPaid: number;
  householdsPending: number;
  householdsExempted: number;
  householdsEligible: number;
}