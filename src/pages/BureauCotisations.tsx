import { ArrowLeft, CheckCircle2, Coins, History, Pencil, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import AudioHelp from '../components/AudioHelp';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import ExportCotisation from '../components/ExportCotisation';
import StatsCotisation from '../components/StatsCotisation';
import { readCotisationImamHouseholds } from '../data/cotisationImam';
import { loadCotisations, migrateLocalCotisationsToSupabase, saveCotisations, type CotisationStorageMode } from '../lib/cotisationsSupabase';
import type { CotisationImamHousehold, CotisationImamMaritalStatus, CotisationImamStatus, CotisationPaymentKind } from '../types/cotisationImam';

type Lang = 'fr' | 'ar';
type StatusFilter = 'all' | CotisationImamStatus;

type Copy = {
  back: string;
  title: string;
  intro: string;
  protection: string;
  demoOnly: string;
  synced: string;
  localMode: string;
  migrateToSupabase: string;
  migrationSuccess: string;
  migrationError: string;
  formTitleNew: string;
  formTitleEdit: string;
  headName: string;
  localName: string;
  area: string;
  maritalStatus: string;
  period: string;
  status: string;
  imamDue: string;
  imamPaid: string;
  schoolDue: string;
  schoolPaid: string;
  privateObservation: string;
  save: string;
  cancel: string;
  edit: string;
  addHousehold: string;
  importPrivateCsv: string;
  importHelp: string;
  importSuccess: string;
  importError: string;
  required: string;
  filter: string;
  all: string;
  households: string;
  upToDate: string;
  late: string;
  totalPaid: string;
  remaining: string;
  history: string;
  noHistory: string;
  empty: string;
  statuses: Record<CotisationImamStatus, string>;
  maritalStatuses: Record<CotisationImamMaritalStatus, string>;
  paymentKinds: Record<CotisationPaymentKind, string>;
};

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Cotisation Imam / École coranique',
    intro: 'Suivi interne des foyers cotisants avec données fictives locales, sans paiement en ligne et sans publication publique.',
    protection: 'Module interne Bureau / Président uniquement. Ne pas saisir de données réelles sensibles dans cette version.',
    demoOnly: 'Stockage local uniquement : les données restent sur cet appareil et servent à valider le fonctionnement terrain.',
    synced: 'Synchronisé avec Supabase.',
    localMode: 'Mode local : les données restent sur cet appareil jusqu à synchronisation.',
    migrateToSupabase: 'Migrer vers Supabase',
    migrationSuccess: 'Migration Supabase terminée.',
    migrationError: 'Migration impossible : vérifier la connexion et les droits Supabase.',
    formTitleNew: 'Ajouter un foyer cotisant',
    formTitleEdit: 'Modifier le foyer ou ajouter un paiement',
    headName: 'Chef de foyer',
    localName: 'Nom local / repère',
    area: 'Quartier ou repère',
    maritalStatus: 'Statut marié',
    period: 'Mois ou période',
    status: 'Statut',
    imamDue: 'Cotisation imam due',
    imamPaid: 'Cotisation imam payée',
    schoolDue: 'Cotisation école coranique due',
    schoolPaid: 'Cotisation école coranique payée',
    privateObservation: 'Observation privée',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    addHousehold: 'Nouveau foyer',
    importPrivateCsv: 'Importer CSV privé',
    importHelp: 'Colonnes attendues : nom_complet,famille,statut_foyer,cotisation_due,cotisation_payee,periode,observation',
    importSuccess: 'Import local terminé.',
    importError: 'Import impossible : vérifiez les colonnes et les montants.',
    required: 'Chef de foyer, période et montants valides sont obligatoires.',
    filter: 'Filtrer par statut',
    all: 'Tous',
    households: 'Foyers cotisants',
    upToDate: 'À jour',
    late: 'En retard',
    totalPaid: 'Total payé',
    remaining: 'Reste à collecter',
    history: 'Historique des paiements',
    noHistory: 'Aucun paiement enregistré.',
    empty: 'Aucun foyer cotisant dans ce filtre.',
    statuses: {
      a_jour: 'À jour',
      en_retard: 'En retard',
      exonere: 'Exonéré',
      a_verifier: 'À vérifier',
    },
    maritalStatuses: {
      marie: 'Marié',
      non_marie: 'Non marié',
      veuf_veuve: 'Veuf / veuve',
      inconnu: 'Inconnu',
      non_applicable: 'Non applicable',
    },
    paymentKinds: {
      imam: 'Imam',
      ecole_coranique: 'École coranique',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'مساهمة الإمام / المدرسة القرآنية',
    intro: 'تتبع داخلي للأسر المساهمة بمعطيات تجريبية محلية، بدون أداء إلكتروني وبدون نشر عمومي.',
    protection: 'وحدة داخلية للمكتب والرئيس فقط. لا تدخل معطيات حقيقية حساسة في هذه النسخة.',
    demoOnly: 'تخزين محلي فقط: تبقى المعطيات في هذا الجهاز من أجل تجربة الاستعمال الميداني.',
    synced: 'تمت المزامنة مع Supabase.',
    localMode: 'وضع محلي: تبقى المعطيات في هذا الجهاز إلى حين المزامنة.',
    migrateToSupabase: 'نقل إلى Supabase',
    migrationSuccess: 'اكتمل النقل إلى Supabase.',
    migrationError: 'تعذر النقل: تحقق من الاتصال والصلاحيات.',
    formTitleNew: 'إضافة أسرة مساهمة',
    formTitleEdit: 'تعديل الأسرة أو إضافة أداء',
    headName: 'رب الأسرة',
    localName: 'اسم محلي / علامة',
    area: 'حي أو علامة',
    maritalStatus: 'الحالة الزوجية',
    period: 'الشهر أو الفترة',
    status: 'الحالة',
    imamDue: 'واجب الإمام المستحق',
    imamPaid: 'واجب الإمام المؤدى',
    schoolDue: 'واجب المدرسة القرآنية المستحق',
    schoolPaid: 'واجب المدرسة القرآنية المؤدى',
    privateObservation: 'ملاحظة خاصة',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    addHousehold: 'أسرة جديدة',
    importPrivateCsv: 'استيراد CSV خاص',
    importHelp: 'الأعمدة المطلوبة: nom_complet,famille,statut_foyer,cotisation_due,cotisation_payee,periode,observation',
    importSuccess: 'تم الاستيراد المحلي.',
    importError: 'تعذر الاستيراد: تحقق من الأعمدة والمبالغ.',
    required: 'رب الأسرة والفترة والمبالغ الصحيحة ضرورية.',
    filter: 'تصفية حسب الحالة',
    all: 'الكل',
    households: 'الأسر المساهمة',
    upToDate: 'في الوضعية',
    late: 'متأخر',
    totalPaid: 'المجموع المؤدى',
    remaining: 'الباقي للتحصيل',
    history: 'سجل الأداءات',
    noHistory: 'لا يوجد أداء مسجل.',
    empty: 'لا توجد أسر مساهمة في هذا المرشح.',
    statuses: {
      a_jour: 'في الوضعية',
      en_retard: 'متأخر',
      exonere: 'معفى',
      a_verifier: 'للمراجعة',
    },
    maritalStatuses: {
      marie: 'متزوج',
      non_marie: 'غير متزوج',
      veuf_veuve: 'أرمل / أرملة',
      inconnu: 'غير معروف',
      non_applicable: 'غير معني',
    },
    paymentKinds: {
      imam: 'الإمام',
      ecole_coranique: 'المدرسة القرآنية',
    },
  },
};

