import type { OralMemoryStory } from '../types/oralMemory';

export const oralMemoryStorageKey = 'agadirnetguida.oralMemory.v1';

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
