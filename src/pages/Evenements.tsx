import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readEvents } from '../data/events';
import type { EventCategory, EventImportance, EventStatus } from '../types/events';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  date: string;
  location: string;
  organizer: string;
  note: string;
  future: string;
  categories: Record<EventCategory, string>;
  statuses: Record<EventStatus, string>;
  importances: Record<EventImportance, string>;
};

export const evenementsCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Événements communautaires',
    intro: 'Agenda public simple des événements du douar, avec uniquement les informations validées et non sensibles.',
    empty: 'Aucun événement publié pour le moment.',
    date: 'Date',
    location: 'Lieu',
    organizer: 'Organisateur',
    note: 'Aucune réservation, aucun paiement et aucune donnée sensible ne sont affichés dans cet espace public.',
    future: 'Structure prête pour un futur calendrier, des rappels et la participation des habitants.',
    categories: {
      reunion: 'Réunion',
      solidarite: 'Solidarité',
      mosquee: 'Mosquée',
      jeunesse: 'Jeunesse',
      agriculture: 'Agriculture',
      patrimoine: 'Patrimoine',
      nettoyage: 'Nettoyage',
      formation: 'Formation',
      feteLocale: 'Fête locale',
    },
    statuses: {
      planned: 'Prévu',
      confirmed: 'Confirmé',
      completed: 'Terminé',
    },
    importances: {
      normal: 'Importance normale',
      important: 'Important',
      urgent: 'Très important',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الأحداث الجماعية',
    intro: 'جدول عمومي بسيط لأحداث الدوار، يعرض فقط المعلومات المصادق عليها وغير الحساسة.',
    empty: 'لا يوجد أي حدث منشور حاليا.',
    date: 'التاريخ',
    location: 'المكان',
    organizer: 'المنظم',
    note: 'لا توجد حجوزات أو أداءات أو معطيات حساسة معروضة في هذا الفضاء العمومي.',
    future: 'البنية مهيأة لتقويم مستقبلي وتذكيرات ومشاركة السكان.',
    categories: {
      reunion: 'اجتماع',
      solidarite: 'تضامن',
      mosquee: 'المسجد',
      jeunesse: 'الشباب',
      agriculture: 'الفلاحة',
      patrimoine: 'التراث',
      nettoyage: 'نظافة',
      formation: 'تكوين',
      feteLocale: 'مناسبة محلية',
    },
    statuses: {
      planned: 'مبرمج',
      confirmed: 'مؤكد',
      completed: 'منتهى',
    },
    importances: {
      normal: 'أهمية عادية',
      important: 'مهم',
      urgent: 'مهم جدا',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function EvenementsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('evenements', evenementsCopy)[lang];
  const events = readEvents()
    .filter((event) => event.published)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section className="panel events-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><CalendarDays size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="evenements" pageId="evenements" />

      <div className="events-grid">
        {events.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {events.map((event) => (
          <article className={`event-card ${event.status} ${event.importance}`} key={event.id}>
            <div className="event-topline"><span>{t.categories[event.category]}</span><strong>{t.statuses[event.status]}</strong></div>
            <h2>{lang === 'ar' ? event.titleAr : event.title}</h2>
            <p>{lang === 'ar' ? event.descriptionAr : event.description}</p>
            <AudioHelp scriptId={event.scriptId as any} pageId="evenements" />
            <CardListenButton text={`${lang === 'ar' ? event.titleAr : event.title}. ${lang === 'ar' ? event.descriptionAr : event.description}`} lang={lang} />
            <div className="event-meta"><span><CalendarDays size={15} /> {t.date}: {formatDate(event.date, lang)}</span><span><MapPin size={15} /> {t.location}: {event.location}</span></div>
            <div className="event-meta"><span>{t.organizer}: {event.organizer}</span><span>{t.importances[event.importance]}</span></div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
