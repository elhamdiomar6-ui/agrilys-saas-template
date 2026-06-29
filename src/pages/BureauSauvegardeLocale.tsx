import { siteConfig } from '../config/site';
import { ArrowLeft, Download, ShieldCheck, Trash2 } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { associationRenewalStorageKey, initialAssociationRenewalItems } from '../data/associationRenewal';
import { contactsAuthoritiesStorageKey, initialInternalContacts } from '../data/contactsAuthorities';
import { administrativeProceduresStorageKey, fieldCollectionStorageKey, initialAdministrativeProcedures, initialFieldCollectionItems, initialInternalTasks, initialMeetingDecisionRecords, internalTasksStorageKey, meetingDecisionRecordsStorageKey } from '../data/internalOperations';

type Lang = 'fr' | 'ar';

type BackupSource = {
  key: string;
  filename: string;
  label: Record<Lang, string>;
  fallback: unknown[];
};

const sources: BackupSource[] = [
  { key: associationRenewalStorageKey, filename: 'renouvellement', label: { fr: 'Renouvellement association', ar: 'تجديد الجمعية' }, fallback: initialAssociationRenewalItems },
  { key: contactsAuthoritiesStorageKey, filename: 'contacts-autorites', label: { fr: 'Contacts & autorités', ar: 'الاتصالات والسلطات' }, fallback: initialInternalContacts },
  { key: fieldCollectionStorageKey, filename: 'collecte-terrain', label: { fr: 'Collecte terrain', ar: 'جمع معلومات الميدان' }, fallback: initialFieldCollectionItems },
  { key: internalTasksStorageKey, filename: 'taches-internes', label: { fr: 'Tâches internes', ar: 'المهام الداخلية' }, fallback: initialInternalTasks },
  { key: administrativeProceduresStorageKey, filename: 'demarches-administratives', label: { fr: 'Démarches administratives', ar: 'الإجراءات الإدارية' }, fallback: initialAdministrativeProcedures },
  { key: meetingDecisionRecordsStorageKey, filename: 'reunions-pv-decisions', label: { fr: 'Réunions, PV et décisions', ar: 'الاجتماعات والمحاضر والقرارات' }, fallback: initialMeetingDecisionRecords },
];

const copy = {
  fr: {
    back: 'Retour',
    title: 'Sauvegarde locale provisoire',
    intro: 'Exporter les données localStorage non sensibles des espaces internes. Cette sauvegarde ne remplace pas un stockage sécurisé.',
    warning: 'Sauvegarde provisoire. Ne pas utiliser pour stocker des documents sensibles, CIN, signatures, scans ou vidéos.',
    exportGlobal: 'Export global JSON',
    clearTests: 'Vider données test',
    clearConfirmOne: 'Première confirmation : vider les données locales de test non sensibles ?',
    clearConfirmTwo: 'Deuxième confirmation : cette action efface uniquement le localStorage de ces modules sur cet appareil.',
    exported: 'Exporter',
    count: 'élément(s)',
  },
  ar: {
    back: 'رجوع',
    title: 'نسخ احتياطي محلي مؤقت',
    intro: 'تصدير معطيات localStorage غير الحساسة للفضاءات الداخلية. هذا لا يعوض التخزين الآمن.',
    warning: 'نسخ مؤقت. لا تستعمله لتخزين وثائق حساسة أو بطاقات أو توقيعات أو نسخ ممسوحة أو فيديوهات.',
    exportGlobal: 'تصدير شامل JSON',
    clearTests: 'مسح معطيات الاختبار',
    clearConfirmOne: 'تأكيد أول: هل تريد مسح معطيات الاختبار المحلية غير الحساسة؟',
    clearConfirmTwo: 'تأكيد ثان: هذا يمسح فقط localStorage لهذه الوحدات على هذا الجهاز.',
    exported: 'تصدير',
    count: 'عنصر',
  },
};

function readSource(source: BackupSource) {
  if (typeof window === 'undefined') return source.fallback;
  try {
    const raw = window.localStorage.getItem(source.key);
    if (!raw) return source.fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : source.fallback;
  } catch {
    return source.fallback;
  }
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function BureauSauvegardeLocalePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];

  const exportSource = (source: BackupSource) => {
    downloadText(`${siteConfig.slug}-${source.filename}.json`, JSON.stringify(readSource(source), null, 2), 'application/json;charset=utf-8');
  };

  const exportGlobal = () => {
    const payload = Object.fromEntries(sources.map((source) => [source.filename, readSource(source)]));
    downloadText(`${siteConfig.slug}-sauvegarde-locale-globale.json`, JSON.stringify({ exportedAt: new Date().toISOString(), payload }, null, 2), 'application/json;charset=utf-8');
  };

  const clearTestData = () => {
    if (!window.confirm(t.clearConfirmOne)) return;
    if (!window.confirm(t.clearConfirmTwo)) return;
    sources.forEach((source) => window.localStorage.removeItem(source.key));
    window.location.reload();
  };

  return (
    <section className="panel backup-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-sauvegarde" />
      <p className="privacy-note internal-warning"><ShieldCheck size={18} /> {t.warning}</p>
      <div className="backup-actions-main">
        <button type="button" onClick={exportGlobal}><Download size={18} /> {t.exportGlobal}</button>
        <button type="button" className="danger-action" onClick={clearTestData}><Trash2 size={18} /> {t.clearTests}</button>
      </div>
      <div className="backup-list">
        {sources.map((source) => {
          const count = readSource(source).length;
          return (
            <article className="backup-card" key={source.key}>
              <h2>{source.label[lang]}</h2>
              <p>{count} {t.count}</p>
              <button type="button" className="secondary-inline" onClick={() => exportSource(source)}><Download size={18} /> {t.exported}</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