const currentPeriod = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());

const emptyForm = {
  headName: '',
  localName: '',
  area: '',
  maritalStatus: 'inconnu' as CotisationImamMaritalStatus,
  status: 'a_verifier' as CotisationImamStatus,
  period: currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1),
  imamDue: '0',
  imamPaid: '0',
  schoolDue: '0',
  schoolPaid: '0',
  privateObservation: '',
};

function formatAmount(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { maximumFractionDigits: 2 }).format(value) + ' MAD';
}

function formatDate(value: string, lang: Lang) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle: 'medium' }).format(new Date(value));
}

function toNumber(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : NaN;
}

function remainingFor(household: CotisationImamHousehold) {
  if (household.status === 'exonere') return 0;
  return Math.max(0, household.imamDue + household.schoolDue - household.imamPaid - household.schoolPaid);
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function normalizeStatus(value: string): CotisationImamStatus {
  const normalized = value.trim().toLowerCase().replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/\s+/g, '_');
  if (normalized === 'a_jour' || normalized === 'ajour') return 'a_jour';
  if (normalized === 'en_retard' || normalized === 'retard') return 'en_retard';
  if (normalized === 'exonere') return 'exonere';
  return 'a_verifier';
}

function parsePrivateCsv(content: string): CotisationImamHousehold[] {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const [headerLine, ...rows] = lines;
  if (!headerLine || rows.length === 0) return [];
  const headers = splitCsvLine(headerLine).map((header) => header.trim());
  const required = ['nom_complet', 'famille', 'statut_foyer', 'cotisation_due', 'cotisation_payee', 'periode', 'observation'];
  if (!required.every((key) => headers.includes(key))) return [];

  const now = new Date().toISOString();
  return rows.map((row, rowIndex) => {
    const values = splitCsvLine(row);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    const due = toNumber(record.cotisation_due || '0');
    const paid = toNumber(record.cotisation_payee || '0');
    if (!record.nom_complet?.trim() || Number.isNaN(due) || Number.isNaN(paid)) {
      throw new Error('Invalid private CSV row');
    }
    const status = normalizeStatus(record.statut_foyer || '');
    return {
      id: `FOYER-PRIVATE-${Date.now()}-${rowIndex}`,
      headName: record.nom_complet.trim(),
      localName: record.famille?.trim() || '',
      area: '',
      maritalStatus: 'inconnu' as const,
      status,
      period: record.periode?.trim() || currentPeriod,
      imamDue: due,
      imamPaid: paid,
      schoolDue: 0,
      schoolPaid: 0,
      privateObservation: record.observation?.trim() || '',
      history: paid > 0 ? [{ id: `PAY-PRIVATE-${Date.now()}-${rowIndex}`, kind: 'imam' as const, amount: paid, period: record.periode?.trim() || currentPeriod, at: now, note: record.observation?.trim() || '' }] : [],
      createdAt: now,
      updatedAt: now,
    };
  });
}

