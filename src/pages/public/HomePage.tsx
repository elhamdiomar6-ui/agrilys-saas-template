import { ClipboardList, FileText, Globe2, Home, Info, LockKeyhole, Megaphone, MessageSquareText, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { siteConfig } from '../../config/site';
import CardListenButton from '../../components/CardListenButton';
import EditorialPageImage from '../../components/EditorialPageImage';
import AudioHelp from '../../components/AudioHelp';
import MarocRegionsMap from '../../components/MarocRegionsMap';
import RoyalSpeechPlayer from '../../components/RoyalSpeechPlayer';

type Lang = 'fr' | 'ar';
type Page = 'home' | 'login' | 'connexionHabitant' | 'explorer' | 'bureau' | 'president' | 'presidentRecensement' | 'inscription' | 'habitant' | 'aPropos' | 'annonces' | 'documentsPublics' | 'signalement' | 'douars' | 'douarDetail' | 'rejoindre' | 'memoireOrale' | 'patrimoine' | 'chronologie' | 'carteCommunautaire' | 'projets' | 'evenements' | 'jeunesse' | 'entraide' | 'eau' | 'agriculture' | 'diaspora' | 'cooperatives' | 'cotisations' | 'membres' | 'bureauInscriptions' | 'bureauAnnonces' | 'bureauDocumentsPublics' | 'bureauDocumentsReunion' | 'bureauSignalements' | 'bureauMemoireOrale' | 'bureauPatrimoine' | 'bureauPlanAction' | 'bureauChronologie' | 'bureauCarteCommunautaire' | 'bureauProjets' | 'bureauEvenements' | 'bureauJeunesse' | 'bureauEntraide' | 'bureauEau' | 'bureauAgriculture' | 'bureauDiaspora' | 'bureauCooperatives' | 'bureauContacts' | 'bureauCollecte' | 'bureauTaches' | 'bureauDemarches' | 'bureauReunions' | 'bureauSauvegarde' | 'presidentPilotageInterne' | 'presidentContentEditor' | 'presidentOrchid' | 'bureauMembres' | 'bureauCotisations' | 'bureauRenouvellement' | 'bureauWorkflows' | 'bureauWorkflowPublication' | 'bureauStatistiques' | 'mosquee' | 'bureauMosquee';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };

