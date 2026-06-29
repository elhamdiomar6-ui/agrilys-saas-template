import { ArrowLeft, ClipboardList, HandHeart, History, Info, Mail, MapPinned, ShieldCheck, UsersRound } from 'lucide-react';
import AgadirHistory from '../components/AgadirHistory';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { siteConfig } from '../config/site';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  registration: string;
  douarTitle: string;
  douarText: string;
  locationTitle: string;
  locationText: string;
  associationTitle: string;
  associationText: string;
  contactTitle: string;
  contactText: string;
  visionTitle: string;
  visionText: string;
  visionText2: string;
  visionText3: string;
  principlesTitle: string;
  principles: string[];
  whyTitle: string;
  whyText: string;
  availableTitle: string;
  available: string[];
  laterTitle: string;
  later: string[];
  note: string;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'À propos du douar et de l association',
    intro: 'Une présentation simple du douar Agadir n’Tguida, de l association et de la vision AGADIRNETGUIDA.',
    registration: 'Demander une inscription',
    douarTitle: 'Le douar Agadir n’Tguida',
    douarText: 'Agadir n’Tguida est une communauté rurale marocaine attachée à son identité, à sa mémoire et à la solidarité entre habitants, diaspora et responsables locaux.',
    locationTitle: 'Localisation administrative',
    locationText: 'La localisation administrative officielle sera complétée et validée par le bureau afin d éviter toute information approximative.',
    associationTitle: 'Association de Coopération et Développement',
    associationText: 'L association agit comme cadre local d organisation, de coordination et de continuité pour les sujets utiles au douar.',
    contactTitle: 'Contact officiel',
    contactText: 'Pour contacter l association, utilisez l email officiel.',
    visionTitle: 'Vision AGADIRNETGUIDA',
    visionText: "AGADIRNETGUIDA est d'abord la plateforme officielle du douar Agadir N'Tguida. Elle permet de présenter le village, d'organiser les services habitants, de valoriser le patrimoine local, de suivre les projets communautaires et de renforcer le travail de l'association.",
    visionText2: "Cette plateforme a été créée pour servir notre communauté : faciliter la vie associative, préserver notre patrimoine culturel et architectural, faciliter la communication entre les familles du douar, et donner à chaque habitant un accès simple et transparent aux informations qui le concernent.",
    visionText3: "Elle reflète notre engagement collectif pour le développement de notre douar, dans le respect de nos valeurs et de notre histoire.",
    principlesTitle: 'Principes',
    principles: ['Transparence utile', 'Entraide', 'Dignité', 'Mémoire institutionnelle', 'Organisation progressive'],
    whyTitle: 'Pourquoi cette application existe',
    whyText: 'Elle aide à garder une trace claire des demandes, annonces, documents publics et signalements simples, tout en séparant les espaces publics des espaces internes.',
    availableTitle: 'Déjà disponible',
    available: ['Demande d inscription publique', 'Espace habitant', 'Annonces publiques', 'Documents publics', 'Signalement habitant'],
    laterTitle: 'Plus tard',
    later: ['Validation complète par le bureau', 'Publication progressive des documents validés', 'Modules internes avec rôles clairs', 'Amélioration selon l usage réel du terrain'],
    note: 'Aucune donnée sensible n est affichée sur cette page.',
  },
  ar: {
    back: 'رجوع',
    title: 'حول الدوار والجمعية',
    intro: 'تقديم بسيط لدوار أگدير نتگيدا، والجمعية، ورؤية AGADIRNETGUIDA.',
    registration: 'طلب التسجيل',
    douarTitle: 'دوار أگدير نتگيدا',
    douarText: 'أگدير نتگيدا جماعة قروية مغربية مرتبطة بهويتها وذاكرتها وروح التضامن بين الساكنة والجالية والمسؤولين المحليين.',
    locationTitle: 'الموقع الإداري',
    locationText: 'سيتم إتمام الموقع الإداري الرسمي والمصادقة عليه من طرف المكتب لتفادي أي معلومة غير دقيقة.',
    associationTitle: 'جمعية التعاون والتنمية',
    associationText: 'تعمل الجمعية كإطار محلي للتنظيم والتنسيق والاستمرارية في المواضيع المفيدة للدوار.',
    contactTitle: 'التواصل الرسمي',
    contactText: 'للتواصل مع الجمعية، استعملوا البريد الإلكتروني الرسمي.',
    visionTitle: 'رؤية AGADIRNETGUIDA',
    visionText: 'تعتبر منصة AGADIRNETGUIDA أولا المنصة الرسمية لدوار أكادير نتكيدا. فهي تساعد على تقديم الدوار، وتنظيم خدمات الساكنة، وتثمين التراث المحلي، وتتبع المشاريع الجماعية، وتقوية عمل الجمعية.',
    visionText2: 'تم إنشاء هذه المنصة لخدمة جماعتنا: تسهيل العمل الجمعوي، حفظ التراث الثقافي والمعماري، تسهيل التواصل بين عائلات الدوار، وتمكين كل ساكن من الوصول البسيط والواضح إلى المعلومات التي تهمه.',
    visionText3: 'تعكس هذه المنصة التزامنا الجماعي بتنمية دوارنا، مع احترام قيمنا وتاريخنا.',
    principlesTitle: 'المبادئ',
    principles: ['شفافية نافعة', 'تعاون', 'كرامة', 'ذاكرة مؤسساتية', 'تنظيم تدريجي'],
    whyTitle: 'لماذا يوجد هذا التطبيق',
    whyText: 'يساعد على حفظ أثر واضح للطلبات والإعلانات والوثائق العمومية والتبليغات البسيطة، مع فصل الفضاءات العمومية عن الفضاءات الداخلية.',
    availableTitle: 'المتوفر حاليا',
    available: ['طلب التسجيل العمومي', 'فضاء الساكنة', 'الإعلانات العمومية', 'الوثائق العمومية', 'تبليغ الساكنة'],
    laterTitle: 'لاحقا',
    later: ['مصادقة كاملة من طرف المكتب', 'نشر تدريجي للوثائق المصادق عليها', 'وحدات داخلية بصلاحيات واضحة', 'تحسين حسب الاستعمال الحقيقي في الميدان'],
    note: 'لا يتم عرض أي معطيات حساسة في هذه الصفحة.',
  },
};

