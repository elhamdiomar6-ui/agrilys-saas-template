import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readYouthInitiatives } from '../data/youth';
import type { YouthCategory, YouthStatus } from '../types/youth';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  date: string;
  responsible: string;
  note: string;
  future: string;
  categories: Record<YouthCategory, string>;
  statuses: Record<YouthStatus, string>;
};

export const jeunesseCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Jeunesse et initiatives locales',
    intro: 'Un espace public pour mettre en valeur les idees, activites et actions positives portees par les jeunes du douar.',
    empty: 'Aucune initiative publiee pour le moment.',
    date: 'Date',
    responsible: 'Responsable',
    note: 'Aucune inscription reelle, aucun paiement et aucune messagerie ne sont actifs dans cet espace public.',
    future: 'Structure preparee pour le volontariat, le mentorat et la participation des habitants du douar.',
    categories: {
      education: 'Education',
      sport: 'Sport',
      culture: 'Culture',
      solidarite: 'Solidarite',
      environnement: 'Environnement',
      numerique: 'Numerique',
      agriculture: 'Agriculture',
      patrimoine: 'Patrimoine',
    },
    statuses: {
      idea: 'Idee',
      preparing: 'En preparation',
      active: 'Active',
      completed: 'Terminee',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الشباب والمبادرات المحلية',
    intro: 'فضاء عمومي لإبراز الأفكار والأنشطة والأعمال الإيجابية التي يحملها شباب الدوار.',
    empty: 'لا توجد أي مبادرة منشورة حاليا.',
    date: 'التاريخ',
    responsible: 'المسؤول',
    note: 'لا يوجد تسجيل حقيقي أو أداء أو مراسلة مفعلة في هذا الفضاء العمومي.',
    future: 'البنية مهيأة للتطوع والتأطير ومشاركة سكان الدوار.',
    categories: {
      education: 'التعليم',
      sport: 'الرياضة',
      culture: 'الثقافة',
      solidarite: 'التضامن',
      environnement: 'البيئة',
      numerique: 'الرقمي',
      agriculture: 'الفلاحة',
      patrimoine: 'التراث',
    },
    statuses: {
      idea: 'فكرة',
      preparing: 'في التحضير',
      active: 'نشطة',
      completed: 'منتهية',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function JeunessePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('jeunesse', jeunesseCopy)[lang];
  const initiatives = readYouthInitiatives()
    .filter((initiative) => initiative.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="panel youth-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Sparkles size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="jeunesse" pageId="jeunesse" />

      <div className="youth-grid">
        {initiatives.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {initiatives.map((initiative) => (
          <article className={`youth-card ${initiative.status}`} key={initiative.id}>
            <div className="youth-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{lang === 'ar' ? initiative.titleAr : initiative.title}</h2>
            <p>{lang === 'ar' ? initiative.descriptionAr : initiative.description}</p>
            <AudioHelp scriptId={initiative.scriptId as any} pageId="jeunesse" />
            <CardListenButton text={`${lang === 'ar' ? initiative.titleAr : initiative.title}. ${lang === 'ar' ? initiative.descriptionAr : initiative.description}`} lang={lang} />
            <div className="youth-meta"><span>{t.date}: {formatDate(initiative.date, lang)}</span><span><UserRound size={15} /> {t.responsible}: {initiative.responsible}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
