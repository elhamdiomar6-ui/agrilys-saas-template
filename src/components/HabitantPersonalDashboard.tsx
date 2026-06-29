import { CheckCircle2, Clock3, Pencil, Save, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { loadHabitantDashboard, updateHabitantContact, type HabitantProfile, type HabitantReport } from '../lib/habitants';

type Lang = 'fr' | 'ar';

const membershipLabels = {
  fr: { pending: 'En attente', active: 'Membre actif', suspended: 'Suspendu', expired: 'Expiré' },
  ar: { pending: 'في الانتظار', active: 'عضو نشيط', suspended: 'موقوف', expired: 'منتهي' },
};

const cotisationLabels: Record<Lang, Record<string, string>> = {
  fr: {
    a_jour: 'À jour',
    en_retard: 'En retard',
    exonere: 'Exonéré',
    a_verifier: 'À vérifier avec le Bureau',
    inactif: 'Inactif',
  },
  ar: {
    a_jour: 'مخلص',
    en_retard: 'متأخر',
    exonere: 'معفى',
    a_verifier: 'خاص التحقق مع المكتب',
    inactif: 'غير نشيط',
  },
};

export default function HabitantPersonalDashboard({ lang }: { lang: Lang }) {
  const [profile, setProfile] = useState<HabitantProfile | null>(null);
  const [reports, setReports] = useState<HabitantReport[]>([]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAr = lang === 'ar';

  useEffect(() => {
    let mounted = true;
    loadHabitantDashboard()
      .then((result) => {
        if (!mounted) return;
        setProfile(result.profile);
        setReports(result.reports);
        setPhone(result.profile.phone || '');
        setAddress(result.profile.address_in_village || '');
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Chargement impossible.');
      })
      .finally(() => {
        if (mounted) setBusy(false);
      });
    return () => { mounted = false; };
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await updateHabitantContact(phone, address);
      setPhone(result.phone);
      setAddress(result.addressInVillage);
      setProfile((current) => current ? {
        ...current,
        phone: result.phone,
        address_in_village: result.addressInVillage,
      } : current);
      setEditing(false);
      setMessage(isAr ? 'تم حفظ المعلومات.' : 'Informations enregistrées.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  };

  if (busy && !profile) {
    return <p className="privacy-note"><Clock3 size={18} /> {isAr ? 'تحميل معلوماتك...' : 'Chargement de votre espace personnel...'}</p>;
  }
  if (!profile) {
    return <p className="error-text" role="alert">{error || (isAr ? 'الملف غير موجود.' : 'Profil introuvable.')}</p>;
  }

  return (
    <section className="habitant-personal-dashboard" aria-label={isAr ? 'المساحة الشخصية' : 'Espace personnel'}>
      <div className="access-group-heading">
        <h2>{isAr ? `مرحبا ${profile.full_name || ''}` : `Bienvenue ${profile.full_name || ''}`}</h2>
        <p>{isAr ? 'هاد المعلومات خاصة بك.' : 'Ces informations sont personnelles et protégées.'}</p>
      </div>

      <div className="habitant-status-grid">
        <div className="status-item">
          <div className="status-icon"><ShieldCheck size={20} /></div>
          <div>
            <strong>{isAr ? 'حالة العضوية' : 'Statut d’adhésion'}</strong>
            <span>{membershipLabels[lang][profile.membership_status]}</span>
          </div>
        </div>
        <div className="status-item">
          <div className="status-icon"><WalletCards size={20} /></div>
          <div>
            <strong>{isAr ? 'المساهمة' : 'Cotisation'}</strong>
            <span>{cotisationLabels[lang][profile.cotisationStatus] || cotisationLabels[lang].a_verifier}</span>
          </div>
        </div>
      </div>

      <div className="habitant-profile-card">
        <div className="habitant-card-heading">
          <div>
            <UserRound size={22} />
            <strong>{isAr ? 'معلوماتي' : 'Mes informations'}</strong>
          </div>
          {!editing ? (
            <button type="button" className="secondary-action" onClick={() => setEditing(true)}>
              <Pencil size={17} /> {isAr ? 'تعديل' : 'Modifier'}
            </button>
          ) : null}
        </div>
        {editing ? (
          <form className="registration-form" onSubmit={save}>
            <label className="field">
              <span>{isAr ? 'الهاتف' : 'Téléphone'}</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" inputMode="tel" />
            </label>
            <label className="field">
              <span>{isAr ? 'العنوان فالدوار' : 'Adresse dans le douar'}</span>
              <input value={address} onChange={(event) => setAddress(event.target.value)} maxLength={300} />
            </label>
            <div className="bureau-actions">
              <button type="submit" disabled={busy}><Save size={17} /> {isAr ? 'حفظ' : 'Enregistrer'}</button>
              <button type="button" className="secondary-action" onClick={() => setEditing(false)}>
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bureau-request-grid">
            <div><span>{isAr ? 'الهاتف' : 'Téléphone'}</span><strong>{profile.phone || '—'}</strong></div>
            <div><span>{isAr ? 'العنوان' : 'Adresse'}</span><strong>{profile.address_in_village || '—'}</strong></div>
          </div>
        )}
        {message ? <p className="success-note"><CheckCircle2 size={18} /> {message}</p> : null}
        {error ? <p className="error-text" role="alert">{error}</p> : null}
      </div>

      <div className="habitant-reports">
        <h3>{isAr ? 'تبليغاتي' : 'Mes signalements'}</h3>
        {reports.length === 0 ? (
          <p className="empty-state">{isAr ? 'ما كاين حتى تبليغ مربوط بهاد الحساب.' : 'Aucun signalement associé à ce compte.'}</p>
        ) : reports.map((report) => (
          <article className={`report-card ${report.level}`} key={report.id}>
            <div className="report-topline"><span>{report.category}</span><strong>{report.status}</strong></div>
            <p>{report.description}</p>
            <div className="report-meta"><Clock3 size={16} /> {new Intl.DateTimeFormat(isAr ? 'ar-MA' : 'fr-FR').format(new Date(report.created_at))}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
