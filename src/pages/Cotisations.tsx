import { ArrowLeft, CheckCircle2, Coins, History, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import CardListenButton from '../components/CardListenButton';
import { readContributions } from '../data/contributions';
import type { ContributionStatus, ContributionType } from '../types/contributions';

type Lang = 'fr' | 'ar';
type StatusFilter = 'all' | ContributionStatus;

type Copy = {
  back: string;
  title: string;
  intro: string;
  filter: string;
  all: string;
  total: string;
  empty: string;
  member: string;
  date: string;
  note: string;
  history: string;
  protection: string;
  future: string;
  types: Record<ContributionType, string>;
  statuses: Record<ContributionStatus, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Gestion cotisations',
    intro: 'Vue interne simple des cotisations communautaires, avec une transparence digne et respectueuse.',
    filter: 'Filtrer par statut',
    all: 'Tous les statuts',
    total: 'Total affiché',
    empty: 'Aucune cotisation enregistrée pour le moment.',
    member: 'Membre concerné',
    date: 'Date',
    note: 'Note',
    history: 'Historique basique',
    protection: 'Aucune donnée bancaire, aucun paiement en ligne, aucune liste humiliante.',
    future: 'Structure préparée pour séparation Mosquée / Association et permissions avancées du douar.',
    types: {
      association: 'Association',
      soutien: 'Soutien',
      exceptionnel: 'Exceptionnel',
      mosquee: 'Mosquée',
      projet_collectif: 'Projet collectif',
    },
    statuses: {
      paid: 'Payé',
      partial: 'Partiel',
      pending: 'En attente',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تدبير المساهمات',
    intro: 'واجهة داخلية بسيطة للمساهمات الجماعية بشفافية تحفظ الكرامة والاحترام.',
    filter: 'تصفية حسب الحالة',
    all: 'كل الحالات',
    total: 'المجموع المعروض',
    empty: 'لا توجد أي مساهمة مسجلة حاليا.',
    member: 'العضو المعني',
    date: 'التاريخ',
    note: 'ملاحظة',
    history: 'سجل بسيط',
    protection: 'لا توجد معطيات بنكية ولا أداء إلكتروني ولا أي لائحة محرجة.',
    future: 'البنية مهيأة للفصل مستقبلا بين المسجد والجمعية والصلاحيات المتقدمة داخل الدوار.',
    types: {
      association: 'الجمعية',
      soutien: 'الدعم',
      exceptionnel: 'استثنائية',
      mosquee: 'المسجد',
      projet_collectif: 'مشروع جماعي',
    },
    statuses: {
      paid: 'تم الأداء',
      partial: 'جزئي',
      pending: 'في الانتظار',
    },
  },
};

function formatAmount(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { maximumFractionDigits: 2 }).format(value) + ' MAD';
}

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function CotisationsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [filter, setFilter] = useState<StatusFilter>('all');
  const contributions = readContributions();
  const visible = useMemo(() => contributions
    .filter((contribution) => filter === 'all' || contribution.status === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [contributions, filter]);
  const total = visible.reduce((sum, contribution) => sum + contribution.amount, 0);

  return (
    <section className="panel contributions-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Coins size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>

      <div className="contributions-summary">
        <div><strong>{formatAmount(total, lang)}</strong><span>{t.total}</span></div>
        <label className="field"><span>{t.filter}</span><select value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)}><option value="all">{t.all}</option>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>

      <div className="contributions-list">
        {visible.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {visible.map((contribution) => (
          <article className={`contribution-card ${contribution.status}`} key={contribution.id}>
            <div className="contribution-topline"><span>{t.types[contribution.type]}</span><strong>{t.statuses[contribution.status]}</strong></div>
            <h2>{formatAmount(contribution.amount, lang)}</h2>
            <p>{t.member}: {contribution.memberName}</p>
            <p>{t.date}: {formatDate(contribution.date, lang)}</p>
            {contribution.note ? <p className="contribution-note">{t.note}: {contribution.note}</p> : null}
            <CardListenButton text={`${t.types[contribution.type]}. ${contribution.memberName}${contribution.note ? '. ' + contribution.note : ''}`} lang={lang} />
            <div className="contribution-history">
              <h3><History size={16} /> {t.history}</h3>
              {contribution.history.slice(-3).map((item) => <span key={item.id}>{formatDate(item.at, lang)} - {item.label}</span>)}
            </div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