function InfoCard({ icon, title, children, ttsText, lang }: { icon: React.ReactNode; title: string; children: React.ReactNode; ttsText?: string; lang?: Lang }) {
  return (
    <article className="about-card">
      <div className="about-card-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        {children}
        {ttsText ? <CardListenButton text={ttsText} lang={lang} /> : null}
      </div>
    </article>
  );
}

export default function AProposPage({ lang, onBack, onInscription }: { lang: Lang; onBack: () => void; onInscription: () => void }) {
  const t = copy[lang];

  return (
    <main role="main" className="panel about-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Info size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="a-propos" pageId="a-propos" />
      <AgadirHistory lang={lang} variant="about" />

      <div className="about-grid">
        <InfoCard icon={<MapPinned size={22} />} title={t.douarTitle} ttsText={`${t.douarTitle}. ${t.douarText}`} lang={lang}><p>{t.douarText}</p></InfoCard>
        <InfoCard icon={<MapPinned size={22} />} title={t.locationTitle} ttsText={`${t.locationTitle}. ${t.locationText}`} lang={lang}><p>{t.locationText}</p></InfoCard>
        <InfoCard icon={<UsersRound size={22} />} title={t.associationTitle} ttsText={`${t.associationTitle}. ${t.associationText}`} lang={lang}><p>{t.associationText}</p></InfoCard>
        <InfoCard icon={<Mail size={22} />} title={t.contactTitle} ttsText={`${t.contactTitle}. ${t.contactText}`} lang={lang}>
          <p>{t.contactText}</p>
          <p><a href={`mailto:${siteConfig.officialEmail}`}>{siteConfig.officialEmail}</a></p>
        </InfoCard>
        <InfoCard icon={<ShieldCheck size={22} />} title={t.visionTitle} ttsText={`${t.visionTitle}. ${t.visionText} ${t.visionText2}`} lang={lang}>
          <p>{t.visionText}</p>
          <p>{t.visionText2}</p>
          <p>{t.visionText3}</p>
        </InfoCard>
        <InfoCard icon={<HandHeart size={22} />} title={t.principlesTitle} ttsText={`${t.principlesTitle}. ${t.principles.join(', ')}`} lang={lang}>
          <ul>{t.principles.map((item) => <li key={item}>{item}</li>)}</ul>
        </InfoCard>
        <InfoCard icon={<History size={22} />} title={t.whyTitle} ttsText={`${t.whyTitle}. ${t.whyText}`} lang={lang}><p>{t.whyText}</p></InfoCard>
      </div>

      <div className="about-columns">
        <div>
          <h2>{t.availableTitle}</h2>
          <ul>{t.available.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h2>{t.laterTitle}</h2>
          <ul>{t.later.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <button className="primary-action" onClick={onInscription}><ClipboardList size={20} /> {t.registration}</button>
    </main>
  );
}