const text = {
  fr: {
    badge: 'Version locale sobre',
    title: 'Registre Communautaire Du Douar',
    subtitle: "Agadir n'tguida",
    intro: "Le portail officiel pour les services habitants, les annonces, le patrimoine et le contact avec l'association.",
    platformVisionTitle: 'Vision générale',
    platformVisionText1: "AGADIRNETGUIDA est d'abord la plateforme officielle du douar Agadir N'Tguida. Elle permet de présenter le village, d'organiser les services habitants, de valoriser le patrimoine local, de suivre les projets communautaires et de renforcer le travail de l'association.",
    platformVisionText2: "Cette plateforme a été créée pour servir notre communauté : faciliter la vie associative, préserver notre patrimoine culturel et architectural, faciliter la communication entre les familles du douar, et donner à chaque habitant un accès simple et transparent aux informations qui le concernent.",
    platformVisionText3: "Elle reflète notre engagement collectif pour le développement de notre douar, dans le respect de nos valeurs et de notre histoire.",
    homeCapabilitiesTitle: 'Les capacités de la plateforme',
    homeCapabilitiesIntro: 'Savoir quoi faire, qui contacter, où regarder.',
    homeCapabilityInform: 'Informer',
    homeCapabilityReports: 'Signaler',
    homeCapabilityDocuments: 'Documenter',
    homeCapabilityGovernance: 'Gouverner',
    homeCapabilitySecurity: 'Sécuriser',
    terrainPathTitle: 'Accès rapide',
    requestAccess: 'Demander une inscription',
    residentSpace: 'Services habitants',
    aboutCta: 'À propos',
    publicAnnouncementsCta: 'Annonces publiques',
    publicDocumentsCta: 'Documents publics',
    publicReportCta: 'Faire un signalement',
    publicHeritageCta: 'Patrimoine',
    explorePlatform: 'Explorer la plateforme',
    bureauEntry: 'Connexion Bureau',
    presidentEntry: 'Connexion Président',
    publicInfo: 'Information publique',
    publicInfoDesc: 'Les habitants voient seulement les informations générales validées.',
    officialNotice: 'Accès bureau et président',
    officialNoticeDesc: 'Les espaces internes restent séparés de la demande publique.',
    noDemo: 'Aucun compte demo visible en production.',
    noPin: 'Aucun PIN par défaut public.',
    publicUrl: 'Lien officiel',
    officialEmail: 'Email officiel',
    footer: 'Association de Coopération et Développement - Agadir n\'tguida',
    terrainPrepNotice: 'Cette plateforme est en phase de préparation. Les services habitants seront actifs progressivement.',
  },
  ar: {
    badge: 'نسخة محلية بسيطة',
    title: 'سجل جماعة الدوار',
    subtitle: 'أكادير نتغيدة',
    intro: 'البوابة الرسمية لخدمات السكان والإعلانات والتراث والاتصال بالجمعية.',
    platformVisionTitle: 'الرؤية العامة',
    platformVisionText1: 'أكادير نتغيدة هي قبل كل شيء المنصة الرسمية لدوار أكادير نتغيدة. تسمح بتقديم القرية وتنظيم خدمات السكان وتثمين التراث المحلي ومتابعة المشاريع الجماعية وتعزيز عمل الجمعية.',
    platformVisionText2: 'تم إنشاء هذه المنصة لخدمة مجتمعنا: تسهيل الحياة الجماعية والحفاظ على تراثنا الثقافي والمعماري وتسهيل التواصل بين عائلات الدوار وإعطاء كل ساكن إمكانية وصول بسيطة وشفافة إلى المعلومات التي تهمه.',
    platformVisionText3: 'تعكس التزامنا الجماعي بتطوير دوارنا احترام قيمنا وتاريخنا.',
    homeCapabilitiesTitle: 'قدرات المنصة',
    homeCapabilitiesIntro: 'معرفة ماذا تفعل ومن تتصل به وأين تنظر.',
    homeCapabilityInform: 'إخبار',
    homeCapabilityReports: 'تبليغ',
    homeCapabilityDocuments: 'توثيق',
    homeCapabilityGovernance: 'حكامة',
    homeCapabilitySecurity: 'تأمين',
    terrainPathTitle: 'وصول سريع',
    requestAccess: 'طلب تسجيل',
    residentSpace: 'خدمات السكان',
    aboutCta: 'حول',
    publicAnnouncementsCta: 'الإعلانات العمومية',
    publicDocumentsCta: 'الوثائق العمومية',
    publicReportCta: 'إرسال تبليغ',
    publicHeritageCta: 'التراث',
    explorePlatform: 'استكشاف المنصة',
    bureauEntry: 'ولوج المكتب',
    presidentEntry: 'ولوج الرئيس',
    publicInfo: 'معلومة عمومية',
    publicInfoDesc: 'السكان يرون فقط المعلومات العامة المصادق عليها.',
    officialNotice: 'ولوج المكتب والرئيس',
    officialNoticeDesc: 'تبقى الفضاءات الداخلية منفصلة عن الطلب العمومي.',
    noDemo: 'لا حساب تجريبي مرئي في الإنتاج.',
    noPin: 'لا كود افتراضي علني.',
    publicUrl: 'الرابط الرسمي',
    officialEmail: 'البريد الرسمي',
    footer: 'جمعية التعاون والتنمية - أكادير نتغيدة',
    terrainPrepNotice: 'هذه المنصة في مرحلة التحضير. ستكون خدمات السكان نشطة تدريجيا.',
  },
};

function StatusItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="status-item">
      <div className="status-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
    </div>
  );
}

