import { createClient } from '@supabase/supabase-js';

declare const process: {
  env: Record<string, string | undefined>;
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

export const config = { maxDuration: 30 };

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const MAX_CHARS = 4000;

const PROPER_NOUNS = [
  'Pronounce أگادير نتڭيدا as "Agadir N-Tguida" (two distinct syllables: Ag-a-dir, N-Tgui-da).',
  'Pronounce نتڭيدا as "N-Tguida", never as "Ntakida" or "Ntaguida".',
  'Pronounce لخصاص as "Lakh-sass" (stress on first syllable).',
  'Pronounce بوتروش as "Bou-trouch" (rhymes with "douche").',
  'Pronounce سيدي إفني as "Si-di If-ni" (soft "f", stress on "If").',
  'Pronounce كلميم as "Kel-mim" (short, two syllables).',
  'Pronounce واد نون as "Oued Noun" (French-style "oued").',
  'Pronounce الدوار as "ed-dwar" in Darija (not "al-duwar").',
  'Pronounce الجمعية as "jmiya" in Darija context.',
  'Pronounce المكتب as "l-mekteb" in Darija context.',
  'Preserve place names exactly: Boutrouch, Lakhsass, Sidi Ifni, Guelmim, Oued Noun.',
].join(' ');

const INSTRUCTIONS_DARIJA = [
  'Speak only in natural Moroccan Darija, not Modern Standard Arabic.',
  'Use a warm, mature Moroccan community narrator voice.',
  'Sound conversational and human, as if calmly helping a neighbor.',
  'Use a moderately slow pace with short natural pauses, without sounding robotic.',
  'Avoid theatrical, commercial, newsreader or childish delivery.',
  PROPER_NOUNS,
].join(' ');

const INSTRUCTIONS_FR = [
  'Speak in clear, natural French.',
  'Use a warm, professional tone, calm and helpful.',
  'Avoid theatrical or overly formal delivery.',
  'Speak at a moderate pace.',
  'Pronounce "Agadir N\'Tguida" as "Agadir N-Tguida" (two words, stress on each).',
  'Pronounce "Lakhsass" as "Lakh-sass".',
  'Pronounce "Boutrouch" as "Bou-trouch".',
  'Pronounce "Sidi Ifni" as "Si-di If-ni".',
  'Pronounce "Guelmim" as "Kel-mim".',
  'Pronounce "Oued Noun" as "Oued Noun" (French-style).',
  'Pronounce "douar" as "dwar" (Moroccan pronunciation).',
].join(' ');

function hasArabic(text: string) {
  return /[؀-ۿ]/.test(text);
}

function bearerToken(req: VercelRequest): string | null {
  const raw = req.headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.startsWith('Bearer ') ? value.slice(7).trim() : null;
}

function getBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    try { return JSON.parse(body) as Record<string, unknown>; } catch { return {}; }
  }
  return body && typeof body === 'object' ? body as Record<string, unknown> : {};
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    return !error && !!data.user;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: 'Non autorise.' });

    const valid = await verifyToken(token);
    if (!valid) return res.status(401).json({ error: 'Session invalide.' });

    if (!OPENAI_API_KEY) return res.status(503).json({ error: 'TTS non configure.' });

    const body = getBody(req.body);
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) return res.status(400).json({ error: 'Texte manquant.' });

    const langParam = typeof body.lang === 'string' ? body.lang : null;
    const arabic = langParam === 'ar' || (!langParam && hasArabic(text));
    const instructions = arabic ? INSTRUCTIONS_DARIJA : INSTRUCTIONS_FR;

    const ttsResp = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text.slice(0, MAX_CHARS),
        voice: 'marin',
        instructions,
        response_format: 'mp3',
      }),
    });

    if (!ttsResp.ok) {
      const err = await ttsResp.text().catch(() => '');
      console.error('[TTS] OpenAI error', ttsResp.status, err.slice(0, 200));
      return res.status(502).json({ error: `OpenAI TTS ${ttsResp.status}` });
    }

    const arrayBuffer = await ttsResp.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    const audio = btoa(binary);

    return res.status(200).json({ audio, mediaType: 'audio/mpeg' });
  } catch (err) {
    console.error('[TTS] Unexpected error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
