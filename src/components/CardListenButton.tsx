import { Square, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAuth } from '../lib/auth/supabaseAuth';

type Props = {
  text: string;
  lang?: 'fr' | 'ar';
};

type State = 'idle' | 'loading' | 'playing' | 'login_required';

export default function CardListenButton({ text, lang = 'fr' }: Props) {
  const { session } = useAuth();
  const [state, setState] = useState<State>('idle');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const labels = lang === 'ar'
    ? { idle: 'سمع', loading: '...', playing: 'وقف', login_required: 'سجل دخولك للاستماع' }
    : { idle: 'Écouter', loading: '...', playing: 'Stop', login_required: 'Connectez-vous pour écouter' };

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    try { sourceRef.current?.stop(); } catch {}
    sourceRef.current = null;
    setState('idle');
  }

  async function listen() {
    if (!session) {
      setState('login_required');
      setTimeout(() => setState('idle'), 3000);
      return;
    }
    if (state !== 'idle') { stop(); return; }
    setState('loading');
    const abort = new AbortController();
    abortRef.current = abort;
    const token = session.access_token;
    try {
      const resp = await fetch('/api/orchid/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: `${text.slice(0, 600).trimEnd()}.`, lang }),
        signal: abort.signal,
      });
      if (abort.signal.aborted) return;
      if (!resp.ok) { setState('idle'); return; }
      const { audio } = await resp.json() as { audio: string };
      const binary = atob(audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => { sourceRef.current = null; setState('idle'); };
      sourceRef.current = source;
      source.start(0);
      setState('playing');
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setState('idle');
    }
  }

  const isLoginMsg = state === 'login_required';

  return (
    <button
      className={`card-listen-btn${state === 'playing' ? ' active' : ''}${isLoginMsg ? ' login-msg' : ''}`}
      onClick={listen}
      type="button"
      aria-label={labels[state]}
    >
      {state === 'playing' ? <Square size={14} /> : <Volume2 size={14} />}
      <span>{labels[state]}</span>
    </button>
  );
}
