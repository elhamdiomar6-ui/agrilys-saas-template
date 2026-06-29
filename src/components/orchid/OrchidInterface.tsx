import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth/supabaseAuth';
import type { AgentId, OrchidMessage } from '../../types/orchid';
import { AGENTS, detectAgent, getAgent } from './agents';
import { getStorageKey } from '../../lib/storage/storageUtils';

const storageKey = getStorageKey('orchid.demo.sessions', 'v1');

type SessionMap = Record<AgentId, OrchidMessage[]>;
type Mode = 'demo' | 'live';
type OrchidFilePayload = {
  base64: string;
  mediaType: string;
  fileName: string;
  scanMode?: boolean;
};
type OrchidAudioPayload = {
  base64: string;
  mediaType: string;
  durationSeconds: number;
};

const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
];
const maxSelectedFileSize = 20 * 1024 * 1024;
const maxInlineBase64Length = 3_700_000;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImageForOrchid(file: File, scanMode = false): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const maxSide = scanMode ? 1800 : 1600;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Compression indisponible.'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (scanMode) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const val = avg > 128 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const qualities = scanMode ? [0.82, 0.7, 0.58, 0.46] : [0.78, 0.66, 0.54, 0.42];
      let base64 = '';
      for (const quality of qualities) {
        base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
        if (base64.length <= maxInlineBase64Length) break;
      }

      URL.revokeObjectURL(url);
      if (!base64 || base64.length > maxInlineBase64Length) {
        reject(new Error('Image trop lourde apres compression.'));
        return;
      }
      resolve({ base64, mediaType: 'image/jpeg' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible.'));
    };

    img.src = url;
  });
}

function emptySessions(): SessionMap {
  return AGENTS.reduce((sessions, agent) => {
    sessions[agent.id] = [];
    return sessions;
  }, {} as SessionMap);
}

function loadSessions(): SessionMap {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptySessions();
    return { ...emptySessions(), ...JSON.parse(raw) };
  } catch {
    return emptySessions();
  }
}

function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function makeDemoReply(agentId: AgentId, question: string) {
  const agent = getAgent(agentId);
  return [
    `Mode demo - ${agent.nameFr}`,
    '',
    'Votre question a ete enregistree localement. La connexion IA externe n est pas encore activee : aucune cle API, aucune donnee sensible et aucun document interne ne quittent le navigateur.',
    '',
    `Agent choisi : ${agent.nameFr}`,
    `Question : "${question}"`,
    '',
    'Prochaine etape sure : valider le backend securise avant toute activation IA.',
  ].join('\n');
}

