import { ArrowLeft, CheckCircle2, ShieldCheck, Sprout, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readAgricultureInitiatives } from '../data/agriculture';
import type { AgricultureCategory, AgricultureStatus } from '../types/agriculture';

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
  categories: Record<AgricultureCategory, string>;
  statuses: Record<AgricultureStatus, string>;
};

export const agricultureCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Agriculture',
    intro: "Informations publiques simples sur les initiatives agricoles, l'irrigation, les plantations et l'entretien communautaire des terres.",
    empty: 'Les informations agricoles validées seront publiées ici progressivement.',
    date: 'Date',
    responsible: 'Responsable',
    note: 'Aucune donnée foncière réelle, aucun titre de propriété, aucune donnée juridique sensible et aucun suivi GPS ne sont affichés.',
    future: 'Structure préparée pour le suivi de l irrigation, les statistiques agricoles et les coopératives du douar.',
    categories: {
      irrigation: 'Irrigation',
      oliviers: 'Oliviers',
      amandiers: 'Amandiers',
      elevage: 'Élevage',
      entretienTerres: 'Entretien terres',
      environnement: 'Environnement',
      reboisement: 'Reboisement',
      agricultureDurable: 'Agriculture durable',
    },
    statuses: {
      preparing: 'Préparation',
      active: 'Active',
      seasonal: 'Saisonnière',
      completed: 'Terminée',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الفلاحة والأراضي الجماعية',
    intro: 'معلومات عمومية بسيطة حول المبادرات الفلاحية والسقي والغرس والعناية الجماعية بالأراضي.',
    empty: 'سيتم نشر المبادرات الفلاحية المؤكدة هنا بعد التحقق.',
    date: 'التاريخ',
    responsible: 'المسؤول',
    note: 'لا يتم عرض أي معطيات عقارية حقيقية أو وثائق ملكية أو معطيات قانونية حساسة أو تتبع GPS.',
    future: 'البنية مهيأة لتتبع السقي والإحصائيات الفلاحية والتعاونيات داخل الدوار.',
    categories: {
      irrigation: 'السقي',
      oliviers: 'الزيتون',
      amandiers: 'اللوز',
      elevage: 'تربية المواشي',
      entretienTerres: 'العناية بالأراضي',
      environnement: 'البيئة',
      reboisement: 'التشجير',
      agricultureDurable: 'الفلاحة المستدامة',
    },
    statuses: {
      preparing: 'في التحضير',
      active: 'نشطة',
      seasonal: 'موسمية',
      completed: 'منتهية',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function AgriculturePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('agriculture', agricultureCopy)[lang];
  const initiatives = readAgricultureInitiatives()
    .filter((initiative) => initiative.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="panel agriculture-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Sprout size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="agriculture" pageId="agriculture" />

      <div className="agriculture-grid">
        {initiatives.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {initiatives.map((initiative) => (
          <article className={`agriculture-card ${initiative.status}`} key={initiative.id}>
            <div className="agriculture-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{lang === 'ar' ? initiative.titleAr : initiative.title}</h2>
            <p>{lang === 'ar' ? initiative.descriptionAr : initiative.description}</p>
            <AudioHelp scriptId={initiative.scriptId as any} pageId="agriculture" />
            <CardListenButton text={`${lang === 'ar' ? initiative.titleAr : initiative.title}. ${lang === 'ar' ? initiative.descriptionAr : initiative.description}`} lang={lang} />
            <div className="agriculture-meta"><span>{t.date}: {formatDate(initiative.date, lang)}</span><span><UserRound size={15} /> {t.responsible}: {initiative.responsible}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
