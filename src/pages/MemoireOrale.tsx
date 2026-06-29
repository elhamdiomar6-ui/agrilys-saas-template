import { ArrowLeft, AudioLines, BookOpenText, Clock3, ShieldCheck, UserRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import EditorialPageImage from '../components/EditorialPageImage';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readOralMemoryStories } from '../data/oralMemory';
import type { OralMemoryCategory, OralMemoryStatus } from '../types/oralMemory';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  narrator: string;
  period: string;
  audioFuture: string;
  note: string;
  categories: Record<OralMemoryCategory, string>;
  statuses: Record<OralMemoryStatus, string>;
};

export const memoireOraleCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Mémoire orale',
    intro: 'Un espace public pour préserver les récits anciens, traditions, témoignages et sagesses du douar.',
    empty: 'Aucun récit publié pour le moment.',
    narrator: 'Narrateur',
    period: 'Période approximative',
    audioFuture: 'Audio prévu plus tard',
    note: 'Les récits affichés restent publics, sobres et non sensibles. Les détails privés ne doivent pas être publiés.',
    categories: {
      histoire: 'Histoire',
      traditions: 'Traditions',
      agriculture: 'Agriculture',
      eau: 'Eau',
      mosquee: 'Mosquée',
      solidarite: 'Solidarité',
      evenements: 'Événements marquants',
    },
    statuses: {
      verified: 'Vérifié',
      to_confirm: 'À confirmer',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الذاكرة الشفوية',
    intro: 'فضاء عمومي لحفظ الحكايات القديمة، الشهادات، التقاليد، والحكمة الشعبية للدوار.',
    empty: 'لا يوجد أي رواية منشورة حاليا.',
    narrator: 'الراوي',
    period: 'الفترة التقريبية',
    audioFuture: 'الصوت سيضاف لاحقا',
    note: 'الروايات المنشورة تبقى عمومية وهادئة وغير حساسة. لا يجب نشر التفاصيل الخاصة.',
    categories: {
      histoire: 'التاريخ',
      traditions: 'التقاليد',
      agriculture: 'الفلاحة',
      eau: 'الماء',
      mosquee: 'المسجد',
      solidarite: 'التضامن',
      evenements: 'أحداث بارزة',
    },
    statuses: {
      verified: 'تم التحقق',
      to_confirm: 'بحاجة إلى تأكيد',
    },
  },
};

export default function MemoireOralePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('memoire-orale', memoireOraleCopy)[lang];
  const stories = readOralMemoryStories()
    .filter((story) => story.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section className="panel oral-memory-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><BookOpenText size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <EditorialPageImage pageId="memoire-orale" alt="" />
      <AudioHelp scriptId="memoire-orale" pageId="memoire-orale" />

      <div className="oral-memory-list">
        {stories.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {stories.map((story) => (
          <article className={`oral-memory-card ${story.status}`} key={story.id}>
            <div className="oral-memory-topline">
              <span>{t.categories[story.category]}</span>
              <strong>{t.statuses[story.status]}</strong>
            </div>
            <h2>{story.title}</h2>
            <p>{story.summary}</p>
            <CardListenButton text={`${story.title}. ${story.summary}`} lang={lang} />
            <div className="oral-memory-meta">
              <span><UserRound size={16} /> {t.narrator}: {story.narrator}</span>
              <span><Clock3 size={16} /> {t.period}: {story.approximatePeriod}</span>
              <span><AudioLines size={16} /> {t.audioFuture}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
    </section>
  );
}
