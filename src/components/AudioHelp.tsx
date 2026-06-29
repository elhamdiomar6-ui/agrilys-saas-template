import { Square, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getCachedAudioSrc } from '../lib/audioPrecache';
import { loadPageMedia } from '../lib/agadirHistoryContent';
import type { EditorialPageId } from '../lib/agadirHistoryContent';

type AudioHelpLang = 'darija' | 'amazigh';

type AudioHelpScriptId =
  | 'home-guide'
  | 'inscription'
  | 'signalement'
  | 'carte-patrimoine'
  | 'annonces'
  | 'habitant'
  | 'explorer'
  | 'documents-publics'
  | 'eau'
  | 'evenements'
  | 'projets'
  | 'memoire-orale'
  | 'chronologie'
  | 'entraide'
  | 'jeunesse'
  | 'agriculture'
  | 'cooperatives'
  | 'a-propos'
  | 'diaspora'
  | 'bureau-accueil'
  | 'bureau-inscriptions'
  | 'bureau-signalements'
  | 'bureau-annonces'
  | 'bureau-workflow-publication'
  | 'bureau-documents-publics'
  | 'bureau-renouvellement'
  | 'bureau-plan-action'
  | 'connexion'
  | 'bureau-memoire-orale'
  | 'bureau-chronologie'
  | 'bureau-carte'
  | 'bureau-workflows'
  | 'bureau-contacts'
  | 'bureau-taches'
  | 'bureau-demarches'
  | 'bureau-reunions'
  | 'president-pilotage'
  | 'president-dossiers'
  | 'bureau-patrimoine'
  | 'bureau-collecte'
  | 'bureau-cotisations-imam'
  | 'bureau-sauvegarde'
  | 'bureau-operations'
  | 'bureau-orchid'
  | 'bureau-projets'
  | 'bureau-membres'
  | 'bureau-jeunesse'
  | 'bureau-eau'
  | 'bureau-diaspora'
  | 'bureau-cooperatives'
  | 'bureau-agriculture'
  | 'bureau-statistiques'
  | 'bureau-evenements'
  | 'bureau-entraide'
  | 'bureau-documents-reunion'
  | 'president-editor'
  | 'president-recensement'
  | 'chronologie-jalon-001'
  | 'chronologie-jalon-002'
  | 'chronologie-jalon-003'
  | 'chronologie-jalon-004'
  | 'chronologie-jalon-005'
  | 'chronologie-jalon-006'
  | 'agriculture-init'
  | 'cooperatives-init'
  | 'events-init'
  | 'projects-init'
  | 'water-init'
  | 'youth-init'
  | 'solidarity-init'
  | 'diaspora-init'
  | 'agriculture-oliviers'
  | 'agriculture-irrigation'
  | 'agriculture-reboisement'
  | 'cooperatives-terroir'
  | 'cooperatives-artisanat'
  | 'cooperatives-elevage'
  | 'water-maintenance'
  | 'water-qualite'
  | 'water-hydraulique'
  | 'events-reunion'
  | 'events-fete'
  | 'events-nettoyage'
  | 'projects-eau'
  | 'projects-routes'
  | 'projects-energie'
  | 'youth-education'
  | 'youth-sport'
  | 'youth-patrimoine'
  | 'solidarity-familiale'
  | 'solidarity-sante'
  | 'solidarity-alimentaire'
  | 'diaspora-accompagnement'
  | 'diaspora-participation'
  | 'diaspora-investissements';

type AudioHelpProps = {
  scriptId: AudioHelpScriptId;
  lang?: AudioHelpLang;
  label?: string;
  pageId?: EditorialPageId;
  remoteOnly?: boolean;
};

