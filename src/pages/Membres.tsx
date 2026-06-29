import { ArrowLeft, CheckCircle2, ShieldCheck, UsersRound } from 'lucide-react';
import CardListenButton from '../components/CardListenButton';
import { readMembers } from '../data/members';
import type { MemberRole, MemberState } from '../types/members';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  total: string;
  active: string;
  pending: string;
  suspended: string;
  registeredAt: string;
  note: string;
  future: string;
  roles: Record<MemberRole, string>;
  states: Record<MemberState, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Gestion membres',
    intro: 'Vue interne simple pour préparer la future organisation des membres de l association, sans authentification réelle pour l instant.',
    empty: 'Aucun membre enregistré pour le moment.',
    total: 'Total membres',
    active: 'Actifs',
    pending: 'En attente',
    suspended: 'Suspendus',
    registeredAt: 'Inscription',
    note: 'Aucun CIN, aucun email obligatoire et aucune donnée sensible ne sont utilisés dans cette version temporaire.',
    future: 'Architecture préparée pour auth réelle, permissions et gestion interne des membres du douar.',
    roles: {
      habitant: 'Habitant',
      adherent: 'Adhérent',
      soutien: 'Soutien',
      bureau: 'Bureau',
      president: 'Président',
    },
    states: {
      active: 'Actif',
      pending: 'En attente',
      suspended: 'Suspendu',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'تدبير الأعضاء',
    intro: 'واجهة داخلية بسيطة للتحضير للتنظيم المستقبلي لأعضاء الجمعية، بدون مصادقة حقيقية حاليا.',
    empty: 'لا يوجد أي عضو مسجل حاليا.',
    total: 'مجموع الأعضاء',
    active: 'نشطون',
    pending: 'في الانتظار',
    suspended: 'موقوفون',
    registeredAt: 'تاريخ التسجيل',
    note: 'لا يتم استعمال رقم البطاقة الوطنية أو بريد إلزامي أو أي معطيات حساسة في هذه النسخة المؤقتة.',
    future: 'البنية مهيأة مستقبلا للمصادقة الحقيقية والصلاحيات والتدبير الداخلي لأعضاء الدوار.',
    roles: {
      habitant: 'ساكن',
      adherent: 'منخرط',
      soutien: 'داعم',
      bureau: 'المكتب',
      president: 'الرئيس',
    },
    states: {
      active: 'نشط',
      pending: 'في الانتظار',
      suspended: 'موقوف',
    },
  },
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function MembresPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const members = readMembers().sort((a, b) => a.fullName.localeCompare(b.fullName));
  const active = members.filter((member) => member.state === 'active').length;
  const pending = members.filter((member) => member.state === 'pending').length;
  const suspended = members.filter((member) => member.state === 'suspended').length;

  return (
    <section className="panel members-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>

      <div className="members-stats">
        <div><strong>{members.length}</strong><span>{t.total}</span></div>
        <div><strong>{active}</strong><span>{t.active}</span></div>
        <div><strong>{pending}</strong><span>{t.pending}</span></div>
        <div><strong>{suspended}</strong><span>{t.suspended}</span></div>
      </div>

      <div className="members-list">
        {members.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {members.map((member) => (
          <article className={`member-card ${member.state}`} key={member.id}>
            <div className="member-card-topline"><span>{t.roles[member.role]}</span><strong>{t.states[member.state]}</strong></div>
            <h2>{member.fullName}</h2>
            <p>{t.registeredAt}: {formatDate(member.registeredAt, lang)}</p>
            <CardListenButton text={`${member.fullName}. ${t.roles[member.role]}`} lang={lang} />
          </article>
        ))}
      </div>

      <p className="privacy-note"><ShieldCheck size={18} /> {t.note}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.future}</p>
    </section>
  );
}
