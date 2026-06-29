import { readMeetingDecisionRecords, saveMeetingDecisionRecords } from '../data/internalOperations';
import type { MeetingDecisionRecord } from '../types/internalOperations';
import InternalOperationsWorkspace, { WorkspaceField, WorkspaceFilter, WorkspaceOption } from './InternalOperationsWorkspace';

type Lang = 'fr' | 'ar';

const minuteStatuses: WorkspaceOption[] = [
  { value: 'to_write', label: { fr: 'À rédiger', ar: 'للتحرير' } },
  { value: 'in_progress', label: { fr: 'En cours', ar: 'قيد الإنجاز' } },
  { value: 'ready', label: { fr: 'Prêt', ar: 'جاهز' } },
  { value: 'signed', label: { fr: 'Signé', ar: 'موقع' } },
  { value: 'archived', label: { fr: 'Archivé', ar: 'مؤرشف' } },
];

const fields: WorkspaceField[] = [
  { key: 'title', label: { fr: 'Réunion', ar: 'الاجتماع' }, required: true },
  { key: 'date', label: { fr: 'Date', ar: 'التاريخ' }, type: 'date', required: true },
  { key: 'place', label: { fr: 'Lieu', ar: 'المكان' }, required: true },
  { key: 'purpose', label: { fr: 'Objet', ar: 'الموضوع' }, type: 'textarea', rows: 3, required: true },
  { key: 'participants', label: { fr: 'Participants', ar: 'المشاركون' }, type: 'textarea', rows: 3 },
  { key: 'decisions', label: { fr: 'Décisions', ar: 'القرارات' }, type: 'textarea', rows: 3 },
  { key: 'actions', label: { fr: 'Actions à faire', ar: 'الأعمال المطلوبة' }, type: 'textarea', rows: 3, required: true },
  { key: 'responsible', label: { fr: 'Responsable', ar: 'المسؤول' }, required: true },
  { key: 'minuteStatus', label: { fr: 'Statut PV', ar: 'حالة المحضر' }, type: 'select', options: minuteStatuses, required: true },
  { key: 'physicalLocation', label: { fr: 'Emplacement réel du PV', ar: 'مكان المحضر الحقيقي' } },
  { key: 'notes', label: { fr: 'Notes', ar: 'ملاحظات' }, type: 'textarea', rows: 3 },
];

const filters: WorkspaceFilter[] = [
  { key: 'minuteStatus', label: { fr: 'Statut PV', ar: 'حالة المحضر' }, allLabel: { fr: 'Tous les statuts PV', ar: 'كل حالات المحضر' }, options: minuteStatuses },
];

const emptyRecord: Omit<MeetingDecisionRecord, 'id' | 'updatedAt'> = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  place: '',
  purpose: '',
  participants: '',
  decisions: '',
  actions: '',
  responsible: '',
  minuteStatus: 'to_write',
  physicalLocation: '',
  notes: '',
};

export default function BureauReunionsDecisionsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  return <InternalOperationsWorkspace<MeetingDecisionRecord>
    lang={lang}
    onBack={onBack}
    title={{ fr: 'Réunions, PV et décisions', ar: 'الاجتماعات والمحاضر والقرارات' }}
    intro={{ fr: 'Suivi interne des réunions, décisions et PV sans signatures ni documents sensibles.', ar: 'تتبع داخلي للاجتماعات والقرارات والمحاضر بدون توقيعات أو وثائق حساسة.' }}
    newLabel={{ fr: 'Ajouter une réunion', ar: 'إضافة اجتماع' }}
    editLabel={{ fr: 'Modifier la réunion', ar: 'تعديل الاجتماع' }}
    emptyLabel={{ fr: 'Aucune réunion trouvée.', ar: 'لا يوجد اجتماع مطابق.' }}
    requiredMessage={{ fr: 'Réunion, date, lieu, objet, actions, responsable et statut PV sont obligatoires.', ar: 'الاجتماع والتاريخ والمكان والموضوع والأعمال والمسؤول وحالة المحضر ضرورية.' }}
    confirmDelete={{ fr: 'Supprimer cette réunion temporaire ? Aucun PV réel ne sera supprimé.', ar: 'هل تريد حذف هذا الاجتماع المؤقت؟ لن يتم حذف أي محضر حقيقي.' }}
    scriptId="bureau-reunions"
    filenameBase="agadirnetguida-reunions-pv-decisions"
    idPrefix="MEET"
    fields={fields}
    filters={filters}
    primaryKey="title"
    subtitleKeys={['date', 'place']}
    metaKeys={['minuteStatus', 'responsible', 'actions', 'physicalLocation']}
    searchableKeys={['title', 'place', 'purpose', 'participants', 'decisions', 'actions', 'responsible', 'physicalLocation', 'notes']}
    initialForm={emptyRecord}
    readItems={readMeetingDecisionRecords}
    saveItems={saveMeetingDecisionRecords}
  />;
}