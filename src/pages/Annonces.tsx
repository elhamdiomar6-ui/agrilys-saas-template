import { ArrowLeft, CalendarDays, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { listerPublie, type ContentItem } from '../lib/contentWorkflow';
import type { AnnouncementCategory, AnnouncementImportance, PublicAnnouncement } from '../types/announcement';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  noSensitive: string;
  categories: Record<AnnouncementCategory, string>;
  importance: Record<AnnouncementImportance, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Annonces publiques',
    intro: 'Informations publiques validées par le bureau, sans données privées ni informations sensibles.',
    empty: 'Aucune annonce publique validée pour le moment.',
    noSensitive: 'Seules les informations générales apparaissent ici.',
    categories: {
      reunion: 'Réunion',
      travaux: 'Travaux',
      eau: 'Eau',
      mosquee: 'Mosquée',
      evenement: 'Événement',
      info: 'Information générale',
    },
    importance: {
      normal: 'Normale',
      important: 'Importante',
      urgent: 'Urgente',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الإعلانات العمومية',
    intro: 'معلومات عمومية مصادق عليها من طرف المكتب، بدون معطيات خاصة أو حساسة.',
    empty: 'لا توجد إعلانات عمومية مصادق عليها حاليا.',
    noSensitive: 'تظهر هنا المعلومات العامة فقط.',
    categories: {
      reunion: 'اجتماع',
      travaux: 'أشغال',
      eau: 'الماء',
      mosquee: 'المسجد',
      evenement: 'حدث',
      info: 'معلومة عامة',
    },
    importance: {
      normal: 'عادية',
      important: 'مهمة',
      urgent: 'مستعجلة',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function sortAnnouncements(items: PublicAnnouncement[]) {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const demoAnnouncementArabic: Record<string, { title: string; content: string }> = {
  ANN_DEMO_001: {
    title: 'مرحباً بكم في الموقع الرسمي للدوار',
    content: 'جمعية أكادير نتكيدا تُرحب بكم في منصتها الرقمية الرسمية. ستجدون هنا كل المعلومات المتعلقة بالدوار والتراث والخدمات الجماعية.',
  },
  ANN_DEMO_002: {
    title: 'اجتماع المكتب — المصادقة على القانون الأساسي الجديد',
    content: 'انعقد مكتب الجمعية للمصادقة على القانون الأساسي الجديد الذي يشمل السياحة الثقافية والشراكات الدولية والأنشطة الرقمية.',
  },
  ANN_DEMO_003: {
    title: 'الحصن الجماعي تڭيدا — تراثنا المشترك',
    content: 'الحصن الجماعي تڭيدا، الموقع التراثي الأمازيغي المدرج من قبل وزارة الثقافة، موثق الآن على منصتنا بإحداثيات GPS وصور.',
  },
};

function localizeAnnouncement(announcement: PublicAnnouncement, lang: Lang) {
  if (lang !== 'ar') return announcement;
  const translated = demoAnnouncementArabic[announcement.id];
  return translated ? { ...announcement, ...translated } : announcement;
}

function workflowToAnnouncement(item: ContentItem): PublicAnnouncement {
  const metadata = item.metadata || {};
  return {
    id: item.id,
    title: item.titre,
    date: typeof metadata.date === 'string' ? metadata.date : (item.publie_le || item.created_at || new Date().toISOString()).slice(0, 10),
    category: typeof metadata.category === 'string' ? metadata.category as AnnouncementCategory : 'info',
    importance: typeof metadata.importance === 'string' ? metadata.importance as AnnouncementImportance : 'normal',
    content: item.contenu || '',
    updatedAt: item.updated_at || item.publie_le || new Date().toISOString(),
  };
}

export default function AnnoncesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);

  useEffect(() => {
    let mounted = true;
    listerPublie('annonce').then((items) => {
      if (!mounted) return;
      setAnnouncements(sortAnnouncements(items.map(workflowToAnnouncement)));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const visibleAnnouncements = announcements.map((announcement) => localizeAnnouncement(announcement, lang));

  return (
    <section className="panel announcements-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Megaphone size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="annonces" />

      <div className="announcements-list">
        {visibleAnnouncements.length === 0 ? (
          <div className="empty-state">{t.empty}</div>
        ) : null}
        {visibleAnnouncements.map((announcement) => (
          <article className={`announcement-card ${announcement.importance}`} key={announcement.id}>
            <div className="announcement-topline">
              <span>{t.categories[announcement.category]}</span>
              <strong>{t.importance[announcement.importance]}</strong>
            </div>
            <h2>{announcement.title}</h2>
            <p>{announcement.content}</p>
            <CardListenButton text={`${announcement.title}. ${announcement.content}`} lang={lang} />
            <div className="announcement-date"><CalendarDays size={17} /> {formatDate(announcement.date, lang)}</div>
          </article>
        ))}
      </div>

      <p className="privacy-note">{t.noSensitive}</p>
    </section>
  );
}
