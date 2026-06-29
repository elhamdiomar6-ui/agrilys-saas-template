import { ArrowLeft, CheckCircle2, Pencil, Plus, RotateCcw, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { readMembers, saveMembers } from '../data/members';
import type { AssociationMember, MemberRole, MemberState } from '../types/members';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  newMember: string;
  editMember: string;
  fullName: string;
  roleLabel: string;
  stateLabel: string;
  registeredAt: string;
  internalNote: string;
  save: string;
  cancel: string;
  edit: string;
  activate: string;
  suspend: string;
  markPending: string;
  search: string;
  filterAll: string;
  empty: string;
  required: string;
  internalNotice: string;
  futureNotice: string;
  roles: Record<MemberRole, string>;
  states: Record<MemberState, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Bureau - gestion membres',
    intro: 'Gestion locale temporaire des membres : statut, état, recherche et notes internes simples.',
    newMember: 'Nouveau membre',
    editMember: 'Modifier le membre',
    fullName: 'Nom complet',
    roleLabel: 'Statut',
    stateLabel: 'État',
    registeredAt: 'Date inscription',
    internalNote: 'Note interne simple',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    activate: 'Activer',
    suspend: 'Suspendre',
    markPending: 'Mettre en attente',
    search: 'Rechercher un nom',
    filterAll: 'Tous les statuts',
    empty: 'Aucun membre ne correspond à la recherche.',
    required: 'Nom complet et date inscription sont obligatoires.',
    internalNotice: 'Ne pas saisir de CIN réel, d email obligatoire ou de donnée sensible. Les notes restent internes.',
    futureNotice: 'Préparé pour auth réelle, permissions et gestion interne des membres du douar.',
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
    title: 'المكتب - تدبير الأعضاء',
    intro: 'تدبير محلي مؤقت للأعضاء: الصفة، الحالة، البحث وملاحظات داخلية بسيطة.',
    newMember: 'عضو جديد',
    editMember: 'تعديل العضو',
    fullName: 'الاسم الكامل',
    roleLabel: 'الصفة',
    stateLabel: 'الحالة',
    registeredAt: 'تاريخ التسجيل',
    internalNote: 'ملاحظة داخلية بسيطة',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    activate: 'تفعيل',
    suspend: 'توقيف',
    markPending: 'وضع في الانتظار',
    search: 'البحث عن اسم',
    filterAll: 'كل الصفات',
    empty: 'لا يوجد أي عضو مطابق للبحث.',
    required: 'الاسم الكامل وتاريخ التسجيل ضروريان.',
    internalNotice: 'لا تدخل رقم البطاقة الوطنية أو بريدا إلزاميا أو أي معطى حساس. الملاحظات تبقى داخلية.',
    futureNotice: 'مهيأ للمصادقة الحقيقية والصلاحيات والتدبير الداخلي لأعضاء الدوار.',
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

const today = new Date().toISOString().slice(0, 10);
const emptyForm = {
  fullName: '',
  role: 'habitant' as MemberRole,
  state: 'pending' as MemberState,
  registeredAt: today,
  internalNote: '',
};

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA').format(new Date(value));
}

export default function BureauMembresPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [members, setMembers] = useState<AssociationMember[]>(readMembers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | MemberRole>('all');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...members]
      .filter((member) => roleFilter === 'all' || member.role === roleFilter)
      .filter((member) => !normalizedQuery || member.fullName.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [members, query, roleFilter]);

  const persist = (nextMembers: AssociationMember[]) => {
    setMembers(nextMembers);
    saveMembers(nextMembers);
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.registeredAt) {
      setError(t.required);
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      persist(members.map((member) => member.id === editingId ? { ...member, ...form, updatedAt: now } : member));
    } else {
      persist([{ id: `MEM-${Date.now()}`, ...form, createdAt: now, updatedAt: now }, ...members]);
    }
    reset();
  };

  const edit = (member: AssociationMember) => {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName,
      role: member.role,
      state: member.state,
      registeredAt: member.registeredAt,
      internalNote: member.internalNote,
    });
    setError('');
  };

  const updateState = (id: string, state: MemberState) => {
    const now = new Date().toISOString();
    persist(members.map((member) => member.id === id ? { ...member, state, updatedAt: now } : member));
  };

  return (
    <section className="panel bureau-members-page members-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-membres" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.internalNotice}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {t.futureNotice}</p>

      <form className="members-form" onSubmit={submit}>
        <h2>{editingId ? t.editMember : t.newMember}</h2>
        <label className="field"><span>{t.fullName}</span><input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
        <div className="members-form-grid">
          <label className="field"><span>{t.roleLabel}</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as MemberRole })}>{Object.entries(t.roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.stateLabel}</span><select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value as MemberState })}>{Object.entries(t.states).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <label className="field"><span>{t.registeredAt}</span><input type="date" value={form.registeredAt} onChange={(event) => setForm({ ...form, registeredAt: event.target.value })} /></label>
        <label className="field"><span>{t.internalNote}</span><textarea rows={3} value={form.internalNote} onChange={(event) => setForm({ ...form, internalNote: event.target.value })} /></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}><RotateCcw size={18} /> {t.cancel}</button> : null}
        </div>
      </form>

      <div className="members-filters">
        <label className="field"><span><Search size={16} /> {t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="field"><span>{t.roleLabel}</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | MemberRole)}><option value="all">{t.filterAll}</option>{Object.entries(t.roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>

      <div className="members-list">
        {filtered.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {filtered.map((member) => (
          <article className={`member-card ${member.state}`} key={member.id}>
            <div className="member-card-topline"><span>{t.roles[member.role]}</span><strong>{t.states[member.state]}</strong></div>
            <h2>{member.fullName}</h2>
            <p>{t.registeredAt}: {formatDate(member.registeredAt, lang)}</p>
            {member.internalNote ? <p className="member-note">{member.internalNote}</p> : null}
            <div className="bureau-actions">
              <button type="button" onClick={() => edit(member)}><Pencil size={18} /> {t.edit}</button>
              <button type="button" onClick={() => updateState(member.id, 'active')}>{t.activate}</button>
              <button type="button" onClick={() => updateState(member.id, 'pending')}>{t.markPending}</button>
              <button type="button" className="danger-action" onClick={() => updateState(member.id, 'suspended')}>{t.suspend}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