export default function OrchidInterface({ locale = 'fr' }: { locale?: 'fr' | 'ar' }) {
  const auth = useAuth();
  const [mode] = useState<Mode>('live');
  const [activeAgent, setActiveAgent] = useState<AgentId>('directeur');
  const [sessions, setSessions] = useState<SessionMap>(loadSessions);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState<OrchidFilePayload | null>(null);
  const [autoRoute, setAutoRoute] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFileRef = useRef<OrchidFilePayload | null>(null);
  const ttsEnabledRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

  const agent = getAgent(activeAgent);
  const messages = sessions[activeAgent] ?? [];
  const assistantCount = useMemo(
    () => Object.values(sessions).flat().filter((message) => message.role === 'assistant').length,
    [sessions],
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch {
      // local demo history can fail silently if browser storage is full.
    }
  }, [sessions]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeAgent]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      ttsAbortRef.current?.abort();
      audioSourceRef.current?.stop();
      audioCtxRef.current?.close();
    },
    [],
  );

  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  useEffect(() => {
    audioSourceRef.current?.stop();
    audioSourceRef.current = null;
    setSpeakingId(null);
  }, [activeAgent]);

  function addMessage(targetAgent: AgentId, message: OrchidMessage) {
    setSessions((current) => ({
      ...current,
      [targetAgent]: [...(current[targetAgent] ?? []), message],
    }));
  }

  async function sendOrchidRequest(
    targetAgent: AgentId,
    message: string,
    file?: OrchidFilePayload,
    audio?: OrchidAudioPayload,
  ) {
    if (mode === 'live') {
      const token = auth.session?.access_token;
      if (!token) {
        throw new Error('Session President requise pour ORCHID.');
      }

      const response = await fetch('/api/orchid/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: targetAgent,
          message,
          locale,
          history: (sessions[targetAgent] ?? []).slice(-6),
          ...(file ? { file } : {}),
          ...(audio ? { audio } : {}),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Erreur ORCHID.');
      }

      return typeof payload.reply === 'string' ? payload.reply : 'Reponse ORCHID vide.';
    }

    return makeDemoReply(targetAgent, message);
  }

  async function sendMessagePayload(message: string, file?: OrchidFilePayload, audio?: OrchidAudioPayload) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const targetAgent = autoRoute ? detectAgent(trimmed) : activeAgent;
    const contextualFile = file ?? (!audio ? lastFileRef.current ?? undefined : undefined);
    setActiveAgent(targetAgent);
    setLoading(true);

    const now = Date.now();
    addMessage(targetAgent, {
      id: `u_${now}`,
      role: 'user',
      content: file ? `📎 ${file.fileName}\n${trimmed}` : trimmed,
      agentId: targetAgent,
      timestamp: now,
    });

    try {
      const reply = await sendOrchidRequest(targetAgent, trimmed, contextualFile, audio);
      if (file) {
        lastFileRef.current = file;
      }

      const assistantMsgId = `a_${now + 1}`;
      addMessage(targetAgent, {
        id: assistantMsgId,
        role: 'assistant',
        content: reply,
        agentId: targetAgent,
        timestamp: Date.now(),
      });
      if (ttsEnabledRef.current) {
        const token = auth.session?.access_token;
        if (token) void startAudio(assistantMsgId, reply, token);
      }
    } catch (error) {
      addMessage(targetAgent, {
        id: `e_${now + 1}`,
        role: 'assistant',
        content: error instanceof Error ? `ORCHID indisponible : ${error.message}` : 'ORCHID indisponible.',
        agentId: targetAgent,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if ((!trimmed && !pendingFile) || loading) return;
    const fileToSend = pendingFile;
    setInput('');
    setPendingFile(null);
    await sendMessagePayload(trimmed || 'Analyse ce document.', fileToSend ?? undefined);
  }

  async function handleFile(file: File, scanMode = false) {
    if (file.size > maxSelectedFileSize) {
      alert('Fichier trop volumineux - maximum 20MB');
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      alert('Format non supporte - PDF, Word, TXT, JPG, PNG uniquement');
      return;
    }

    try {
      const encoded = file.type.startsWith('image/')
        ? await compressImageForOrchid(file, scanMode)
        : { base64: await fileToBase64(file), mediaType: file.type };

      if (encoded.base64.length > maxInlineBase64Length) {
        alert('Ce document reste trop volumineux pour ORCHID. Pour les PDF/Word de plus de 3MB, il faudra passer par un stockage prive.');
        return;
      }

      setPendingFile({
        base64: encoded.base64,
        mediaType: encoded.mediaType,
        fileName: file.name,
        scanMode,
      });
      textareaRef.current?.focus();
    } catch {
      alert('Impossible de lire ce fichier.');
    }
  }

  async function startRecording() {
    if (loading) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioSeconds(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(1000);
      setRecording(true);
      timerRef.current = setInterval(() => setAudioSeconds((seconds) => seconds + 1), 1000);
    } catch {
      alert('Microphone non accessible. Verifiez les permissions.');
    }
  }

  function stopAndAnalyze() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    const duration = audioSeconds;

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      recorder.stream.getTracks().forEach((track) => track.stop());

      if (audioBlob.size > 5 * 1024 * 1024) {
        alert('Enregistrement trop volumineux - recommencez avec une sequence plus courte.');
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const raw = typeof event.target?.result === 'string' ? event.target.result : '';
        const base64 = raw.split(',')[1];
        if (!base64) {
          alert('Impossible de lire l enregistrement audio.');
          return;
        }

        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const message = [
          `Enregistrement audio reunion - ${minutes}m${String(seconds).padStart(2, '0')}s`,
          'Documente cette reunion : contexte probable, decisions a verifier, taches, responsables, points manquants et brouillon de PV officiel.',
          'Note : si le son brut ne peut pas etre transcrit automatiquement, travaille a partir de ce contexte et demande une transcription manuelle.',
        ].join('\n');

        await sendMessagePayload(message, undefined, {
          base64,
          mediaType: audioBlob.type,
          durationSeconds: duration,
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    recorder.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearAgent() {
    setSessions((current) => ({ ...current, [activeAgent]: [] }));
  }

  function showTtsError(msg: string) {
    setTtsError(msg);
    setTimeout(() => setTtsError(null), 4000);
  }

  function stopAudio() {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    try { audioSourceRef.current?.stop(); } catch { /* already stopped */ }
    audioSourceRef.current = null;
    setSpeakingId(null);
  }

  async function startAudio(messageId: string, text: string, token: string) {
    stopAudio();
    const abort = new AbortController();
    ttsAbortRef.current = abort;
    setSpeakingId(messageId);
    try {
      const resp = await fetch('/api/orchid/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      });
      if (abort.signal.aborted) return;
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({})) as { error?: string };
        showTtsError(`Erreur TTS ${resp.status}: ${body.error ?? 'inconnue'}`);
        setSpeakingId(null);
        return;
      }
      const payload = await resp.json() as { audio?: string };
      if (!payload.audio) { showTtsError('Reponse TTS vide'); setSpeakingId(null); return; }

      const binary = atob(payload.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { audioSourceRef.current = null; setSpeakingId(null); };
      audioSourceRef.current = source;
      source.start(0);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      showTtsError(`Erreur lecture: ${e instanceof Error ? e.message : String(e)}`);
      setSpeakingId(null);
    }
  }

  function speakMessage(messageId: string, text: string) {
    if (speakingId === messageId) { stopAudio(); return; }
    const token = auth.session?.access_token;
    if (!token) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    else if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume();
    void startAudio(messageId, text, token);
  }

  return (
    <div className="orchid-shell">
      <aside className={sidebarOpen ? 'orchid-sidebar open' : 'orchid-sidebar'}>
        <div className="orchid-brand">
          <span>🏔️</span>
          <strong>ORCHID</strong>
          <small>Directeur general IA - mode {mode === 'live' ? 'live' : 'demo'}</small>
        </div>

        <div className="orchid-agent-list">
          {AGENTS.map((item) => {
            const count = (sessions[item.id] ?? []).filter((message) => message.role === 'assistant').length;
            return (
              <button
                key={item.id}
                type="button"
                className={item.id === activeAgent ? 'active' : ''}
                onClick={() => setActiveAgent(item.id)}
                style={{ borderLeftColor: item.id === activeAgent ? item.color : 'transparent' }}
              >
                <span>{item.icon}</span>
                <span>
                  <strong>{item.nameFr}</strong>
                  <small>{item.nameAr}</small>
                </span>
                {count > 0 ? <em>{count}</em> : null}
              </button>
            );
          })}
        </div>

        <label className="orchid-toggle">
          <input type="checkbox" checked={autoRoute} onChange={(event) => setAutoRoute(event.target.checked)} />
          <span>Routage automatique par sujet</span>
        </label>
      </aside>

      <main className="orchid-chat">
        <header className="orchid-chat-header">
          <button type="button" className="orchid-menu-button" onClick={() => setSidebarOpen((value) => !value)}>
            ☰
          </button>
          <div className="orchid-agent-badge" style={{ backgroundColor: agent.color }}>
            {agent.icon}
          </div>
          <div>
            <strong>{agent.nameFr}</strong>
            <small>{agent.description}</small>
          </div>
          <span className="orchid-mode">{mode === 'live' ? 'Live securise' : 'Demo locale'}</span>
          <button
            type="button"
            title={ttsEnabled ? 'Desactiver la lecture vocale' : 'Activer la lecture vocale'}
            aria-label={ttsEnabled ? 'Desactiver la lecture vocale' : 'Activer la lecture vocale'}
            onClick={() => {
              if (ttsEnabled) {
                stopAudio();
              } else if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
              }
              setTtsEnabled((v) => !v);
            }}
            style={{
              background: ttsEnabled ? '#1B5E20' : '#F5F5F5',
              border: '1px solid ' + (ttsEnabled ? '#1B5E20' : '#CCC'),
              borderRadius: 8,
              color: ttsEnabled ? 'white' : '#555',
              cursor: 'pointer',
              fontSize: 17,
              height: 34,
              padding: '0 10px',
              flexShrink: 0,
            }}
          >
            {ttsEnabled ? '🔊' : '🔇'}
          </button>
          {ttsError ? (
            <span style={{ color: '#B71C1C', fontSize: 12, flexShrink: 0, maxWidth: 200 }}>
              {ttsError}
            </span>
          ) : null}
          {messages.length > 0 ? (
            <button type="button" className="orchid-clear" onClick={clearAgent}>
              Effacer
            </button>
          ) : null}
        </header>

        <section className="orchid-messages" aria-live="polite">
          {messages.length === 0 ? (
            <div className="orchid-empty">
              <span>{agent.icon}</span>
              <h2>{agent.nameFr}</h2>
              <p>{agent.description}</p>
              <small>
                {mode === 'live'
                  ? 'Posez une question en francais ou en arabe. La requete passe par une fonction serveur securisee.'
                  : 'Posez une question en francais ou en arabe. Rien n est envoye a une IA externe en Phase 1.'}
              </small>
            </div>
          ) : null}

          {messages.map((message) => (
            <article
              key={message.id}
              className={message.role === 'user' ? 'orchid-message user' : 'orchid-message assistant'}
              dir={hasArabic(message.content) ? 'rtl' : 'ltr'}
            >
              <span>{message.role === 'user' ? 'O' : agent.icon}</span>
              <p>{message.content}</p>
              {message.role === 'assistant' ? (
                <button
                  type="button"
                  title={speakingId === message.id ? 'Arreter la lecture' : 'Lire a voix haute'}
                  aria-label={speakingId === message.id ? 'Arreter la lecture' : 'Lire a voix haute'}
                  onClick={() => speakMessage(message.id, message.content)}
                  style={{
                    alignSelf: 'flex-start',
                    background: speakingId === message.id ? '#1B5E20' : '#E3F2FD',
                    border: '1px solid ' + (speakingId === message.id ? '#1B5E20' : '#90CAF9'),
                    borderRadius: 6,
                    color: speakingId === message.id ? 'white' : '#1565C0',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '3px 8px',
                    marginTop: 6,
                  }}
                >
                  {speakingId === message.id ? 'Stop' : 'Ecouter'}
                </button>
              ) : null}
            </article>
          ))}
          <div ref={endRef} />
        </section>

        <footer className="orchid-composer">
          <input
            type="file"
            id="orchid-file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = '';
              if (file) void handleFile(file);
            }}
          />
          <label
            htmlFor="orchid-file"
            title="Joindre un fichier"
            aria-label="Joindre un fichier"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#F5F5F5',
              border: '1px solid #DDD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 18,
              flexShrink: 0,
              opacity: loading ? 0.55 : 1,
            }}
          >
            📎
          </label>
          <input
            type="file"
            id="orchid-scan"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = '';
              if (file) void handleFile(file, true);
            }}
          />
          <label
            htmlFor="orchid-scan"
            title="Scanner un document"
            aria-label="Scanner un document"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#E8F5E9',
              border: '1px solid #2E7D32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 18,
              flexShrink: 0,
              opacity: loading ? 0.55 : 1,
            }}
          >
            🔍
          </label>
          <button
            type="button"
            onClick={recording ? stopAndAnalyze : startRecording}
            title={recording ? 'Arreter et analyser' : 'Enregistrer reunion'}
            aria-label={recording ? 'Arreter et analyser l enregistrement' : 'Enregistrer une reunion'}
            disabled={loading && !recording}
            style={{
              width: recording ? 76 : 40,
              height: 40,
              borderRadius: 8,
              border: 'none',
              flexShrink: 0,
              cursor: loading && !recording ? 'not-allowed' : 'pointer',
              background: recording ? '#7A3D00' : '#E3F2FD',
              color: recording ? 'white' : '#1565C0',
              fontSize: recording ? 13 : 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {recording ? `Stop ${Math.floor(audioSeconds / 60)}:${String(audioSeconds % 60).padStart(2, '0')}` : '🎙'}
          </button>
          {pendingFile ? (
            <div
              style={{
                alignItems: 'center',
                background: '#E8F5E9',
                border: '1px solid #B7D7B9',
                borderRadius: 8,
                color: '#1B5E20',
                display: 'flex',
                flex: '1 0 100%',
                fontSize: 12,
                gap: 8,
                marginBottom: 2,
                order: -1,
                padding: '6px 10px',
              }}
            >
              <span>📎 {pendingFile.fileName}</span>
              <small>{pendingFile.scanMode ? 'scan pret - ajoutez votre commentaire' : 'fichier pret - ajoutez votre commentaire'}</small>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#B71C1C',
                  cursor: 'pointer',
                  fontSize: 14,
                  marginLeft: 'auto',
                  minHeight: 24,
                  padding: '0 4px',
                }}
              >
                x
              </button>
            </div>
          ) : null}
          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ecrire une question pour ORCHID..."
            dir={hasArabic(input) ? 'rtl' : 'ltr'}
          />
          <button type="button" onClick={sendMessage} disabled={loading || (!input.trim() && !pendingFile)}>
            {loading ? '...' : 'Envoyer'}
          </button>
        </footer>

        <p className="orchid-security-note">
          Phase 2 : {assistantCount} reponses conservees uniquement dans ce navigateur. La cle IA reste cote serveur.
        </p>
      </main>
    </div>
  );
}
