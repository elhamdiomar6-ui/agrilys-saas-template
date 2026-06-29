import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { EditorialLang, EditorialPageId } from './agadirHistoryContent';

export type BilingualCopy<T> = Record<EditorialLang, T>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T>(fallback: T, remote: unknown): T {
  if (Array.isArray(fallback)) return (Array.isArray(remote) ? remote : fallback) as T;
  if (!isRecord(fallback) || !isRecord(remote)) return (remote ?? fallback) as T;
  const merged: Record<string, unknown> = { ...fallback };
  for (const [key, value] of Object.entries(remote)) {
    merged[key] = key in fallback
      ? deepMerge((fallback as Record<string, unknown>)[key], value)
      : value;
  }
  return merged as T;
}

export async function loadPublicEditorialCopy<T>(
  pageId: EditorialPageId,
  fallback: BilingualCopy<T>,
): Promise<{ copy: BilingualCopy<T>; source: 'supabase' | 'fallback' }> {
  if (!supabase) return { copy: structuredClone(fallback), source: 'fallback' };
  const { data, error } = await supabase
    .from('page_contents')
    .select('lang,content_json')
    .eq('page_id', pageId)
    .eq('section_id', 'copy');
  if (error || !data?.length) return { copy: structuredClone(fallback), source: 'fallback' };

  const copy = structuredClone(fallback);
  for (const row of data as Array<{ lang: string; content_json: unknown }>) {
    if (row.lang === 'fr' || row.lang === 'ar') {
      const lang = row.lang as EditorialLang;
      copy[lang] = deepMerge(copy[lang], row.content_json);
    }
  }
  return { copy, source: 'supabase' };
}

export function usePublicEditorialCopy<T>(
  pageId: EditorialPageId,
  fallback: BilingualCopy<T>,
) {
  const [copy, setCopy] = useState<BilingualCopy<T>>(fallback);
  useEffect(() => {
    let active = true;
    loadPublicEditorialCopy(pageId, fallback)
      .then((result) => {
        if (active) setCopy(result.copy);
      })
      .catch(() => {
        if (active) setCopy(fallback);
      });
    return () => {
      active = false;
    };
  }, [fallback, pageId]);
  return copy;
}

export async function savePublicEditorialCopy<T>(
  pageId: EditorialPageId,
  copy: BilingualCopy<T>,
  updatedBy: string,
) {
  if (!supabase) throw new Error('Supabase non configuré.');
  const rows = (['fr', 'ar'] as const).map((lang) => ({
    page_id: pageId,
    section_id: 'copy',
    lang,
    content_type: 'json',
    content: null,
    content_json: copy[lang],
    display_order: 0,
    updated_by: updatedBy,
  }));
  const { error } = await supabase
    .from('page_contents')
    .upsert(rows, { onConflict: 'page_id,section_id,lang' });
  if (error) throw error;
}
