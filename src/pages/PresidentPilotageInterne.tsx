import { ArrowLeft, Bell, CheckCircle2, ClipboardList, FileText, ShieldCheck, UsersRound } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { readAssociationRenewalItems } from '../data/associationRenewal';
import { readInternalContacts } from '../data/contactsAuthorities';
import { readAdministrativeProcedures, readInternalTasks, readMeetingDecisionRecords } from '../data/internalOperations';

type Lang = 'fr' | 'ar';

const copy = {
  fr: {
    back: 'Retour',
    title: 'Pilotage interne Président',
    intro: 'Vue rapide pour suivre le renouvellement, les tâches, contacts, démarches et réunions sans backend réel.',
    warning: "Vue provisoire locale. Ne pas saisir ou considérer ces données comme stockage sécurisé tant que l'authentification et Supabase Storage ne sont pas activés.",
    renewalUrgent: 'Documents renouvellement urgents',
    urgentTasks: 'Tâches urgentes',
    nextDeadlines: 'Prochaines échéances',
    importantContacts: 'Contacts importants',
    blockedProcedures: 'Démarches bloquées / en attente',
    pendingMeetings: 'PV en attente',
    internalAlerts: 'Alertes internes',
    none: 'Aucun point critique détecté dans les données locales.',
  },
  ar: {
    back: 'رجوع',
    title: 'قيادة داخلية للرئيس',
    intro: 'نظرة سريعة لتتبع التجديد والمهام والاتصالات والإجراءات والاجتماعات بدون backend حقيقي.',
    warning: 'نظرة محلية مؤقتة. لا تعتبر هذه المعطيات تخزينا آمنا قبل تفعيل المصادقة و Supabase Storage.',
    renewalUrgent: 'وثائق التجديد المستعجلة',
    urgentTasks: 'مهام مستعجلة',
    nextDeadlines: 'آجال قريبة',
    importantContacts: 'اتصالات مهمة',
    blockedProcedures: 'إجراءات متعثرة / في الانتظار',
    pendingMeetings: 'محاضر في الانتظار',
    internalAlerts: 'تنبيهات داخلية',
    none: 'لا يوجد عنصر حرج في المعطيات المحلية.',
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function PresidentPilotageInternePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const renewal = readAssociationRenewalItems();
  const contacts = readInternalContacts();
  const tasks = readInternalTasks();
  const procedures = readAdministrativeProcedures();
  const meetings = readMeetingDecisionRecords();

  const urgentRenewal = renewal.filter((item) => item.priority === 'urgent' || item.status === 'blocked').slice(0, 4);
  const urgentTasks = tasks.filter((item) => item.priority === 'urgent' || item.status === 'blocked').slice(0, 4);
  const deadlines = [...tasks.map((item) => ({ title: item.title, date: item.deadline })), ...procedures.map((item) => ({ title: item.title, date: item.plannedDate })), ...meetings.map((item) => ({ title: item.title, date: item.date }))]
    .filter((item) => item.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  const importantContacts = contacts.filter((item) => item.priority === 'urgent' || item.priority === 'high').slice(0, 4);
  const blockedProcedures = procedures.filter((item) => item.status === 'waiting' || item.status === 'rejected').slice(0, 4);
  const pendingMeetings = meetings.filter((item) => item.minuteStatus === 'to_write' || item.minuteStatus === 'in_progress').slice(0, 4);
  const alertCount = urgentRenewal.length + urgentTasks.length + blockedProcedures.length + pendingMeetings.length;

  const sections = [
    { title: t.renewalUrgent, icon: <FileText size={20} />, items: urgentRenewal.map((item) => `${item.title} - ${item.nextAction}`) },
    { title: t.urgentTasks, icon: <ClipboardList size={20} />, items: urgentTasks.map((item) => `${item.title} - ${item.nextAction}`) },
    { title: t.nextDeadlines, icon: <Bell size={20} />, items: deadlines.map((item) => `${formatDate(item.date, lang)} - ${item.title}`) },
    { title: t.importantContacts, icon: <UsersRound size={20} />, items: importantContacts.map((item) => `${item.name} - ${item.nextAction}`) },
    { title: t.blockedProcedures, icon: <ShieldCheck size={20} />, items: blockedProcedures.map((item) => `${item.title} - ${item.nextAction}`) },
    { title: t.pendingMeetings, icon: <CheckCircle2 size={20} />, items: pendingMeetings.map((item) => `${item.title} - ${item.actions}`) },
  ];

  return (
    <section className="panel president-steering-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="president-pilotage" />
      <p className="privacy-note internal-warning"><ShieldCheck size={18} /> {t.warning}</p>
      <div className="steering-alert">
        <Bell size={22} />
        <div><strong>{t.internalAlerts}</strong><span>{alertCount}</span></div>
      </div>
      <div className="steering-grid">
        {sections.map((section) => (
          <article className="steering-card" key={section.title}>
            <h2>{section.icon} {section.title}</h2>
            {section.items.length === 0 ? <p>{t.none}</p> : <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          </article>
        ))}
      </div>
    </section>
  );
}