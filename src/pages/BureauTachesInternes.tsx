import { readInternalTasks, saveInternalTasks } from '../data/internalOperations';
import type { InternalTask } from '../types/internalOperations';
import InternalOperationsWorkspace, { WorkspaceField, WorkspaceFilter, WorkspaceOption } from './InternalOperationsWorkspace';

type Lang = 'fr' | 'ar';

const priorities: WorkspaceOption[] = [
  { value: 'low', label: { fr: 'Faible', ar: 'ضعيفة' } },
  { value: 'medium', label: { fr: 'Moyenne', ar: 'متوسطة' } },
  { value: 'high', label: { fr: 'Forte', ar: 'قوية' } },
  { value: 'urgent', label: { fr: 'Urgente', ar: 'مستعجلة' } },
];

const statuses: WorkspaceOption[] = [
  { value: 'todo', label: { fr: 'À faire', ar: 'للإنجاز' } },
  { value: 'in_progress', label: { fr: 'En cours', ar: 'قيد الإنجاز' } },
  { value: 'blocked', label: { fr: 'Bloqué', ar: 'متعثر' } },
  { value: 'done', label: { fr: 'Terminé', ar: 'منجز' } },
];

const categories: WorkspaceOption[] = [
  { value: 'renewal', label: { fr: 'Renouvellement', ar: 'تجديد الجمعية' } },
  { value: 'documents', label: { fr: 'Documents', ar: 'الوثائق' } },
  { value: 'contacts', label: { fr: 'Contacts', ar: 'الاتصالات' } },
  { value: 'meeting', label: { fr: 'Réunion', ar: 'اجتماع' } },
  { value: 'authority', label: { fr: 'Autorité', ar: 'السلطة' } },
  { value: 'other', label: { fr: 'Autre', ar: 'آخر' } },
];

const fields: WorkspaceField[] = [
  { key: 'title', label: { fr: 'Titre', ar: 'العنوان' }, required: true },
  { key: 'description', label: { fr: 'Description', ar: 'الوصف' }, type: 'textarea', rows: 3 },
  { key: 'responsible', label: { fr: 'Responsable', ar: 'المسؤول' }, required: true },
  { key: 'priority', label: { fr: 'Priorité', ar: 'الأولوية' }, type: 'select', options: priorities, required: true },
  { key: 'status', label: { fr: 'Statut', ar: 'الحالة' }, type: 'select', options: statuses, required: true },
  { key: 'deadline', label: { fr: 'Date limite', ar: 'آخر أجل' }, type: 'date' },
  { key: 'category', label: { fr: 'Catégorie', ar: 'الصنف' }, type: 'select', options: categories, required: true },
  { key: 'nextAction', label: { fr: 'Prochaine action', ar: 'الإجراء المقبل' }, type: 'textarea', rows: 3, required: true },
  { key: 'notes', label: { fr: 'Notes', ar: 'ملاحظات' }, type: 'textarea', rows: 3 },
];

const filters: WorkspaceFilter[] = [
  { key: 'status', label: { fr: 'Statut', ar: 'الحالة' }, allLabel: { fr: 'Tous les statuts', ar: 'كل الحالات' }, options: statuses },
  { key: 'priority', label: { fr: 'Priorité', ar: 'الأولوية' }, allLabel: { fr: 'Toutes les priorités', ar: 'كل الأولويات' }, options: priorities },
  { key: 'category', label: { fr: 'Catégorie', ar: 'الصنف' }, allLabel: { fr: 'Toutes les catégories', ar: 'كل الأصناف' }, options: categories },
];

const emptyTask: Omit<InternalTask, 'id' | 'updatedAt'> = {
  title: '',
  description: '',
  responsible: '',
  priority: 'medium',
  status: 'todo',
  deadline: new Date().toISOString().slice(0, 10),
  category: 'renewal',
  nextAction: '',
  notes: '',
};

export default function BureauTachesInternesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  return <InternalOperationsWorkspace<InternalTask>
    lang={lang}
    onBack={onBack}
    title={{ fr: 'Tâches & échéances internes', ar: 'المهام والآجال الداخلية' }}
    intro={{ fr: 'Espace mobile pour suivre les tâches urgentes du renouvellement, sans documents sensibles.', ar: 'فضاء للهاتف لتتبع مهام التجديد بدون وثائق حساسة.' }}
    newLabel={{ fr: 'Ajouter une tâche', ar: 'إضافة مهمة' }}
    editLabel={{ fr: 'Modifier la tâche', ar: 'تعديل المهمة' }}
    emptyLabel={{ fr: 'Aucune tâche trouvée.', ar: 'لا توجد مهمة مطابقة.' }}
    requiredMessage={{ fr: 'Titre, responsable, statut, priorité, catégorie et prochaine action sont obligatoires.', ar: 'العنوان والمسؤول والحالة والأولوية والصنف والإجراء المقبل ضرورية.' }}
    confirmDelete={{ fr: 'Supprimer cette tâche temporaire ?', ar: 'هل تريد حذف هذه المهمة المؤقتة؟' }}
    scriptId="bureau-taches"
    filenameBase="agadirnetguida-taches-internes"
    idPrefix="TASK"
    fields={fields}
    filters={filters}
    primaryKey="title"
    subtitleKeys={['category', 'deadline']}
    metaKeys={['priority', 'status', 'responsible', 'nextAction']}
    searchableKeys={['title', 'description', 'responsible', 'nextAction', 'notes']}
    initialForm={emptyTask}
    readItems={readInternalTasks}
    saveItems={saveInternalTasks}
  />;
}