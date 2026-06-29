import { ArrowLeft, CheckCircle2, ClipboardList, Clock3, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readWorkflows, saveWorkflows } from '../data/workflows';
import type { ValidationWorkflow, WorkflowStatus } from '../types/workflows';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  search: string;
  filterAll: string;
  empty: string;
  createdAt: string;
  updatedAt: string;
  requester: string;
  internalNote: string;
  finalDecision: string;
  saveNote: string;
  statusLabel: string;
  history: string;
  humanOnly: string;
  future: string;
  sourceRegistration: string;
  sourceManual: string;
  statuses: Record<WorkflowStatus, string>;
  historyLabels: Record<WorkflowStatus, string>;
};

const statusOrder: WorkflowStatus[] = ['draft', 'sent', 'pending', 'under_review', 'accepted', 'rejected', 'archived'];

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Workflow validation complet',
    intro: 'Espace interne pour suivre les demandes, leur statut, les notes et les décisions humaines du bureau ou du président.',
    search: 'Rechercher une demande',
    filterAll: 'Tous les statuts',
    empty: 'Aucune demande trouvée pour le moment.',
    createdAt: 'Créée le',
    updatedAt: 'Dernière modification',
    requester: 'Demandeur',
    internalNote: 'Note interne',
    finalDecision: 'Décision finale',
    saveNote: 'Enregistrer note et décision',
    statusLabel: 'Statut',
    history: 'Timeline de traitement',
    humanOnly: 'Aucune validation automatique. Aucune IA automatique. Chaque décision reste humaine et traçable.',
    future: 'Architecture préparée pour notifications, signatures, audit trail et permissions avancées.',
    sourceRegistration: 'Inscription',
    sourceManual: 'Demande interne',
    statuses: {
      draft: 'Brouillon',
      sent: 'Envoyé',
      pending: 'En attente',
      under_review: 'En cours d’étude',
      accepted: 'Accepté',
      rejected: 'Refusé',
      archived: 'Archivé',
    },
    historyLabels: {
      draft: 'Statut passé en brouillon',
      sent: 'Demande envoyée',
      pending: 'Demande en attente',
      under_review: 'Étude ouverte par le bureau',
      accepted: 'Décision humaine : accepté',
      rejected: 'Décision humaine : refusé',
      archived: 'Demande archivée',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'مسار المصادقة الكامل',
    intro: 'فضاء داخلي لتتبع الطلبات وحالتها والملاحظات والقرارات البشرية للمكتب أو الرئيس.',
    search: 'البحث عن طلب',
    filterAll: 'كل الحالات',
    empty: 'لا توجد أي طلبات حاليا.',
    createdAt: 'تاريخ الإنشاء',
    updatedAt: 'آخر تعديل',
    requester: 'صاحب الطلب',
    internalNote: 'ملاحظة داخلية',
    finalDecision: 'القرار النهائي',
    saveNote: 'حفظ الملاحظة والقرار',
    statusLabel: 'الحالة',
    history: 'تسلسل المعالجة',
    humanOnly: 'لا توجد مصادقة تلقائية ولا ذكاء اصطناعي تلقائي. كل قرار يبقى بشريا وقابلا للتتبع.',
    future: 'البنية مهيأة للإشعارات والتوقيعات وسجل التدقيق والصلاحيات المتقدمة.',
    sourceRegistration: 'تسجيل',
    sourceManual: 'طلب داخلي',
    statuses: {
      draft: 'مسودة',
      sent: 'مرسل',
      pending: 'في الانتظار',
      under_review: 'قيد الدراسة',
      accepted: 'مقبول',
      rejected: 'مرفوض',
      archived: 'مؤرشف',
    },
    historyLabels: {
      draft: 'تم تحويل الحالة إلى مسودة',
      sent: 'تم إرسال الطلب',
      pending: 'الطلب في الانتظار',
      under_review: 'فتح المكتب دراسة الطلب',
      accepted: 'قرار بشري: مقبول',
      rejected: 'قرار بشري: مرفوض',
      archived: 'تم أرشفة الطلب',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function BureauWorkflowsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [workflows, setWorkflows] = useState<ValidationWorkflow[]>(readWorkflows);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkflowStatus>('all');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...workflows]
      .filter((workflow) => statusFilter === 'all' || workflow.status === statusFilter)
      .filter((workflow) => {
        if (!normalizedQuery) return true;
        return `${workflow.title} ${workflow.requesterName}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [workflows, query, statusFilter]);

  const persist = (nextWorkflows: ValidationWorkflow[]) => {
    setWorkflows(nextWorkflows);
    saveWorkflows(nextWorkflows);
  };

  const updateStatus = (id: string, status: WorkflowStatus) => {
    const now = new Date().toISOString();
    persist(workflows.map((workflow) => {
      if (workflow.id !== id) return workflow;
      return {
        ...workflow,
        status,
        updatedAt: now,
        history: [
          ...workflow.history,
          {
            id: `ACT-${Date.now()}`,
            status,
            label: t.historyLabels[status],
            at: now,
            by: status === 'accepted' || status === 'rejected' ? 'president' : 'bureau',
          },
        ],
      };
    }));
  };

  const updateText = (id: string, field: 'internalNote' | 'finalDecision', value: string) => {
    setWorkflows(workflows.map((workflow) => workflow.id === id ? { ...workflow, [field]: value } : workflow));
  };

  const saveDecision = (id: string) => {
    const now = new Date().toISOString();
    persist(workflows.map((workflow) => {
      if (workflow.id !== id) return workflow;
      return {
        ...workflow,
        updatedAt: now,
        history: [
          ...workflow.history,
          {
            id: `ACT-${Date.now()}`,
            status: workflow.status,
            label: lang === 'ar' ? 'تم تحديث الملاحظة أو القرار' : 'Note ou décision mise à jour',
            at: now,
            by: 'bureau',
          },
        ],
      };
    }));
  };

  return (
    <section className="panel workflows-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><ClipboardList size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-workflows" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.humanOnly}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <div className="workflow-filters">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="field"><span>{t.statusLabel}</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | WorkflowStatus)}><option value="all">{t.filterAll}</option>{statusOrder.map((status) => <option value={status} key={status}>{t.statuses[status]}</option>)}</select></label>
      </div>

      <div className="workflow-list">
        {filtered.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filtered.map((workflow) => (
          <article className={`workflow-card ${workflow.status}`} key={workflow.id}>
            <div className="workflow-card-topline">
              <span>{workflow.source === 'registration' ? t.sourceRegistration : t.sourceManual}</span>
              <strong>{t.statuses[workflow.status]}</strong>
            </div>
            <h2>{workflow.title}</h2>
            <p>{t.requester}: {workflow.requesterName || '-'}</p>
            <p>{t.createdAt}: {formatDate(workflow.createdAt, lang)}</p>
            <p>{t.updatedAt}: {formatDate(workflow.updatedAt, lang)}</p>

            <div className="workflow-controls">
              <label className="field"><span>{t.statusLabel}</span><select value={workflow.status} onChange={(event) => updateStatus(workflow.id, event.target.value as WorkflowStatus)}>{statusOrder.map((status) => <option value={status} key={status}>{t.statuses[status]}</option>)}</select></label>
              <label className="field"><span>{t.internalNote}</span><textarea rows={3} value={workflow.internalNote} onChange={(event) => updateText(workflow.id, 'internalNote', event.target.value)} /></label>
              <label className="field"><span>{t.finalDecision}</span><textarea rows={3} value={workflow.finalDecision} onChange={(event) => updateText(workflow.id, 'finalDecision', event.target.value)} /></label>
              <button type="button" onClick={() => saveDecision(workflow.id)}>{t.saveNote}</button>
            </div>

            <div className="workflow-timeline">
              <h3><Clock3 size={16} /> {t.history}</h3>
              {workflow.history.map((action) => (
                <div className={`workflow-step ${action.status}`} key={action.id}>
                  <span>{formatDate(action.at, lang)}</span>
                  <strong>{action.label}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
