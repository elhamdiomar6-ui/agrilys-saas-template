import { ArrowLeft, CheckCircle2, FolderKanban, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import CardListenButton from '../components/CardListenButton';
import { usePublicEditorialCopy } from '../lib/publicEditorialContent';
import { readProjects } from '../data/projects';
import type { ProjectCategory, ProjectPriority, ProjectState } from '../types/projects';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  date: string;
  progress: string;
  note: string;
  future: string;
  categories: Record<ProjectCategory, string>;
  states: Record<ProjectState, string>;
  priorities: Record<ProjectPriority, string>;
};

export const projetsCopy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Projets communautaires',
    intro: 'Suivi public simple des projets du douar, sans promesse exagérée ni données financières sensibles.',
    empty: 'Aucun projet publié pour le moment.',
    date: 'Date',
    progress: 'Avancement',
    note: 'Les projets affichés restent des informations générales validées. Aucun budget réel n est publié ici.',
    future: 'Suivi préparé pour la validation, les dépenses futures et l organisation des projets du douar.',
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
      normal: 'Priorité normale',
      important: 'Priorité importante',
      high: 'Priorité haute',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'المشاريع الجماعية',
    intro: 'تتبع عمومي بسيط لمشاريع الدوار بدون وعود مبالغ فيها وبدون معطيات مالية حساسة.',
    empty: 'لا يوجد أي مشروع منشور حاليا.',
    date: 'التاريخ',
    progress: 'نسبة التقدم',
    note: 'المشاريع المعروضة معلومات عامة مصادق عليها. لا يتم نشر أي ميزانية حقيقية هنا.',
    future: 'التتبع مهيأ للمصادقة وتتبع المصاريف مستقبلا وتنظيم مشاريع الدوار.',
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
      normal: 'أولوية عادية',
      important: 'أولوية مهمة',
      high: 'أولوية عالية',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

export default function ProjetsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = usePublicEditorialCopy('projets', projetsCopy)[lang];
  const projects = readProjects()
    .filter((project) => project.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="panel projects-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><FolderKanban size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="projets" pageId="projets" />

      <div className="projects-grid">
        {projects.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {projects.map((project) => {
          const progress = clampProgress(project.progress);
          return (
            <article className={`project-card ${project.state} ${project.priority}`} key={project.id}>
              <div className="project-topline"><span>{t.categories[project.category]}</span><strong>{t.states[project.state]}</strong></div>
              <h2>{lang === 'ar' ? project.titleAr : project.title}</h2>
              <p>{lang === 'ar' ? project.descriptionAr : project.description}</p>
              <AudioHelp scriptId={project.scriptId as any} pageId="projets" />
              <CardListenButton text={`${lang === 'ar' ? project.titleAr : project.title}. ${lang === 'ar' ? project.descriptionAr : project.description}`} lang={lang} />
              <div className="project-meta"><span>{t.date}: {formatDate(project.date, lang)}</span><span>{t.priorities[project.priority]}</span></div>
              <div className="project-progress"><div><span style={{ inlineSize: `${progress}%` }} /></div><strong>{t.progress}: {progress}%</strong></div>
            </article>
          );
        })}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
