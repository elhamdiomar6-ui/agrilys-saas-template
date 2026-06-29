import { supabase } from './supabaseClient';
import type { EditorialPageId, PageMediaRow } from './agadirHistoryContent';

export type EditorialMediaSnapshot = {
  audio: PageMediaRow | null;
  image: PageMediaRow | null;
};

export type EditorialVersion = {
  id: string;
  pageId: EditorialPageId;
  createdAt: string;
  action: string;
  contentKind: 'generic' | 'history';
  content: unknown;
  media: EditorialMediaSnapshot;
};

type StoredEditorialVersion = Omit<EditorialVersion, 'id' | 'pageId' | 'createdAt'> & {
  schemaVersion: 1;
};

const VERSION_PREFIX = '__version__:';

export function mediaRowsToSnapshot(rows: PageMediaRow[]): EditorialMediaSnapshot {
  return {
    audio: rows.find((item) => item.media_type === 'audio' && item.lang === 'darija') ?? null,
    image: rows.find((item) => item.media_type === 'image') ?? null,
  };
}

function isStoredVersion(value: unknown): value is StoredEditorialVersion {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.schemaVersion === 1
    && (record.contentKind === 'generic' || record.contentKind === 'history')
    && typeof record.action === 'string'
    && 'content' in record
    && Boolean(record.media)
    && typeof record.media === 'object';
}

export async function createEditorialVersion(params: {
  pageId: EditorialPageId;
  contentKind: EditorialVersion['contentKind'];
  content: unknown;
  media: EditorialMediaSnapshot;
  action: string;
  updatedBy: string;
}) {
  if (!supabase) throw new Error('Supabase non configuré.');
  const versionId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const payload: StoredEditorialVersion = {
    schemaVersion: 1,
    action: params.action,
    contentKind: params.contentKind,
    content: structuredClone(params.content),
    media: structuredClone(params.media),
  };
  const { error } = await supabase.from('page_contents').insert({
    page_id: params.pageId,
    section_id: `${VERSION_PREFIX}${versionId}`,
    lang: 'fr',
    content_type: 'json',
    content: null,
    content_json: payload,
    display_order: -1,
    updated_by: params.updatedBy,
  });
  if (error) throw error;
}

export async function loadEditorialVersions(pageId: EditorialPageId) {
  if (!supabase) return [] as EditorialVersion[];
  const { data, error } = await supabase
    .from('page_contents')
    .select('section_id,content_json,updated_at')
    .eq('page_id', pageId)
    .like('section_id', `${VERSION_PREFIX}%`)
    .order('updated_at', { ascending: false })
    .limit(30);
  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    if (!isStoredVersion(row.content_json)) return [];
    return [{
      id: String(row.section_id).slice(VERSION_PREFIX.length),
      pageId,
      createdAt: String(row.updated_at),
      ...row.content_json,
    } satisfies EditorialVersion];
  });
}

export function saveEditorialDraft(pageId: EditorialPageId, content: unknown) {
  localStorage.setItem(`editorial-draft:${pageId}`, JSON.stringify({
    savedAt: new Date().toISOString(),
    content,
  }));
}

export function loadEditorialDraft<T>(pageId: EditorialPageId) {
  const raw = localStorage.getItem(`editorial-draft:${pageId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt?: unknown; content?: unknown };
    if (typeof parsed.savedAt !== 'string' || !('content' in parsed)) return null;
    return { savedAt: parsed.savedAt, content: parsed.content as T };
  } catch {
    return null;
  }
}

export function clearEditorialDraft(pageId: EditorialPageId) {
  localStorage.removeItem(`editorial-draft:${pageId}`);
}