const audioLabels: Record<AudioHelpScriptId, string> = {
  'home-guide': 'كيفاش نستعمل الموقع',
  inscription: 'سمع شرح التسجيل',
  signalement: 'سمع شرح التبليغ',
  'carte-patrimoine': 'سمع شرح الخريطة والتراث',
  annonces: 'سمع شرح الأخبار',
  habitant: 'سمع شرح خدمات الساكنة',
  explorer: 'سمع شرح أقسام الموقع',
  'documents-publics': 'سمع شرح الوثائق العمومية',
  eau: 'سمع شرح صفحة الماء',
  evenements: 'سمع شرح الأنشطة',
  projets: 'سمع شرح المشاريع',
  'memoire-orale': 'سمع شرح الذاكرة الشفوية',
  chronologie: 'سمع شرح التسلسل التاريخي',
  entraide: 'سمع شرح التعاضد الاجتماعي',
  jeunesse: 'سمع شرح صفحة الشباب',
  agriculture: 'سمع شرح صفحة الفلاحة',
  cooperatives: 'سمع شرح صفحة التعاونيات',
  'a-propos': 'سمع شرح من نحن',
  diaspora: 'سمع شرح صفحة المغتربين',
  'bureau-accueil': 'سمع شرح فضاء المكتب',
  'bureau-inscriptions': 'سمع شرح طلبات الانخراط',
  'bureau-signalements': 'سمع شرح إشعارات الساكنة',
  'bureau-annonces': 'سمع شرح نشر الإعلانات',
  'bureau-workflow-publication': 'سمع شرح سير النشر',
  'bureau-documents-publics': 'سمع شرح الوثائق العمومية',
  'bureau-renouvellement': 'سمع شرح تجديد الجمعية',
  'bureau-plan-action': 'سمع شرح خطة العمل',
  connexion: 'سمع شرح تسجيل الدخول',
  'bureau-memoire-orale': 'سمع شرح الذاكرة الشفهية',
  'bureau-chronologie': 'سمع شرح التسلسل التاريخي',
  'bureau-carte': 'سمع شرح نقاط الخريطة',
  'bureau-workflows': 'سمع شرح مسار المصادقة',
  'bureau-contacts': 'سمع شرح كرناس الاتصالات',
  'bureau-taches': 'سمع شرح المهام الداخلية',
  'bureau-demarches': 'سمع شرح المساطر الإدارية',
  'bureau-reunions': 'سمع شرح سجل الاجتماعات',
  'president-pilotage': 'سمع شرح لوحة القيادة',
  'president-dossiers': 'سمع شرح الملفات الاستراتيجية',
  'bureau-patrimoine': 'سمع شرح إدارة التراث',
  'bureau-collecte': 'سمع شرح جمع المعطيات',
  'bureau-cotisations-imam': 'سمع شرح مساهمات الإمام',
  'bureau-sauvegarde': 'سمع شرح تحميل البيانات',
  'bureau-operations': 'سمع شرح فضاء العمل الداخلي',
  'bureau-orchid': 'سمع شرح مساعد ORCHID',
  'bureau-projets': 'سمع شرح تدبير المشاريع',
  'bureau-membres': 'سمع شرح تدبير الأعضاء',
  'bureau-jeunesse': 'سمع شرح مبادرات الشباب',
  'bureau-eau': 'سمع شرح معطيات الماء',
  'bureau-diaspora': 'سمع شرح مبادرات الجالية',
  'bureau-cooperatives': 'سمع شرح التعاونيات',
  'bureau-agriculture': 'سمع شرح المعطيات الفلاحية',
  'bureau-statistiques': 'سمع شرح الإحصاءات',
  'bureau-evenements': 'سمع شرح تدبير الفعاليات',
  'bureau-entraide': 'سمع شرح التعاضد الاجتماعي',
  'bureau-documents-reunion': 'سمع شرح وثائق الاجتماعات',
  'president-editor': 'سمع شرح محرر المحتوى',
  'president-recensement': 'سمع شرح إحصاء الساكنة',
  'chronologie-jalon-001': 'سمع شرح بناء أكادير نتڭيدا',
  'chronologie-jalon-002': 'سمع شرح استعادة سيدي إفني',
  'chronologie-jalon-003': 'سمع شرح جرد التراث 2018',
  'chronologie-jalon-004': 'سمع شرح الجريدة الرسمية 2020',
  'chronologie-jalon-005': 'سمع شرح المرسوم 2026',
  'chronologie-jalon-006': 'سمع شرح الجمع العام 2026',
  'agriculture-init': 'سمع شرح الفلاحة والمبادرات',
  'cooperatives-init': 'سمع شرح التعاونيات والاقتصاد المحلي',
  'events-init': 'سمع شرح الأحداث الجماعية',
  'projects-init': 'سمع شرح المشاريع الجماعية',
  'water-init': 'سمع شرح الماء والبئر',
  'youth-init': 'سمع شرح الشباب والمبادرات',
  'solidarity-init': 'سمع شرح التعاون الاجتماعي',
  'diaspora-init': 'سمع شرح الجالية والدعم الخارجي',
  'agriculture-oliviers': 'سمع شرح حماية أشجار الزيتون',
  'agriculture-irrigation': 'سمع شرح نظام السقي الجماعي',
  'agriculture-reboisement': 'سمع شرح التشجير وإعادة التشجير',
  'cooperatives-terroir': 'سمع شرح تعاونية الأرجان',
  'cooperatives-artisanat': 'سمع شرح تعاونية الحرف اليدوية',
  'cooperatives-elevage': 'سمع شرح تعاونية تربية الماشية',
  'water-maintenance': 'سمع شرح صيانة الختارة',
  'water-qualite': 'سمع شرح جودة المياه',
  'water-hydraulique': 'سمع شرح المشروع الهيدروليكي',
  'events-reunion': 'سمع شرح الاجتماع العام المجتمعي',
  'events-fete': 'سمع شرح الفعالية المحلية',
  'events-nettoyage': 'سمع شرح يوم التنظيف الجماعي',
  'projects-eau': 'سمع شرح تحسين شبكة المياه',
  'projects-routes': 'سمع شرح تحسين الوصول للدوار',
  'projects-energie': 'سمع شرح الطاقة المتجددة',
  'youth-education': 'سمع شرح الدعم الدراسي والتعليم',
  'youth-sport': 'سمع شرح الأنشطة الرياضية',
  'youth-patrimoine': 'سمع شرح نقل التراث الثقافي',
  'solidarity-familiale': 'سمع شرح الترابط العائلي',
  'solidarity-sante': 'سمع شرح الدعم الصحي',
  'solidarity-alimentaire': 'سمع شرح المساعدة الغذائية',
  'diaspora-accompagnement': 'سمع شرح مرافقة المهاجرين',
  'diaspora-participation': 'سمع شرح المشاركة عن بعد',
  'diaspora-investissements': 'سمع شرح استثمارات الجالية',
};

