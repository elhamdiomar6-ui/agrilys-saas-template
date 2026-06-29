import { ArrowLeft, CheckCircle2, History, Milestone } from 'lucide-react';
import AgadirHistory from '../components/AgadirHistory';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { readTimelineEvents } from '../data/timeline';
import type { TimelineCategory, TimelineImportance, TimelineStatus } from '../types/timeline';

type JalonScriptId = Parameters<typeof AudioHelp>[0]['scriptId'];

const jalonAudio: Record<string, JalonScriptId> = {
  'TL-001': 'chronologie-jalon-001',
  'TL-002': 'chronologie-jalon-002',
  'TL-003': 'chronologie-jalon-003',
  'TL-004': 'chronologie-jalon-004',
  'TL-005': 'chronologie-jalon-005',
  'TL-006': 'chronologie-jalon-006',
};

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  period: string;
  note: string;
  categories: Record<TimelineCategory, string>;
  importance: Record<TimelineImportance, string>;
  statuses: Record<TimelineStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Chronologie historique',
    intro: 'Repères chronologiques simples pour préserver la mémoire du douar, avec prudence lorsque les informations restent à confirmer.',
    empty: 'Aucun événement historique publié pour le moment.',
    period: 'Période',
    note: 'Les éléments à confirmer sont présentés avec prudence. Aucune information sensible n est affichée publiquement.',
    categories: {
      foundation: 'Fondation',
      water: 'Eau',
      agriculture: 'Agriculture',
      mosquee: 'Mosquée',
      climate: 'Événements climatiques',
      solidarity: 'Solidarité',
      development: 'Développement',
      collective_projects: 'Projets collectifs',
      heritage: 'Patrimoine',
      education: 'Éducation',
    },
    importance: {
      normal: 'Normale',
      important: 'Importante',
      major_historical: 'Historique majeure',
    },
    statuses: {
      verified: 'Vérifié',
      to_confirm: 'À confirmer',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'التسلسل التاريخي',
    intro: 'معالم زمنية بسيطة لحفظ ذاكرة الدوار، مع الحذر عندما تكون المعلومات بحاجة إلى تأكيد.',
    empty: 'لا يوجد أي حدث تاريخي منشور حاليا.',
    period: 'الفترة',
    note: 'المعطيات غير المؤكدة تعرض بحذر. لا يتم عرض أي معلومات حساسة للعموم.',
    categories: {
      foundation: 'التأسيس',
      water: 'الماء',
      agriculture: 'الفلاحة',
      mosquee: 'المسجد',
      climate: 'أحداث مناخية',
      solidarity: 'التضامن',
      development: 'التنمية',
      collective_projects: 'مشاريع جماعية',
      heritage: 'التراث',
      education: 'التعليم',
    },
    importance: {
      normal: 'عادية',
      important: 'مهمة',
      major_historical: 'تاريخية كبرى',
    },
    statuses: {
      verified: 'مؤكد',
      to_confirm: 'بحاجة إلى تأكيد',
    },
  },
};

function periodRank(period: string) {
  const match = period.match(/\d{3,4}/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

export default function ChronologiePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const events = readTimelineEvents()
    .filter((event) => event.published)
    .sort((a, b) => periodRank(a.period) - periodRank(b.period));

  return (
    <section className="panel timeline-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><History size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="chronologie" pageId="chronologie" />
      <AgadirHistory lang={lang} variant="timeline" />

      <div className="timeline-list">
        {events.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {events.map((event) => (
          <article className={`timeline-item ${event.importance} ${event.status}`} key={event.id}>
            <div className="timeline-marker"><Milestone size={18} /></div>
            <div className="timeline-card">
              <div className="timeline-meta">
                <span>{t.period}: {lang === 'ar' && event.period_ar ? event.period_ar : event.period}</span>
                <strong>{t.statuses[event.status]}</strong>
              </div>
              <h2>{lang === 'ar' && event.event_ar ? event.event_ar : event.event}</h2>
              <p>{lang === 'ar' && event.description_ar ? event.description_ar : event.description}</p>
              <CardListenButton
                text={lang === 'ar' && event.event_ar ? `${event.event_ar}. ${event.description_ar ?? event.description}` : `${event.event}. ${event.description}`}
                lang={lang}
              />
              {jalonAudio[event.id] ? <AudioHelp scriptId={jalonAudio[event.id]} /> : null}
              <div className="timeline-tags">
                <span>{t.categories[event.category]}</span>
                <span>{t.importance[event.importance]}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><CheckCircle2 size={18} /> {t.note}</p>
    </section>
  );
}