export default function BureauCotisationsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [households, setHouseholds] = useState<CotisationImamHousehold[]>(readCotisationImamHouseholds);
  const [storageMode, setStorageMode] = useState<CotisationStorageMode>('local');
  const [syncMessage, setSyncMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [error, setError] = useState('');
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    loadCotisations().then((result) => {
      if (!mounted) return;
      setHouseholds(result.households);
      setStorageMode(result.mode);
      setSyncMessage(result.error || '');
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const visibleHouseholds = useMemo(() => households
    .filter((household) => filter === 'all' || household.status === filter)
    .sort((a, b) => a.headName.localeCompare(b.headName)), [households, filter]);

  const stats = useMemo(() => {
    const totalPaid = households.reduce((sum, household) => sum + household.imamPaid + household.schoolPaid, 0);
    const remaining = households.reduce((sum, household) => sum + remainingFor(household), 0);
    return {
      households: households.length,
      upToDate: households.filter((household) => household.status === 'a_jour').length,
      late: households.filter((household) => household.status === 'en_retard').length,
      totalPaid,
      remaining,
    };
  }, [households]);

  const persist = async (next: CotisationImamHousehold[]) => {
    setHouseholds(next);
    const result = await saveCotisations(next);
    setHouseholds(result.households);
    setStorageMode(result.mode);
    setSyncMessage(result.error || '');
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const edit = (household: CotisationImamHousehold) => {
    setEditingId(household.id);
    setForm({
      headName: household.headName,
      localName: household.localName,
      area: household.area,
      maritalStatus: household.maritalStatus,
      status: household.status,
      period: household.period,
      imamDue: String(household.imamDue),
      imamPaid: String(household.imamPaid),
      schoolDue: String(household.schoolDue),
      schoolPaid: String(household.schoolPaid),
      privateObservation: household.privateObservation,
    });
    setError('');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const imamDue = toNumber(form.imamDue);
    const imamPaid = toNumber(form.imamPaid);
    const schoolDue = toNumber(form.schoolDue);
    const schoolPaid = toNumber(form.schoolPaid);
    if (!form.headName.trim() || !form.period.trim() || [imamDue, imamPaid, schoolDue, schoolPaid].some(Number.isNaN)) {
      setError(t.required);
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      headName: form.headName.trim(),
      localName: form.localName.trim(),
      area: form.area.trim(),
      maritalStatus: form.maritalStatus,
      status: form.status,
      period: form.period.trim(),
      imamDue,
      imamPaid,
      schoolDue,
      schoolPaid,
      privateObservation: form.privateObservation.trim(),
    };

    if (editingId) {
      await persist(households.map((household) => {
        if (household.id !== editingId) return household;
        const history = [...household.history];
        const imamDelta = imamPaid - household.imamPaid;
        const schoolDelta = schoolPaid - household.schoolPaid;
        if (imamDelta > 0) {
          history.unshift({ id: `PAY-${Date.now()}-IMAM`, kind: 'imam', amount: imamDelta, period: payload.period, at: now, note: payload.privateObservation });
        }
        if (schoolDelta > 0) {
          history.unshift({ id: `PAY-${Date.now()}-SCHOOL`, kind: 'ecole_coranique', amount: schoolDelta, period: payload.period, at: now, note: payload.privateObservation });
        }
        return { ...household, ...payload, history, updatedAt: now };
      }));
    } else {
      const history = [
        imamPaid > 0 ? { id: `PAY-${Date.now()}-IMAM`, kind: 'imam' as const, amount: imamPaid, period: payload.period, at: now, note: payload.privateObservation } : null,
        schoolPaid > 0 ? { id: `PAY-${Date.now()}-SCHOOL`, kind: 'ecole_coranique' as const, amount: schoolPaid, period: payload.period, at: now, note: payload.privateObservation } : null,
      ].filter(Boolean) as CotisationImamHousehold['history'];
      await persist([{ id: `FOYER-${Date.now()}`, ...payload, history, createdAt: now, updatedAt: now }, ...households]);
    }
    reset();
  };

  const importPrivateCsv = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imported = parsePrivateCsv(String(reader.result || ''));
        if (!imported.length) throw new Error('No private CSV rows');
        await persist([...imported, ...households]);
        setImportMessage(`${t.importSuccess} ${imported.length}`);
        setError('');
      } catch {
        setImportMessage('');
        setError(t.importError);
      }
    };
    reader.readAsText(file);
  };

  const migrateToSupabase = async () => {
    setImportMessage('');
    setError('');
    const result = await migrateLocalCotisationsToSupabase();
    setHouseholds(result.households);
    setStorageMode(result.mode);
    setSyncMessage(result.error || '');
    if (result.mode === 'supabase') {
      setImportMessage(t.migrationSuccess);
      return;
    }
    setError(result.error || t.migrationError);
  };

  return (
    <section className="panel contributions-page bureau-contributions-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Coins size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="bureau-cotisations-imam" />
      <p className="privacy-note"><ShieldCheck size={18} /> {t.protection}</p>
      <p className="privacy-note"><CheckCircle2 size={18} /> {storageMode === 'supabase' ? t.synced : t.localMode}</p>
      {syncMessage ? <p className="privacy-note">{syncMessage}</p> : null}
      {loading ? <p className="empty-state">Chargement...</p> : null}

      <section className="private-import-panel" aria-label={t.importPrivateCsv}>
        <div>
          <h2>{t.importPrivateCsv}</h2>
          <p>{t.importHelp}</p>
        </div>
        <label className="private-import-button">
          <input type="file" accept=".csv,text/csv" onChange={(event) => importPrivateCsv(event.target.files?.[0] || null)} />
          <span>{t.importPrivateCsv}</span>
        </label>
        <button type="button" className="secondary-inline" onClick={migrateToSupabase}>
          {t.migrateToSupabase}
        </button>
        {importMessage ? <p className="privacy-note"><CheckCircle2 size={18} /> {importMessage}</p> : null}
      </section>

      <div className="bureau-stats cotisation-imam-stats">
        <StatCard label={t.households} value={stats.households} />
        <StatCard label={t.upToDate} value={stats.upToDate} />
        <StatCard label={t.late} value={stats.late} tone="gold" />
        <StatCard label={t.totalPaid} value={formatAmount(stats.totalPaid, lang)} />
        <StatCard label={t.remaining} value={formatAmount(stats.remaining, lang)} tone="soft" />
      </div>

      <StatsCotisation />
      <ExportCotisation />

      <form className="contributions-form" onSubmit={submit}>
        <div className="cotisation-form-heading">
          <h2>{editingId ? t.formTitleEdit : t.formTitleNew}</h2>
          {editingId ? <button type="button" onClick={reset}><Plus size={18} /> {t.addHousehold}</button> : null}
        </div>
        <div className="contributions-form-grid">
          <label className="field"><span>{t.headName}</span><input value={form.headName} onChange={(event) => setForm({ ...form, headName: event.target.value })} /></label>
          <label className="field"><span>{t.localName}</span><input value={form.localName} onChange={(event) => setForm({ ...form, localName: event.target.value })} /></label>
        </div>
        <div className="contributions-form-grid">
          <label className="field"><span>{t.area}</span><input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} /></label>
          <label className="field"><span>{t.period}</span><input value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })} /></label>
        </div>
        <div className="contributions-form-grid">
          <label className="field"><span>{t.maritalStatus}</span><select value={form.maritalStatus} onChange={(event) => setForm({ ...form, maritalStatus: event.target.value as CotisationImamMaritalStatus })}>{Object.entries(t.maritalStatuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="field"><span>{t.status}</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CotisationImamStatus })}>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="contributions-form-grid">
          <label className="field"><span>{t.imamDue}</span><input type="number" min="0" step="0.01" value={form.imamDue} onChange={(event) => setForm({ ...form, imamDue: event.target.value })} /></label>
          <label className="field"><span>{t.imamPaid}</span><input type="number" min="0" step="0.01" value={form.imamPaid} onChange={(event) => setForm({ ...form, imamPaid: event.target.value })} /></label>
        </div>
        <div className="contributions-form-grid">
          <label className="field"><span>{t.schoolDue}</span><input type="number" min="0" step="0.01" value={form.schoolDue} onChange={(event) => setForm({ ...form, schoolDue: event.target.value })} /></label>
          <label className="field"><span>{t.schoolPaid}</span><input type="number" min="0" step="0.01" value={form.schoolPaid} onChange={(event) => setForm({ ...form, schoolPaid: event.target.value })} /></label>
        </div>
        <label className="field"><span>{t.privateObservation}</span><textarea rows={3} value={form.privateObservation} onChange={(event) => setForm({ ...form, privateObservation: event.target.value })} /></label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="announcement-form-actions">
          <button type="submit"><Plus size={18} /> {t.save}</button>
          {editingId ? <button type="button" className="secondary-inline" onClick={reset}><RotateCcw size={18} /> {t.cancel}</button> : null}
        </div>
      </form>

      <div className="contributions-summary">
        <div><strong>{visibleHouseholds.length}</strong><span>{t.households}</span></div>
        <label className="field"><span>{t.filter}</span><select value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)}><option value="all">{t.all}</option>{Object.entries(t.statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>

      <div className="contributions-list cotisation-households-list">
        {visibleHouseholds.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {visibleHouseholds.map((household) => (
          <article className={`contribution-card ${household.status}`} key={household.id}>
            <div className="contribution-topline"><span>{household.period}</span><strong>{t.statuses[household.status]}</strong></div>
            <h2>{household.headName}</h2>
            <p>{household.localName || household.area || '-'}</p>
            <div className="cotisation-amount-grid">
              <div><span>{t.imamDue}</span><strong>{formatAmount(household.imamDue, lang)}</strong></div>
              <div><span>{t.imamPaid}</span><strong>{formatAmount(household.imamPaid, lang)}</strong></div>
              <div><span>{t.schoolDue}</span><strong>{formatAmount(household.schoolDue, lang)}</strong></div>
              <div><span>{t.schoolPaid}</span><strong>{formatAmount(household.schoolPaid, lang)}</strong></div>
              <div><span>{t.remaining}</span><strong>{formatAmount(remainingFor(household), lang)}</strong></div>
              <div><span>{t.maritalStatus}</span><strong>{t.maritalStatuses[household.maritalStatus]}</strong></div>
            </div>
            {household.privateObservation ? <p className="contribution-note">{t.privateObservation}: {household.privateObservation}</p> : null}
            <div className="contribution-history">
              <h3><History size={16} /> {t.history}</h3>
              {household.history.length === 0 ? <span>{t.noHistory}</span> : null}
              {household.history.slice(0, 4).map((item) => (
                <span key={item.id}>{formatDate(item.at, lang)} - {t.paymentKinds[item.kind]} - {formatAmount(item.amount, lang)} - {item.period}</span>
              ))}
            </div>
            <div className="bureau-actions"><button type="button" onClick={() => edit(household)}><Pencil size={18} /> {t.edit}</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, tone = 'green' }: { label: string; value: string | number; tone?: 'green' | 'gold' | 'soft' }) {
  return (
    <div className={`bureau-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
