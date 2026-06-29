import type { CommunityMapPoint } from '../types/communityMap';

import { getStorageKey } from '../lib/storage/storageUtils';
export const communityMapStorageKey = getStorageKey('communityMap', 'v1');

export function readCommunityMapPoints(): CommunityMapPoint[] {
  const stored = localStorage.getItem(communityMapStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as CommunityMapPoint[];
  } catch {
    return [];
  }
}

export function saveCommunityMapPoints(points: CommunityMapPoint[]) {
  localStorage.setItem(communityMapStorageKey, JSON.stringify(points));
}
