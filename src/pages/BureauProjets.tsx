import { ArrowLeft, CheckCircle2, FolderKanban, Pencil, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readProjects, saveProjects } from '../data/projects';
import type { CommunityProject, ProjectCategory, ProjectPriority, ProjectState } from '../types/projects';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newProject: string;
  editProject: string;
  titleLabel: string;
  description: string;
  category: string;
  state: string;
  priority: string;
  date: string;
  progress: string;
  published: string;
  internalNote: string;
  save: string;
  cancel: string;
  edit: string;
  empty: string;
  required: string;
  protection: string;
  future: string;
  categories: Record<ProjectCategory, string>;
  states: Record<ProjectState, string>;
  priorities: Record<ProjectPriority, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - projets communautaires',
    intro: 'Gestion interne des projets du douar : publication, état, priorité et note de suivi.',
    newProject: 'Nouveau projet',
    editProject: 'Modifier le projet',
    titleLabel: 'Titre',
    description: 'Description courte',
    category: 'Catégorie',
    state: 'État',
    priority: 'Priorité',
    date: 'Date',
    progress: 'Avancement %',
    published: 'Publié dans /projets',
    internalNote: 'Note interne',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    empty: 'Aucun projet enregistré.',
    required: 'Titre, description et date sont obligatoires.',
    protection: 'Ne pas saisir de budget réel obligatoire, donnée bancaire ou promesse irréaliste.',
    future: 'Préparé pour suivi dépenses, workflow validation et organisation des projets du douar.',
    categories: {
      eau: 'Eau',
      agriculture: 'Agriculture',
      mosquee: 'Mosquée',
      routes: 'Routes',
      solidarite: 'Solidarité',
      patrimoine: 'Patrimoine',
      jeunesse: 'Jeunesse',
      environnement: 'Environnement',
      equipements: 'Équipements',
    },
    states: {
      idea: 'Idée',
      study: 'Étude',
      in_progress: 'En cours',
      completed: 'Terminé',
    },
    priorities: {
      normal: 'Normale',
      important: 'Importante',
      high: 'Haute',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المكتب - المشاريع الجماعية',
    intro: 'تدبير داخلي لمشاريع الدوار: النشر، الحالة، الأولوية وملاحظة التتبع.',
    newProject: 'مشروع جديد',
    editProject: 'تعديل المشروع',
    titleLabel: 'العنوان',
    description: 'وصف قصير',
    category: 'الصنف',
    state: 'الحالة',
    priority: 'الأولوية',
    date: 'التاريخ',
    progress: 'نسبة التقدم %',
    published: 'منشور في /projets',
    internalNote: 'ملاحظة داخلية',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    empty: 'لا يوجد أي مشروع مسجل.',
    required: 'العنوان والوصف والتاريخ ضرورية.',
    protection: 'لا تدخل ميزانية حقيقية إلزامية أو معطيات بنكية أو وعودا غير واقعية.',
    future: 'مهيأ لتتبع المصاريف ومسار المصادقة وتنظيم مشاريع الدوار.',
    categories: {
      eau: 'الماء',
      agriculture: 'الفلاحة',
      mosquee: 'المسجد',
      routes: 'الطرق',
      solidarite: 'التضامن',
      patrimoine: 'التراث',
      jeunesse: 'الشباب',
      environnement: 'البيئة',
      equipements: 'التجهيزات',
    },
    states: {
      idea: 'فكرة',
      study: 'دراسة',
      in_progress: 'في الإنجاز',
      completed: 'مكتمل',
    },
    priorities: {
      normal: 'عادية',
      important: 'مهمة',
      high: 'عالية',
    },
  },
};

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  title: '',
  description: '',
  category: 'eau' as ProjectCategory,
  state: 'idea' as ProjectState,
  priority: 'normal' as ProjectPriority,
  date: today,
  progress: 0,
  published: false,
  internalNote: '',
};

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauProjetsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [projects, setProjects] = useState<CommunityProject[]>(readProjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...projects].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [projects]);

  const persist = (next: CommunityProject[]) => {
    setProjects(next);
    saveProjects(next);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.date) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    const payload = { ...form, title: form.title.trim(), description: form.description.trim(), internalNote: form.internalNote.trim(), progress: clampProgress(form.progress), titleAr: '', descriptionAr: '', scriptId: 'projects-init' };
    if (editingId) {
      persist(projects.map((project) => project.id === editingId ? { ...project, ...payload, updatedAt: now } : project));
    } else {
      persist([{ id: `PRO-${Date.now()}`, ...payload, createdAt: now, updatedAt: now }, ...projects]);
    }
    reset();
  };

  const edit = (project: CommunityProject) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      category: project.category,
      state: project.state,
      priority: project.priority,
      date: project.date,
      progress: project.progress,
      published: project.published,
      internalNote: project.internalNote,
    });
    setError('');
  };

  return (
    <section className="panel projects-page bureau-projects-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><FolderKanban size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-projets" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>

      <form className="projects-form" onSubmit={submit}>
        <h2>{editingId ? t.editProject : t.newProject}</h2>
        <label className="field"><span>{t.titleLabel}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label className="field"><span>{t.description}</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="projects-form-grid">
          <label className="field"><span>{t.category}</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProjectCategory })}>{Object.entries(t.categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.state}</span><select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value as ProjectState })}>{Object.entries(t.states).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="projects-form-grid">
          <label className="field"><span>{t.priority}</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as ProjectPriority })}>{Object.entries(t.priorities).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.date}</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.progress}</span><input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })} /></label>
        <label className="field"><span>{t.internalNote}</span><textarea rows={3} value={form.internalNote} onChange={(event) => setForm({ ...form, internalNote: event.target.value })} /></label>
        <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span>{t.published}</span></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}><RotateCcw size={18} /> {t.cancel}</button> : null}
        </div>
      </form>

      <div className="projects-grid">
        {sorted.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {sorted.map((project) => {
          const progress = clampProgress(project.progress);
          return (
            <article className={`project-card ${project.state} ${project.priority}`} key={project.id}>
              <div className="project-topline"><span>{t.categories[project.category]}</span><strong>{t.states[project.state]}</strong></div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className="project-meta"><span>{formatDate(project.date, lang)}</span><span>{t.priorities[project.priority]}</span></div>
              <div className="project-progress"><div><span style={{ inlineSize: `${progress}%` }} /></div><strong>{progress}%</strong></div>
              {project.internalNote ? <p className="project-note">{project.internalNote}</p> : null}
              <div className="bureau-actions"><button type="button" onClick={() => edit(project)}><Pencil size={18} /> {t.edit}</button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
