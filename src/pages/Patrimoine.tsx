import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';
import AgadirHistory from '../components/AgadirHistory';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import HeritagePhoto from '../components/HeritagePhoto';
import { readHeritageItems } from '../data/heritage';
import type {
  HeritageAccessDifficulty,
  HeritageCategory,
  HeritageEconomicPotential,
  HeritagePriority,
  HeritageStatus,
} from '../types/heritage';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  heritageValue: string;
  tourismInterest: string;
  accessDifficulty: string;
  economicPotential: string;
  priority: string;
  photoFuture: string;
  note: string;
  categories: Record<HeritageCategory, string>;
  statuses: Record<HeritageStatus, string>;
  accessDifficulties: Record<HeritageAccessDifficulty, string>;
  economicPotentials: Record<HeritageEconomicPotential, string>;
  priorities: Record<HeritagePriority, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Patrimoine',
    intro: "Lieux et récits validés du douar, présentés simplement pour les habitants et les visiteurs.",
    empty: 'Les éléments patrimoniaux validés seront publiés ici progressivement.',
    heritageValue: 'Valeur patrimoniale',
    tourismInterest: 'Intérêt touristique',
    accessDifficulty: "Difficulté d'accès",
    economicPotential: 'Potentiel économique',
    priority: 'Priorité',
    photoFuture: 'Photo en cours de collecte au village',
    note: "Aucune photo sensible, donnée privée, localisation sensible ou contact guide n'est publié.",
    categories: {
      agricultural_landscapes: 'Paysages agricoles',
      viewpoints: 'Points de vue',
      walking_trails: 'Sentiers',
      architecture: 'Architecture traditionnelle',
      mosquee: 'Mosquée / lieu religieux',
      quranic_school: 'École coranique',
      oral_history: 'Mémoire orale',
      collective_places: 'Lieux collectifs',
      water_points: 'Eau / source / puits',
      cave_shelter: 'Grotte / abri naturel',
      rock_engraving: 'Gravure / trace ancienne',
      mineral_landscape: 'Paysage minéral',
      local_products: 'Produits du terroir',
      crafts: 'Artisanat',
      local_meal: 'Repas expérience',
      homestay_potential: 'Hébergement potentiel',
      local_guide: 'Guide local',
      photo_gallery: 'Galerie photo',
      tourism_map: 'Carte touristique',
      activity: 'Activité possible',
      water_source: 'Source / eau',
      agriculture: 'Agriculture',
      landscape: 'Paysage',
      memory: 'Mémoire',
      traditions: 'Traditions',
    },
    statuses: {
      published: 'Publié',
      validated_internal: 'Validé interne',
      to_verify: 'À vérifier',
    },
    accessDifficulties: {
      easy: 'Facile',
      medium: 'Moyenne',
      hard: 'Difficile',
      to_verify: 'À vérifier',
    },
    economicPotentials: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      to_verify: 'À vérifier',
    },
    priorities: {
      high: 'Haute',
      medium: 'Moyenne',
      to_verify: 'À vérifier',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'التراث',
    intro: 'أماكن وحكايات مصادق عليها من الدوار، مقدمة ببساطة للسكان والزوار.',
    empty: 'سيتم نشر العناصر التراثية المصادق عليها هنا تدريجيا.',
    heritageValue: 'القيمة التراثية',
    tourismInterest: 'الأهمية السياحية',
    accessDifficulty: 'صعوبة الوصول',
    economicPotential: 'الإمكانية الاقتصادية',
    priority: 'الأولوية',
    photoFuture: 'الصورة قيد الجمع في الدوار',
    note: 'لا يتم نشر أي صورة حساسة أو معلومات خاصة أو موقع حساس أو اتصال بمرشد.',
    categories: {
      agricultural_landscapes: 'مناظر فلاحية',
      viewpoints: 'نقط مشاهدة',
      walking_trails: 'مسارات',
      architecture: 'عمارة تقليدية',
      mosquee: 'مسجد / مكان ديني',
      quranic_school: 'التعليم القرآني',
      oral_history: 'الذاكرة الشفوية',
      collective_places: 'أماكن جماعية',
      water_points: 'ماء / عين / بئر',
      cave_shelter: 'مغارة / ملجأ طبيعي',
      rock_engraving: 'نقش / أثر قديم',
      mineral_landscape: 'منظر صخري',
      local_products: 'منتجات محلية',
      crafts: 'صناعة تقليدية',
      local_meal: 'تجربة طعام',
      homestay_potential: 'إيواء محتمل',
      local_guide: 'مرشد محلي',
      photo_gallery: 'معرض صور',
      tourism_map: 'خريطة سياحية',
      activity: 'نشاط ممكن',
      water_source: 'العين / الماء',
      agriculture: 'الفلاحة',
      landscape: 'المنظر الطبيعي',
      memory: 'الذاكرة',
      traditions: 'التقاليد',
    },
    statuses: {
      published: 'منشور',
      validated_internal: 'مصادق عليه داخليا',
      to_verify: 'بحاجة إلى تحقق',
    },
    accessDifficulties: {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      to_verify: 'للتحقق',
    },
    economicPotentials: {
      low: 'ضعيف',
      medium: 'متوسط',
      high: 'مرتفع',
      to_verify: 'للتحقق',
    },
    priorities: {
      high: 'عالية',
      medium: 'متوسطة',
      to_verify: 'للتحقق',
    },
  },
};

export default function PatrimoinePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const items = readHeritageItems()
    .filter((item) => item.published && item.status === 'published' && item.sensitivity !== 'sensitive')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <main role="main" className="panel heritage-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Landmark size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="carte-patrimoine" pageId="patrimoine" />
      <AgadirHistory lang={lang} variant="heritage" />

      <div className="heritage-grid">
        {items.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {items.map((item) => (
          <article className={`heritage-card ${item.status}`} key={item.id}>
            <HeritagePhoto alt={item.title} imagePath={item.imagePath} label={t.photoFuture} />
            <div className="heritage-body">
              <div className="heritage-topline"><span>{t.categories[item.category]}</span><strong>{t.statuses[item.status]}</strong></div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="heritage-badges">
                <span>{t.accessDifficulty}: {t.accessDifficulties[item.accessDifficulty]}</span>
                <span>{t.priority}: {t.priorities[item.priority]}</span>
              </div>
              <div className="heritage-value"><strong>{t.heritageValue}</strong><span>{item.heritageValue}</span></div>
              {item.tourismInterest ? <div className="heritage-value"><strong>{t.tourismInterest}</strong><span>{item.tourismInterest}</span></div> : null}
              <div className="heritage-value"><strong>{t.economicPotential}</strong><span>{t.economicPotentials[item.economicPotential]}</span></div>
              <CardListenButton text={lang === 'ar' ? `${item.title}. ${item.heritageValue.split('\n\n')[0]}` : `${item.title}. ${item.description}`} lang={lang} />
            </div>
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
    </main>
  );
}
