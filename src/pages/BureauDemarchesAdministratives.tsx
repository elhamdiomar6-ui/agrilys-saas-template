import { siteConfig } from '../config/site';
import { readAdministrativeProcedures, saveAdministrativeProcedures } from '../data/internalOperations';
import type { AdministrativeProcedure } from '../types/internalOperations';
import InternalOperationsWorkspace, { WorkspaceField, WorkspaceFilter, WorkspaceOption } from './InternalOperationsWorkspace';

type Lang = 'fr' | 'ar';

const priorities: WorkspaceOption[] = [
  { value: 'low', label: { fr: 'Faible', ar: 'ضعيفة' } },
  { value: 'medium', label: { fr: 'Moyenne', ar: 'متوسطة' } },
  { value: 'high', label: { fr: 'Forte', ar: 'قوية' } },
  { value: 'urgent', label: { fr: 'Urgente', ar: 'مستعجلة' } },
];

const types: WorkspaceOption[] = [
  { value: 'letter', label: { fr: 'Courrier', ar: 'مراسلة' } },
  { value: 'request', label: { fr: 'Demande', ar: 'طلب' } },
  { value: 'deposit', label: { fr: 'Dépôt', ar: 'إيداع' } },
  { value: 'appointment', label: { fr: 'Rendez-vous', ar: 'موعد' } },
  { value: 'follow_up', label: { fr: 'Suivi', ar: 'تتبع' } },
  { value: 'response', label: { fr: 'Réponse', ar: 'جواب' } },
];

const statuses: WorkspaceOption[] = [
  { value: 'to_prepare', label: { fr: 'À préparer', ar: 'للتحضير' } },
  { value: 'sent', label: { fr: 'Envoyé', ar: 'مرسل' } },
  { value: 'deposited', label: { fr: 'Déposé', ar: 'مودع' } },
  { value: 'waiting', label: { fr: 'En attente', ar: 'في الانتظار' } },
  { value: 'validated', label: { fr: 'Validé', ar: 'مصادق عليه' } },
  { value: 'rejected', label: { fr: 'Rejeté', ar: 'مرفوض' } },
];

const fields: WorkspaceField[] = [
  { key: 'title', label: { fr: 'Titre démarche', ar: 'عنوان الإجراء' }, required: true },
  { key: 'organization', label: { fr: 'Organisme concerné', ar: 'المؤسسة المعنية' }, required: true },
  { key: 'linkedContact', label: { fr: 'Contact lié', ar: 'جهة الاتصال المرتبطة' } },
  { key: 'type', label: { fr: 'Type', ar: 'النوع' }, type: 'select', options: types, required: true },
  { key: 'status', label: { fr: 'Statut', ar: 'الحالة' }, type: 'select', options: statuses, required: true },
  { key: 'plannedDate', label: { fr: 'Date prévue', ar: 'التاريخ المتوقع' }, type: 'date' },
  { key: 'sentOrDepositDate', label: { fr: 'Date dépôt/envoi', ar: 'تاريخ الإيداع/الإرسال' }, type: 'date' },
  { key: 'nextAction', label: { fr: 'Prochaine action', ar: 'الإجراء المقبل' }, type: 'textarea', rows: 3, required: true },
  { key: 'responsible', label: { fr: 'Responsable', ar: 'المسؤول' }, required: true },
  { key: 'priority', label: { fr: 'Priorité', ar: 'الأولوية' }, type: 'select', options: priorities, required: true },
  { key: 'internalReference', label: { fr: 'Référence interne', ar: 'مرجع داخلي' } },
  { key: 'physicalLocation', label: { fr: 'Emplacement réel du document', ar: 'مكان الوثيقة الحقيقي' } },
  { key: 'notes', label: { fr: 'Notes', ar: 'ملاحظات' }, type: 'textarea', rows: 3 },
];

const filters: WorkspaceFilter[] = [
  { key: 'status', label: { fr: 'Statut', ar: 'الحالة' }, allLabel: { fr: 'Tous les statuts', ar: 'كل الحالات' }, options: statuses },
  { key: 'type', label: { fr: 'Type', ar: 'النوع' }, allLabel: { fr: 'Tous les types', ar: 'كل الأنواع' }, options: types },
  { key: 'priority', label: { fr: 'Priorité', ar: 'الأولوية' }, allLabel: { fr: 'Toutes les priorités', ar: 'كل الأولويات' }, options: priorities },
];

const emptyProcedure: Omit<AdministrativeProcedure, 'id' | 'updatedAt'> = {
  title: '',
  organization: '',
  linkedContact: '',
  type: 'request',
  status: 'to_prepare',
  plannedDate: new Date().toISOString().slice(0, 10),
  sentOrDepositDate: '',
  nextAction: '',
  responsible: '',
  priority: 'medium',
  internalReference: '',
  physicalLocation: '',
  notes: '',
};

export default function BureauDemarchesAdministrativesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  return <InternalOperationsWorkspace<AdministrativeProcedure>
    lang={lang}
    onBack={onBack}
    title={{ fr: 'Courriers & démarches administratives', ar: 'المراسلات والإجراءات الإدارية' }}
    intro={{ fr: 'Suivi interne des courriers, dépôts et rendez-vous liés au renouvellement, sans upload réel.', ar: 'تتبع داخلي للمراسلات والإيداعات والمواعيد بدون رفع وثائق حقيقية.' }}
    newLabel={{ fr: 'Ajouter une démarche', ar: 'إضافة إجراء' }}
    editLabel={{ fr: 'Modifier la démarche', ar: 'تعديل الإجراء' }}
    emptyLabel={{ fr: 'Aucune démarche trouvée.', ar: 'لا يوجد إجراء مطابق.' }}
    requiredMessage={{ fr: 'Titre, organisme, type, statut, responsable, priorité et prochaine action sont obligatoires.', ar: 'العنوان والمؤسسة والنوع والحالة والمسؤول والأولوية والإجراء المقبل ضرورية.' }}
    confirmDelete={{ fr: 'Supprimer cette démarche temporaire ? Aucun courrier réel ne sera supprimé.', ar: 'هل تريد حذف هذا الإجراء المؤقت؟ لن يتم حذف أي وثيقة حقيقية.' }}
    scriptId="bureau-demarches"
    filenameBase={`${siteConfig.slug}-demarches-administratives`}
    idPrefix="PROC"
    fields={fields}
    filters={filters}
    primaryKey="title"
    subtitleKeys={['type', 'plannedDate']}
    metaKeys={['priority', 'status', 'organization', 'nextAction']}
    searchableKeys={['title', 'organization', 'linkedContact', 'nextAction', 'responsible', 'internalReference', 'physicalLocation', 'notes']}
    initialForm={emptyProcedure}
    readItems={readAdministrativeProcedures}
    saveItems={saveAdministrativeProcedures}
  />;
}