import { ArrowLeft, CheckCircle2, HeartHandshake, ShieldCheck, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readSolidarityActions } from '../data/solidarity';
import type { SolidarityCategory, SolidarityStatus } from '../types/solidarity';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  date: string;
  organizer: string;
  note: string;
  future: string;
  categories: Record<SolidarityCategory, string>;
  statuses: Record<SolidarityStatus, string>;
};

export const entraideCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Entraide',
    intro: 'Un espace public digne pour suivre les actions de solidarité et les initiatives collectives du douar.',
    empty: 'Les actions solidaires validées seront publiées ici, sans noms de familles ni données privées.',
    date: 'Date',
    organizer: 'Organisateur',
    note: 'Aucune liste de familles, aucune donnée médicale, aucun paiement réel et aucun score social ne sont affichés.',
    future: 'Structure préparée pour le volontariat, la coordination des habitants et la gestion future des aides du douar.',
    categories: {
      solidarite: 'Solidarité',
      sante: 'Santé',
      familles: 'Familles',
      urgence: 'Urgence',
      benevolat: 'Bénévolat',
      alimentation: 'Alimentation',
      education: 'Éducation',
      environnement: 'Environnement',
    },
    statuses: {
      preparing: 'Préparation',
      active: 'Active',
      completed: 'Terminée',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'التعاون الاجتماعي',
    intro: 'فضاء عمومي محترم لتتبع أعمال التضامن والمبادرات الجماعية داخل الدوار.',
    empty: 'سيتم نشر المبادرات التضامنية المؤكدة هنا دون عرض أسماء العائلات.',
    date: 'التاريخ',
    organizer: 'المنظم',
    note: 'لا يتم عرض أي لائحة عائلات أو معطيات طبية أو أداء حقيقي أو تقييم اجتماعي.',
    future: 'البنية مهيأة للتطوع وتنسيق السكان وتدبير المساعدات داخل الدوار.',
    categories: {
      solidarite: 'التضامن',
      sante: 'الصحة',
      familles: 'العائلات',
      urgence: 'الاستعجال',
      benevolat: 'التطوع',
      alimentation: 'التغذية',
      education: 'التعليم',
      environnement: 'البيئة',
    },
    statuses: {
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

export default function EntraidePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('entraide', entraideCopy)[lang];
  const actions = readSolidarityActions()
    .filter((action) => action.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="panel solidarity-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><HeartHandshake size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="entraide" pageId="entraide" />

      <div className="solidarity-grid">
        {actions.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {actions.map((action) => (
          <article className={`solidarity-card ${action.status}`} key={action.id}>
            <div className="solidarity-topline"><span>{t.categories[action.category]}</span><strong>{t.statuses[action.status]}</strong></div>
            <h2>{lang === 'ar' ? action.titleAr : action.title}</h2>
            <p>{lang === 'ar' ? action.descriptionAr : action.description}</p>
            <AudioHelp scriptId={action.scriptId as any} pageId="entraide" />
            <CardListenButton text={`${lang === 'ar' ? action.titleAr : action.title}. ${lang === 'ar' ? action.descriptionAr : action.description}`} lang={lang} />
            <div className="solidarity-meta"><span>{t.date}: {formatDate(action.date, lang)}</span><span><UserRound size={15} /> {t.organizer}: {action.organizer}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
