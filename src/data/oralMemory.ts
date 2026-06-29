import type { OralMemoryStory } from '../types/oralMemory';

import { getStorageKey } from '../lib/storage/storageUtils';
export const oralMemoryStorageKey = getStorageKey('oralMemory', 'v1');

export function readOralMemoryStories(): OralMemoryStory[] {
  const stored = localStorage.getItem(oralMemoryStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as OralMemoryStory[];
  } catch {
    return [];
  }
}

export function saveOralMemoryStories(stories: OralMemoryStory[]) {
  localStorage.setItem(oralMemoryStorageKey, JSON.stringify(stories));
}
