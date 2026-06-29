import type { CommunityMapPoint } from '../types/communityMap';

export const communityMapStorageKey = 'agadirnetguida.communityMap.v1';

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
