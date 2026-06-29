import { Activity, ArrowLeft, BarChart3, CheckCircle2, Filter, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readAnnouncements } from '../data/announcements';
import { readHeritageItems } from '../data/heritage';
import { readMembers } from '../data/members';
import { readOralMemoryStories } from '../data/oralMemory';
import { readPublicDocuments } from '../data/publicDocuments';
import { readReports } from '../data/reports';
import { readTimelineEvents } from '../data/timeline';

type Lang = 'fr' | 'ar';
type StatScope = 'all' | 'public' | 'internal';

type Copy = {
  back: string;
  title: string;
  intro: string;
  filter: string;
  all: string;
  publicScope: string;
  internalScope: string;
  registrationRequests: string;
  activeMembers: string;
  openReports: string;
  publishedAnnouncements: string;
  publicDocuments: string;
  oralMemory: string;
  heritage: string;
  timeline: string;
  noTracking: string;
  future: string;
  miniGraph: string;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Tableau statistiques simple',
    intro: 'Vue interne sobre des volumes de la plateforme, sans suivi utilisateur ni analytics complexes.',
    filter: 'Filtrer la vue',
    all: 'Tout',
    publicScope: 'Modules publics',
    internalScope: 'Modules internes',
    registrationRequests: 'Demandes inscription',
    activeMembers: 'Membres actifs',
    openReports: 'Signalements ouverts',
    publishedAnnouncements: 'Annonces publiées',
    publicDocuments: 'Documents publics',
    oralMemory: 'Récits mémoire orale',
    heritage: 'Éléments patrimoine',
    timeline: 'Événements chronologie',
    noTracking: 'Aucun tracking utilisateur, aucune donnée sensible et aucun temps réel dans cette version.',
    future: 'Structure préparée pour des statistiques plus fines du douar plus tard.',
    miniGraph: 'Mini graphique sobre',
  },
  ar: {
    back: 'رجوع',
    title: 'لوحة إحصائيات بسيطة',
    intro: 'واجهة داخلية هادئة لحجم استعمال المنصة، بدون تتبع للمستخدمين وبدون تحليلات معقدة.',
    filter: 'تصفية العرض',
    all: 'الكل',
    publicScope: 'الوحدات العمومية',
    internalScope: 'الوحدات الداخلية',
    registrationRequests: 'طلبات التسجيل',
    activeMembers: 'الأعضاء النشطون',
    openReports: 'التبليغات المفتوحة',
    publishedAnnouncements: 'الإعلانات المنشورة',
    publicDocuments: 'الوثائق العمومية',
    oralMemory: 'روايات الذاكرة الشفوية',
    heritage: 'عناصر التراث',
    timeline: 'أحداث التسلسل التاريخي',
    noTracking: 'لا يوجد تتبع للمستخدمين ولا معطيات حساسة ولا تحديث فوري في هذه النسخة.',
    future: 'البنية مهيأة لإحصائيات أدق خاصة بالدوار مستقبلا.',
    miniGraph: 'رسم مبسط',
  },
};

const registrationStorageKey = 'agadirnetguida.registrationRequests.v2';

type RegistrationRequestSnapshot = { id: string };

type StatCard = {
  id: string;
  label: string;
  value: number;
  scope: Exclude<StatScope, 'all'>;
};

function readRegistrationRequestsCount() {
  const stored = localStorage.getItem(registrationStorageKey);
  if (!stored) return 0;
  try {
    return (JSON.parse(stored) as RegistrationRequestSnapshot[]).length;
  } catch {
    return 0;
  }
}

export default function BureauStatistiquesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [scope, setScope] = useState<StatScope>('all');

  const cards = useMemo<StatCard[]>(() => {
    const reports = readReports();
    return [
      { id: 'registrations', label: t.registrationRequests, value: readRegistrationRequestsCount(), scope: 'internal' },
      { id: 'members', label: t.activeMembers, value: readMembers().filter((member) => member.state === 'active').length, scope: 'internal' },
      { id: 'reports', label: t.openReports, value: reports.filter((report) => report.status !== 'resolved').length, scope: 'internal' },
      { id: 'announcements', label: t.publishedAnnouncements, value: readAnnouncements().length, scope: 'public' },
      { id: 'documents', label: t.publicDocuments, value: readPublicDocuments().filter((document) => document.published).length, scope: 'public' },
      { id: 'oral-memory', label: t.oralMemory, value: readOralMemoryStories().filter((story) => story.published).length, scope: 'public' },
      { id: 'heritage', label: t.heritage, value: readHeritageItems().filter((item) => item.published).length, scope: 'public' },
      { id: 'timeline', label: t.timeline, value: readTimelineEvents().filter((event) => event.published).length, scope: 'public' },
    ];
  }, [t]);

  const visibleCards = scope === 'all' ? cards : cards.filter((card) => card.scope === scope);
  const maxValue = Math.max(1, ...visibleCards.map((card) => card.value));

  return (
    <section className="panel statistics-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><BarChart3 size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-statistiques" />

      <div className="statistics-filter">
        <label className="field"><span><Filter size={16} /> {t.filter}</span><select value={scope} onChange={(event) => setScope(event.target.value as StatScope)}><option value="all">{t.all}</option><option value="public">{t.publicScope}</option><option value="internal">{t.internalScope}</option></select></label>
      </div>

      <div className="statistics-grid">
        {visibleCards.map((card) => (
          <article className={`statistics-card ${card.scope}`} key={card.id}>
            <div className="statistics-card-topline"><span>{card.scope === 'public' ? t.publicScope : t.internalScope}</span><Activity size={18} /></div>
            <strong>{card.value}</strong>
            <h2>{card.label}</h2>
            <div className="mini-bar" aria-label={t.miniGraph}><span style={{ inlineSize: `${Math.max(8, (card.value / maxValue) * 100)}%` }} /></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.noTracking}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
