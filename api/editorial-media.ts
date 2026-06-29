import { createClient } from '@supabase/supabase-js';

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  from: (input: string, encoding: 'base64') => Uint8Array;
};

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type MediaRequestBody = {
  action?: 'upload' | 'delete' | 'restore';
  pageId?: string;
  mediaType?: 'audio' | 'image';
  lang?: string | null;
  fileName?: string;
  contentType?: string;
  base64?: string;
  filePath?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_PAGE_IDS = new Set([
  'accueil',
  'patrimoine',
  'chronologie',
  'a-propos',
  'habitant',
  'explorer',
  'documents-publics',
  'eau',
  'evenements',
  'projets',
  'memoire-orale',
  'jeunesse',
  'entraide',
  'agriculture',
  'cooperatives',
  'diaspora',
  'connexion',
]);

function getBearerToken(req: VercelRequest) {
  const raw = req.headers.authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function normalizeBody(body: unknown): MediaRequestBody {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as MediaRequestBody;
    } catch {
      return {};
    }
  }
  return body && typeof body === 'object' ? body as MediaRequestBody : {};
}

function safeExtension(fileName: string, contentType: string) {
  if (contentType === 'audio/mpeg') return 'mp3';
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/avif') return 'avif';
  if (contentType === 'image/jpeg') return 'jpg';
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : 'bin';
}

async function verifyPresident(token: string, admin: any) {
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) return null;
  const appRole = data.user.app_metadata?.role;
  if (appRole === 'president' || appRole === 'platform_admin') return data.user.id;

  const { data: profile } = await admin
    .from('user_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (!profile?.id) return null;
  const { data: assignment } = await admin
    .from('role_assignments')
    .select('id')
    .eq('user_profile_id', profile.id)
    .eq('role', 'president')
    .eq('status', 'active')
    .maybeSingle();
  return assignment ? data.user.id : null;
}

async function ensurePublicBucket(
  admin: any,
  bucket: string,
  mediaType: 'audio' | 'image',
) {
  const { data, error } = await admin.storage.getBucket(bucket);
  if (data) return;
  if (error && !error.message.toLowerCase().includes('not found')) throw error;
  const options = mediaType === 'audio'
    ? { public: true, fileSizeLimit: MAX_AUDIO_BYTES, allowedMimeTypes: ['audio/mpeg'] }
    : { public: true, fileSizeLimit: MAX_IMAGE_BYTES, allowedMimeTypes: [...ALLOWED_IMAGE_TYPES] };
  const { error: createError } = await admin.storage.createBucket(bucket, options);
  if (createError && !createError.message.toLowerCase().includes('already exists')) throw createError;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Configuration Supabase serveur incomplète.' });
  }

  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Session Président requise.' });
  const admin: any = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userId = await verifyPresident(token, admin);
  if (!userId) return res.status(403).json({ error: 'Accès réservé au Président.' });

  const body = normalizeBody(req.body);
  const action = body.action || 'upload';
  const pageId = String(body.pageId || '');
  const mediaType = body.mediaType;
  const lang = mediaType === 'audio' ? String(body.lang || 'darija') : null;
  const fileName = String(body.fileName || '');
  const contentType = String(body.contentType || '').toLowerCase();
  const base64 = String(body.base64 || '');
  if (!ALLOWED_PAGE_IDS.has(pageId) || (mediaType !== 'audio' && mediaType !== 'image')) {
    return res.status(400).json({ error: 'Page ou type de média invalide.' });
  }
  if (action !== 'upload' && action !== 'delete' && action !== 'restore') {
    return res.status(400).json({ error: 'Action média invalide.' });
  }

  const bucket = mediaType === 'audio' ? 'page-audio' : 'page-images';
  if (action === 'delete') {
    let currentQuery = admin
      .from('page_media')
      .delete()
      .eq('page_id', pageId)
      .eq('media_type', mediaType);
    currentQuery = lang ? currentQuery.eq('lang', lang) : currentQuery.is('lang', null);
    const { error } = await currentQuery;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ publicUrl: null });
  }

  if (action === 'restore') {
    const filePath = String(body.filePath || '');
    if (!filePath.startsWith(`${pageId}/`) || filePath.includes('..')) {
      return res.status(400).json({ error: 'Chemin du média à restaurer invalide.' });
    }
    const { data: publicData } = admin.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;
    let existingQuery = admin
      .from('page_media')
      .select('id')
      .eq('page_id', pageId)
      .eq('media_type', mediaType);
    existingQuery = lang ? existingQuery.eq('lang', lang) : existingQuery.is('lang', null);
    const { data: existing, error: existingError } = await existingQuery.maybeSingle();
    if (existingError) return res.status(500).json({ error: existingError.message });
    const payload = {
      page_id: pageId,
      media_type: mediaType,
      lang,
      file_path: filePath,
      public_url: publicUrl,
      updated_by: userId,
    };
    const result = existing?.id
      ? await admin.from('page_media').update(payload).eq('id', existing.id)
      : await admin.from('page_media').insert(payload);
    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.status(200).json({ publicUrl });
  }

  if (!base64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return res.status(400).json({ error: 'Fichier invalide.' });
  }
  if (mediaType === 'audio' && contentType !== 'audio/mpeg') {
    return res.status(400).json({ error: 'Seuls les fichiers MP3 sont acceptés.' });
  }
  if (mediaType === 'image' && !ALLOWED_IMAGE_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'Format d’image non accepté.' });
  }

  const bytes = Buffer.from(base64, 'base64');
  const maxBytes = mediaType === 'audio' ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > maxBytes) {
    return res.status(413).json({
      error: mediaType === 'audio' ? 'Le MP3 dépasse 5 Mo.' : 'La photo dépasse 2,5 Mo après préparation.',
    });
  }

  try {
    await ensurePublicBucket(admin, bucket, mediaType);
    const extension = safeExtension(fileName, contentType);
    const uniquePart = `${Date.now()}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    const filePath = `${pageId}/${lang || 'global'}/${mediaType}-${uniquePart}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(filePath, bytes, { upsert: true, contentType, cacheControl: '31536000' });
    if (uploadError) throw uploadError;

    const { data: publicData } = admin.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;
    let existingQuery = admin
      .from('page_media')
      .select('id')
      .eq('page_id', pageId)
      .eq('media_type', mediaType);
    existingQuery = lang ? existingQuery.eq('lang', lang) : existingQuery.is('lang', null);
    const { data: existing, error: existingError } = await existingQuery.maybeSingle();
    if (existingError) throw existingError;

    const payload = {
      page_id: pageId,
      media_type: mediaType,
      lang,
      file_path: filePath,
      public_url: publicUrl,
      updated_by: userId,
    };
    const mediaResult = existing?.id
      ? await admin.from('page_media').update(payload).eq('id', existing.id)
      : await admin.from('page_media').insert(payload);
    if (mediaResult.error) throw mediaResult.error;
    return res.status(200).json({ publicUrl });
  } catch (error) {
    console.error('Editorial media upload error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'L’envoi du média a échoué.',
    });
  }
}
