import type { CommunityContribution } from '../types/contributions';

import { getStorageKey } from '../lib/storage/storageUtils';
export const contributionsStorageKey = getStorageKey('contributions', 'v1');

export function readContributions(): CommunityContribution[] {
  const stored = localStorage.getItem(contributionsStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as CommunityContribution[];
  } catch {
    return [];
  }
}

export function saveContributions(contributions: CommunityContribution[]) {
  localStorage.setItem(contributionsStorageKey, JSON.stringify(contributions));
}