export default function HomePage({ lang, t: propsT, onInscription, onResident, onAbout, onExplorer, onBureau, onPresident, onNavigate }: { lang: Lang; t: TextBundle; onInscription: () => void; onResident: () => void; onAbout: () => void; onExplorer: () => void; onBureau: () => void; onPresident: () => void; onNavigate: (page: Page) => void }) {
  const t = propsT || text[lang];
  return (
    <section className="panel home-panel public-home-panel">
      <div className="brand-mark"><ShieldCheck size={34} /></div>
      {siteConfig.isDevelopment && <p className="badge"><Globe2 size={14} /> {t.badge}</p>}
      <h1>{t.title}</h1>
      <p className="place">{t.subtitle}</p>
      <p className="intro">{t.intro}</p>
      <EditorialPageImage pageId="accueil" alt="" />
      <AudioHelp scriptId="home-guide" pageId="accueil" />

      <section className="community-vision" style={{ width: '100%', margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            gap: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <RoyalSpeechPlayer lang={lang} />
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <h2 style={{ textAlign: 'center' }}>{t.platformVisionTitle}</h2>
              <p style={{ textAlign: 'center' }}>{t.platformVisionText1}</p>
              <p style={{ textAlign: 'center' }}>{t.platformVisionText2}</p>
              <p style={{ textAlign: 'center' }}>{t.platformVisionText3}</p>
              <CardListenButton text={`${t.platformVisionTitle}. ${t.platformVisionText1} ${t.platformVisionText2}`} lang={lang} />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MarocRegionsMap height="350px" />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: 'center', width: '100%' }}>
                {lang === 'ar'
                  ? '🟢 كلميم واد نون | 🔴 مقاطعة سيدي افني | 🟡 دوار أكادير نتغيدة'
                  : '🟢 Guelmim-Oued Noun | 🔴 Province Sidi Ifni | 🟡 Douar Agadir N\'Tguida'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <a
          href={`mailto:${siteConfig.officialEmail}?subject=Support%20${encodeURIComponent(siteConfig.slug)}`}
          style={{
            display: 'inline-block',
            background: '#2E7D32',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(46,125,50,0.3)',
          }}
        >
          {t.supportDouar}
        </a>
      </div>

      <section className="home-capabilities" aria-labelledby="home-capabilities-title">
        <div className="access-group-heading">
          <h2 id="home-capabilities-title">{t.homeCapabilitiesTitle}</h2>
          <p>{t.homeCapabilitiesIntro}</p>
        </div>
        <div className="capability-grid">
          <StatusItem icon={<Megaphone size={20} />} title={t.homeCapabilityInform} desc={t.publicInfoDesc} />
          <StatusItem icon={<MessageSquareText size={20} />} title={t.homeCapabilityReports} desc={t.publicReportCta} />
          <StatusItem icon={<FileText size={20} />} title={t.homeCapabilityDocuments} desc={t.publicDocumentsCta} />
          <StatusItem icon={<ShieldCheck size={20} />} title={t.homeCapabilityGovernance} desc={t.officialNoticeDesc} />
          <StatusItem icon={<LockKeyhole size={20} />} title={t.homeCapabilitySecurity} desc={t.terrainPrepNotice} />
        </div>
      </section>

      <section className="terrain-path" aria-label={t.terrainPathTitle}>
        <strong>{t.terrainPathTitle}</strong>
        <div>
          <button className="terrain-action inscription-action" type="button" onClick={() => onNavigate('inscription')}><span aria-hidden="true">📝</span>{t.requestAccess}</button>
          <button className="terrain-action report-action" type="button" onClick={() => onNavigate('signalement')}><span aria-hidden="true">🔔</span>{t.publicReportCta}</button>
          <button className="terrain-action heritage-action" type="button" onClick={() => onNavigate('patrimoine')}><span aria-hidden="true">🏛️</span>{t.publicHeritageCta}</button>
          <button className="terrain-action documents-action" type="button" onClick={() => onNavigate('documentsPublics')}><span aria-hidden="true">📄</span>{t.publicDocumentsCta}</button>
        </div>
      </section>

      <div className="home-actions public-actions">
        <button className="primary-action" onClick={onInscription}>
          <ClipboardList size={20} />
          {t.requestAccess}
        </button>
        <button className="secondary-action" onClick={onResident}>
          <Home size={20} />
          {t.residentSpace}
        </button>
        <button className="secondary-action" onClick={onExplorer}>
          <Globe2 size={20} />
          {t.explorePlatform}
        </button>
        <button className="secondary-action" onClick={() => onNavigate('documentsPublics')}>
          <FileText size={20} />
          {t.publicDocumentsCta}
        </button>
        <button className="secondary-action" onClick={onBureau}>
          <LockKeyhole size={20} />
          {t.bureauEntry}
        </button>
        <button className="secondary-action" onClick={onPresident}>
          <ShieldCheck size={20} />
          {t.presidentEntry}
        </button>
        <button className="secondary-action" onClick={onAbout}>
          <Info size={20} />
          {t.aboutCta}
        </button>
      </div>

      <div className="status-grid">
        <StatusItem icon={<Megaphone size={20} />} title={t.publicInfo} desc={t.publicInfoDesc} />
        <StatusItem icon={<LockKeyhole size={20} />} title={t.officialNotice} desc={t.officialNoticeDesc} />
        <StatusItem icon={<UserRound size={20} />} title={t.noDemo} desc={t.noPin} />
        <StatusItem icon={<Globe2 size={20} />} title={t.publicUrl} desc={siteConfig.publicUrl} />
        <StatusItem icon={<Phone size={20} />} title={t.officialEmail} desc={siteConfig.officialEmail} />
      </div>

      <footer>{t.footer} · <a href={`mailto:${siteConfig.officialEmail}`}>{siteConfig.officialEmail}</a></footer>
    </section>
  );
}
