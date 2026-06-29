import type { ResidentReport } from '../types/report';

import { getStorageKey } from '../lib/storage/storageUtils';
export const reportsStorageKey = getStorageKey('residentReports', 'v1');

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
