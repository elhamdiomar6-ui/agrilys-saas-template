import { ArrowLeft, CheckCircle2, Globe2, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readDiasporaInitiatives } from '../data/diaspora';
import type { DiasporaCategory, DiasporaStatus } from '../types/diaspora';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  date: string;
  region: string;
  note: string;
  future: string;
  categories: Record<DiasporaCategory, string>;
  statuses: Record<DiasporaStatus, string>;
};

export const diasporaCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Diaspora et soutien externe',
    intro: 'Espace public pour garder un lien simple avec les membres du douar vivant ailleurs et valoriser les initiatives utiles au developpement local.',
    empty: 'Aucune initiative diaspora publiee pour le moment.',
    date: 'Date',
    region: 'Pays ou region',
    note: 'Aucune donnee financiere reelle, aucun transfert d argent, aucun contact public sensible et aucune donnee privee diaspora ne sont affiches.',
    future: 'Structure preparee pour le lien avec la diaspora, le mentorat et le soutien aux projets du douar.',
    categories: {
      projectSupport: 'Soutien projets',
      education: 'Education',
      solidarity: 'Solidarite',
      skills: 'Competences',
      communityInvestment: 'Investissements communautaires',
      heritage: 'Patrimoine',
      youth: 'Jeunesse',
      agriculture: 'Agriculture',
    },
    statuses: {
      idea: 'Idee',
      active: 'Active',
      completed: 'Terminee',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الجالية والدعم الخارجي',
    intro: 'فضاء عمومي للحفاظ على صلة بسيطة مع أبناء الدوار المقيمين خارجه وإبراز المبادرات المفيدة للتنمية المحلية.',
    empty: 'لا توجد أي مبادرة منشورة خاصة بالجالية حاليا.',
    date: 'التاريخ',
    region: 'البلد أو الجهة',
    note: 'لا يتم عرض أي معطيات مالية حقيقية أو تحويلات مالية أو تواصل عمومي حساس أو معلومات خاصة بالجالية.',
    future: 'البنية مهيأة للتواصل مع الجالية والتأطير ودعم مشاريع الدوار.',
    categories: {
      projectSupport: 'دعم المشاريع',
      education: 'التعليم',
      solidarity: 'التضامن',
      skills: 'الكفاءات',
      communityInvestment: 'استثمارات جماعية',
      heritage: 'التراث',
      youth: 'الشباب',
      agriculture: 'الفلاحة',
    },
    statuses: {
      idea: 'فكرة',
      active: 'نشطة',
      completed: 'منتهية',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function DiasporaPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('diaspora', diasporaCopy)[lang];
  const initiatives = readDiasporaInitiatives()
    .filter((initiative) => initiative.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="panel diaspora-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Globe2 size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="diaspora" pageId="diaspora" />

      <div className="diaspora-grid">
        {initiatives.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {initiatives.map((initiative) => (
          <article className={`diaspora-card ${initiative.status}`} key={initiative.id}>
            <div className="diaspora-topline"><span>{t.categories[initiative.category]}</span><strong>{t.statuses[initiative.status]}</strong></div>
            <h2>{lang === 'ar' ? initiative.titleAr : initiative.title}</h2>
            <p>{lang === 'ar' ? initiative.descriptionAr : initiative.description}</p>
            <AudioHelp scriptId={initiative.scriptId as any} pageId="diaspora" />
            <CardListenButton text={`${lang === 'ar' ? initiative.titleAr : initiative.title}. ${lang === 'ar' ? initiative.descriptionAr : initiative.description}`} lang={lang} />
            <div className="diaspora-meta"><span>{t.date}: {formatDate(initiative.date, lang)}</span><span><MapPin size={15} /> {t.region}: {initiative.region}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
      <p className="privacy-note"><HeartHandshake size={18} /> {lang === 'ar' ? 'الهدف هو تقوية الرابط الإنساني مع الدوار بدون كشف المعطيات الخاصة.' : 'L objectif reste de renforcer le lien humain avec le douar sans exposer les informations privees.'}</p>
    </section>
  );
}
