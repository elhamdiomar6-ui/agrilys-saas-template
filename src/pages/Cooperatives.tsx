import { ArrowLeft, CheckCircle2, ShieldCheck, Store, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readCooperativeInitiatives } from '../data/cooperatives';
import { fetchPublicCooperatives } from '../lib/multiDouars';
import type { CooperativeCategory, CooperativeStatus } from '../types/cooperatives';
import type { CooperativeProfile } from '../types/multiDouars';

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
  categories: Record<CooperativeCategory, string>;
  statuses: Record<CooperativeStatus, string>;
};

export const cooperativesCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Coopératives',
    intro: 'Espace public pour présenter les coopératives, savoir-faire, produits locaux et initiatives productives du douar.',
    empty: 'Les initiatives économiques validées seront publiées ici progressivement.',
    date: 'Date',
    responsible: 'Responsable',
    note: 'Aucune gestion comptable réelle, aucune donnée bancaire, aucun paiement en ligne, aucune donnée juridique sensible et aucun marketplace ne sont actifs.',
    future: 'Structure préparée pour les coopératives locales, les statistiques économiques utiles et les partenariats validés du douar.',
    categories: {
      agriculture: 'Agriculture',
      artisanat: 'Artisanat',
      produitsTerroir: 'Produits terroir',
      elevage: 'Élevage',
      transformationAlimentaire: 'Transformation alimentaire',
      tourismeRural: 'Tourisme rural',
      jeunesse: 'Jeunesse',
      femmesRurales: 'Femmes rurales',
    },
    statuses: {
      idea: 'Idée',
      active: 'Active',
      development: 'En développement',
      completed: 'Terminée',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'التعاونيات والاقتصاد المحلي',
    intro: 'فضاء عمومي للتعريف بالتعاونيات والحرف والمنتجات المحلية والمبادرات الإنتاجية في الدوار.',
    empty: 'سيتم نشر المبادرات الاقتصادية المؤكدة هنا بعد التحقق.',
    date: 'التاريخ',
    responsible: 'المسؤول',
    note: 'لا توجد محاسبة حقيقية أو معطيات بنكية أو أداء عبر الإنترنت أو معطيات قانونية حساسة أو سوق إلكتروني فعلي.',
    future: 'البنية مهيأة للتعاونيات المحلية والإحصائيات الاقتصادية والشراكات المصادق عليها داخل الدوار.',
    categories: {
      agriculture: 'الفلاحة',
      artisanat: 'الصناعة التقليدية',
      produitsTerroir: 'منتجات محلية',
      elevage: 'تربية المواشي',
      transformationAlimentaire: 'تحويل غذائي',
      tourismeRural: 'السياحة القروية',
      jeunesse: 'الشباب',
      femmesRurales: 'النساء القرويات',
    },
    statuses: {
      idea: 'فكرة',
      active: 'نشطة',
      development: 'في التطوير',
      completed: 'منتهية',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function CooperativesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('cooperatives', cooperativesCopy)[lang];
  const [directory, setDirectory] = useState<CooperativeProfile[]>([]);
  const initiatives = readCooperativeInitiatives()
    .filter((initiative) => initiative.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    fetchPublicCooperatives().then(setDirectory);
  }, []);

  return (
    <section className="panel cooperatives-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Store size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="cooperatives" pageId="cooperatives" />

      {directory.length > 0 ? (
        <section className="access-group">
          <div className="access-group-heading">
            <h2>{lang === 'ar' ? 'دليل التعاونيات' : 'Annuaire des cooperatives'}</h2>
            <p>{lang === 'ar' ? 'تعاونيات منشورة بعد التحقق.' : 'Cooperatives publiees apres validation.'}</p>
          </div>
          <div className="cooperatives-grid">
            {directory.map((cooperative) => (
              <article className="cooperatives-card active" key={cooperative.id}>
                <div className="cooperatives-topline">
                  <span>{cooperative.type_produit || 'autre'}</span>
                  <strong>{cooperative.douars?.nom || "Douar"}</strong>
                </div>
                <h2>{lang === 'ar' && cooperative.nom_ar ? cooperative.nom_ar : cooperative.nom}</h2>
                <p>{cooperative.description}</p>
                <CardListenButton text={`${lang === 'ar' && cooperative.nom_ar ? cooperative.nom_ar : cooperative.nom}. ${cooperative.description}`} lang={lang} />
                {cooperative.certifications?.length ? (
                  <div className="cooperatives-meta">
                    {cooperative.certifications.map((certification) => <span key={certification}>{certification}</span>)}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="cooperatives-grid">
        {initiatives.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {initiatives.map((initiative) => (
          <article className={`cooperatives-card ${initiative.status}`} key={initiative.id}>
            <div className="cooperatives-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{lang === 'ar' ? initiative.titleAr : initiative.title}</h2>
            <p>{lang === 'ar' ? initiative.descriptionAr : initiative.description}</p>
            <AudioHelp scriptId={initiative.scriptId as any} pageId="cooperatives" />
            <CardListenButton text={`${lang === 'ar' ? initiative.titleAr : initiative.title}. ${lang === 'ar' ? initiative.descriptionAr : initiative.description}`} lang={lang} />
            <div className="cooperatives-meta"><span>{t.date}: {formatDate(initiative.date, lang)}</span><span><UserRound size={15} /> {t.responsible}: {initiative.responsible}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
