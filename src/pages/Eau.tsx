import { ArrowLeft, CheckCircle2, Droplets, ShieldCheck, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readWaterInformations } from '../data/water';
import type { WaterCategory, WaterStatus } from '../types/water';

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
  categories: Record<WaterCategory, string>;
  statuses: Record<WaterStatus, string>;
};

export const eauCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Eau et forage',
    intro: "Informations publiques simples sur l'eau, le forage, les entretiens annoncés et les projets hydrauliques.",
    empty: "Les informations validées sur l'eau et le forage seront publiées ici.",
    date: 'Date',
    responsible: 'Responsable',
    note: 'Aucune donnée technique dangereuse, aucun contrôle infrastructure, aucun capteur et aucune télémétrie ne sont actifs ici.',
    future: 'Structure préparée pour le suivi de la maintenance, le suivi de la consommation et les alertes aux habitants du douar.',
    categories: {
      forage: 'Forage',
      reservoir: 'Réservoir',
      reseau: 'Réseau',
      maintenance: 'Maintenance',
      qualiteEau: 'Qualité eau',
      sensibilisation: 'Sensibilisation',
      projetHydraulique: 'Projet hydraulique',
    },
    statuses: {
      normal: 'Normal',
      maintenance: 'Maintenance',
      alert: 'Alerte',
      project: 'Projet',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الماء والبئر',
    intro: 'معلومات جماعية بسيطة حول شبكة الماء والبئر والصيانة المعلنة والمشاريع المائية.',
    empty: 'سيتم نشر المعلومات المؤكدة حول الماء والبئر هنا بعد التحقق.',
    date: 'التاريخ',
    responsible: 'المسؤول',
    note: 'لا توجد معطيات تقنية خطيرة أو تحكم في البنية أو أجهزة قياس أو تتبع آلي في هذا الفضاء.',
    future: 'البنية مهيأة لتتبع الصيانة والاستهلاك والتنبيهات لسكان الدوار.',
    categories: {
      forage: 'البئر',
      reservoir: 'الخزان',
      reseau: 'الشبكة',
      maintenance: 'الصيانة',
      qualiteEau: 'جودة الماء',
      sensibilisation: 'التحسيس',
      projetHydraulique: 'مشروع مائي',
    },
    statuses: {
      normal: 'عادي',
      maintenance: 'صيانة',
      alert: 'تنبيه',
      project: 'مشروع',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function EauPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('eau', eauCopy)[lang];
  const items = readWaterInformations()
    .filter((item) => item.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="panel water-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Droplets size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="eau" pageId="eau" />

      <div className="water-grid">
        {items.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {items.map((item) => (
          <article className={`water-card ${item.status}`} key={item.id}>
            <div className="water-topline"><span>{t.categories[item.category]}</span><strong>{t.statuses[item.status]}</strong></div>
            <h2>{lang === 'ar' ? item.titleAr : item.title}</h2>
            <p>{lang === 'ar' ? item.descriptionAr : item.description}</p>
            <AudioHelp scriptId={item.scriptId as any} pageId="eau" />
            <CardListenButton text={`${lang === 'ar' ? item.titleAr : item.title}. ${lang === 'ar' ? item.descriptionAr : item.description}`} lang={lang} />
            <div className="water-meta"><span>{t.date}: {formatDate(item.date, lang)}</span><span><UserRound size={15} /> {t.responsible}: {item.responsible}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
