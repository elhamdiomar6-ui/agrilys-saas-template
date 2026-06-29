import type { ResidentReport } from '../types/report';

export const reportsStorageKey = 'agadirnetguida.residentReports.v1';

export function readReports(): ResidentReport[] {
  const stored = localStorage.getItem(reportsStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ResidentReport[];
  } catch {
    return [];
  }
}

export function saveReports(reports: ResidentReport[]) {
  localStorage.setItem(reportsStorageKey, JSON.stringify(reports));
}