export default function AudioHelp({ scriptId, lang = 'darija', label, pageId, remoteOnly = false }: AudioHelpProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeLang, setActiveLang] = useState<AudioHelpLang>(lang);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [remoteAudioUrl, setRemoteAudioUrl] = useState<string | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState(!pageId);
  const [resolvedSrc, setResolvedSrc] = useState<string>(`/audio/${activeLang}/${scriptId}.mp3`);
  const title = label ?? audioLabels[scriptId];

  useEffect(() => {
    if (!pageId) return;
    let active = true;
    loadPageMedia(pageId)
      .then((media) => {
        if (!active) return;
        setRemoteAudioUrl(
          media.find((item) => item.media_type === 'audio' && item.lang === 'darija')?.public_url ?? null,
        );
        setMediaLoaded(true);
      })
      .catch(() => {
        if (active) {
          setRemoteAudioUrl(null);
          setMediaLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [pageId]);

  useEffect(() => {
    if (activeLang === 'darija' && remoteAudioUrl) {
      setResolvedSrc(remoteAudioUrl);
      return;
    }
    if (activeLang !== 'darija') {
      setResolvedSrc(`/audio/${activeLang}/${scriptId}.mp3`);
      return;
    }
    let active = true;
    getCachedAudioSrc(`/audio/darija/${scriptId}.mp3`).then((src) => {
      if (active) setResolvedSrc(src);
    });
    return () => { active = false; };
  }, [scriptId, activeLang, remoteAudioUrl]);

  if (remoteOnly && mediaLoaded && !remoteAudioUrl) return null;

  const prepareAudio = () => {
    const audio = audioRef.current;
    if (audio && audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
      audio.load();
    }
  };

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(false);
    setIsLoading(true);
    try {
      if (audio.currentTime > 0 && audio.seekable.length > 0) {
        audio.currentTime = 0;
      }
      void audio.play().catch(() => {
        setError(true);
        setIsLoading(false);
        setIsPlaying(false);
      });
    } catch {
      setError(true);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsLoading(false);
    setIsPlaying(false);
  };

  return (
    <aside className="audio-help" dir="rtl" aria-label={title}>
      <div className="audio-help-copy">
        <Volume2 size={26} aria-hidden="true" />
        <div>
          <strong>{title}</strong>
          <span>شرح صوتي بالدارجة</span>
        </div>
      </div>
      <div className="audio-help-actions">
        <button
          className="audio-help-play"
          type="button"
          onPointerDown={prepareAudio}
          onFocus={prepareAudio}
          onClick={play}
          disabled={isLoading}
        >
          <Volume2 size={20} /> {isLoading ? 'جاري تشغيل الصوت...' : isPlaying ? 'عاود من اللول' : 'سمع الصوت'}
        </button>
        <button className="audio-help-stop" type="button" onClick={stop} disabled={!isLoading && !isPlaying}>
          <Square size={18} /> وقف
        </button>
      </div>
      {error ? <p className="audio-help-error">تعذر تشغيل الصوت. تأكد من صوت الهاتف وحاول مرة أخرى.</p> : null}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        src={resolvedSrc}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onWaiting={() => {
          if (!audioRef.current?.paused) setIsLoading(true);
        }}
        onPause={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
        onEnded={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
        onError={() => {
          if (activeLang === 'amazigh') {
            setActiveLang('darija');
            setError(false);
            setIsLoading(false);
            return;
          }
          setError(true);
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />
    </aside>
  );
}
