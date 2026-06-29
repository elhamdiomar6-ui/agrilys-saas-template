import type { HouseholdContribution, ImamProfile, MosqueHousehold, MosqueReport, QuranStudent } from '../types/mosque';

export const mosqueDemoMode = false;

export const mosqueDemoNotice = 'وضع تجريبي: لا توجد بيانات حقيقية';

export const mosqueDemoHouseholds: MosqueHousehold[] = [
  { id: 'demo-household-1', headName: 'Foyer demo A', familyStatus: 'married', location: 'Quartier demo', isEligible: true, exemptionStatus: 'none' },
  { id: 'demo-household-2', headName: 'Foyer demo B', familyStatus: 'diaspora', location: 'Quartier demo', isEligible: true, exemptionStatus: 'none' },
  { id: 'demo-household-3', headName: 'Foyer demo C', familyStatus: 'widow', location: 'Quartier demo', isEligible: false, exemptionStatus: 'temporary', exemptionReasonPrivate: 'Private demo reason' },
];

export const mosqueDemoContributions: HouseholdContribution[] = [
  { id: 'demo-contribution-1', householdId: 'demo-household-1', month: 5, year: 2026, amountExpected: 50, amountPaid: 50, status: 'paid', paymentDate: '2026-05-10', receiptNumber: 'DEMO-REC-001' },
  { id: 'demo-contribution-2', householdId: 'demo-household-2', month: 5, year: 2026, amountExpected: 50, amountPaid: 0, status: 'pending' },
  { id: 'demo-contribution-3', householdId: 'demo-household-3', month: 5, year: 2026, amountExpected: 0, amountPaid: 0, status: 'exempted' },
];

export const mosqueDemoImam: ImamProfile = {
  id: 'demo-imam',
  name: 'Imam demo',
  role: 'imam_and_quran_teacher',
  startDate: '2026-01-01',
  monthlyHonorarium: 1500,
  status: 'active',
  notes: 'Profile demo. Replace only after validation by the bureau.',
};

export const mosqueDemoStudents: QuranStudent[] = [
  { id: 'demo-student-1', name: 'Talib demo A', familyId: 'demo-household-1', age: 8, group: 'Groupe matin', attendanceStatus: 'regular', progressNote: 'Progression simple demo', needsSupport: ['books'] },
  { id: 'demo-student-2', name: 'Talib demo B', familyId: 'demo-household-2', age: 10, group: 'Groupe soir', attendanceStatus: 'needs_followup', progressNote: 'Observation demo', needsSupport: ['supplies'] },
];

export const emptyMosqueReport: MosqueReport = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalExpected: 0,
  totalCollected: 0,
  totalPaidToImam: 0,
  remaining: 0,
  householdsPaid: 0,
  householdsPending: 0,
  householdsExempted: 0,
  householdsEligible: 0,
};

export function buildDemoMosqueReport(): MosqueReport {
  const totalExpected = mosqueDemoContributions.reduce((sum, item) => sum + item.amountExpected, 0);
  const totalCollected = mosqueDemoContributions.reduce((sum, item) => sum + item.amountPaid, 0);
  return {
    month: 5,
    year: 2026,
    totalExpected,
    totalCollected,
    totalPaidToImam: Math.min(totalCollected, mosqueDemoImam.monthlyHonorarium),
    remaining: Math.max(totalExpected - totalCollected, 0),
    householdsPaid: mosqueDemoContributions.filter((item) => item.status === 'paid' || item.status === 'covered_anonymously').length,
    householdsPending: mosqueDemoContributions.filter((item) => item.status === 'pending' || item.status === 'deferred').length,
    householdsExempted: mosqueDemoContributions.filter((item) => item.status === 'exempted').length,
    householdsEligible: mosqueDemoHouseholds.filter((item) => item.isEligible).length,
  };
}
