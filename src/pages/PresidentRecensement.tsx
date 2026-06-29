import { ArrowLeft, Download, MapPinned, RefreshCw, Search, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { supabase } from '../lib/supabaseClient';

type Lang = 'fr' | 'ar';
type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  status: string;
  membership_status: string;
  birth_date: string | null;
  gender: string | null;
  address_in_village: string | null;
  household_id: string | null;
  created_at: string;
};
type RegistrationRow = { status: string };
type HouseholdRow = {
  id: string;
  household_name: string | null;
  address_in_village: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
};
type CotisationRow = { telephone: string | null; statut: string | null; notes: string | null };

function normalizePhone(value: string | null) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^0[5-7]\d{8}$/.test(digits)) return `212${digits.slice(1)}`;
  return digits;
}

function ageFromBirthDate(value: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
}

function ageGroup(age: number | null) {
  if (age === null) return 'non_precise';
  if (age < 18) return 'moins_18';
  if (age < 30) return '18_29';
  if (age < 45) return '30_44';
  if (age < 60) return '45_59';
  return '60_plus';
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function cotisationStatus(row: CotisationRow | undefined) {
  if (!row) return 'a_verifier';
  try {
    const notes = JSON.parse(row.notes || '{}') as { status?: string };
    return notes.status || (row.statut === 'actif' ? 'a_verifier' : 'inactif');
  } catch {
    return row.statut === 'actif' ? 'a_verifier' : 'inactif';
  }
}

export default function PresidentRecensementPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [cotisations, setCotisations] = useState<CotisationRow[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAr = lang === 'ar';

  const load = useCallback(async () => {
    if (!supabase) {
      setError('Supabase non configuré.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const [profilesResult, registrationsResult, householdsResult, cotisationsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id,full_name,phone,role,status,membership_status,birth_date,gender,address_in_village,household_id,created_at')
        .in('role', ['habitant', 'adherent', 'soutien'])
        .order('full_name'),
      supabase.from('registration_requests').select('status'),
      supabase
        .from('household_records')
        .select('id,household_name,address_in_village,latitude,longitude,status')
        .order('household_name'),
      supabase.from('cotisation_foyers').select('telephone,statut,notes'),
    ]);
    const firstError = profilesResult.error || registrationsResult.error || householdsResult.error || cotisationsResult.error;
    if (firstError) setError(firstError.message);
    setProfiles((profilesResult.data || []) as ProfileRow[]);
    setRegistrations((registrationsResult.data || []) as RegistrationRow[]);
    setHouseholds((householdsResult.data || []) as HouseholdRow[]);
    setCotisations((cotisationsResult.data || []) as CotisationRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cotisationByPhone = useMemo(
    () => new Map(cotisations.map((row) => [normalizePhone(row.telephone), row])),
    [cotisations],
  );

  const enriched = useMemo(() => profiles.map((profile) => {
    const age = ageFromBirthDate(profile.birth_date);
    return {
      ...profile,
      age,
      ageGroup: ageGroup(age),
      cotisation: cotisationStatus(cotisationByPhone.get(normalizePhone(profile.phone))),
    };
  }), [cotisationByPhone, profiles]);

  const filtered = useMemo(() => enriched.filter((profile) => {
    const haystack = `${profile.full_name || ''} ${profile.phone || ''} ${profile.address_in_village || ''}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase()))
      && (statusFilter === 'all' || profile.membership_status === statusFilter)
      && (genderFilter === 'all' || profile.gender === genderFilter)
      && (ageFilter === 'all' || profile.ageGroup === ageFilter);
  }), [ageFilter, enriched, genderFilter, query, statusFilter]);

  const pending = registrations.filter((row) => row.status === 'pending' || row.status === 'under_review').length;
  const rejected = registrations.filter((row) => row.status === 'rejected').length;
  const active = profiles.filter((profile) => profile.membership_status === 'active').length;
  const genderCounts = {
    homme: profiles.filter((profile) => profile.gender === 'homme').length,
    femme: profiles.filter((profile) => profile.gender === 'femme').length,
    non_precise: profiles.filter((profile) => !profile.gender || profile.gender === 'non_precisé').length,
  };
  const ageGroups = ['moins_18', '18_29', '30_44', '45_59', '60_plus', 'non_precise'];
  const locatedHouseholds = households.filter((household) => household.latitude !== null && household.longitude !== null);

  const exportCsv = () => {
    const headers = ['nom_complet', 'telephone', 'statut_adhesion', 'sexe', 'date_naissance', 'age', 'adresse', 'foyer_id', 'statut_cotisation'];
    const rows = filtered.map((profile) => [
      profile.full_name,
      profile.phone,
      profile.membership_status,
      profile.gender,
      profile.birth_date,
      profile.age,
      profile.address_in_village,
      profile.household_id,
      profile.cotisation,
    ].map(csvCell).join(','));
    const blob = new Blob([`\uFEFF${headers.join(',')}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `recensement-agadir-ntguida-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel president-recensement-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {isAr ? 'رجوع' : 'Retour'}</button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{isAr ? 'إحصاء الساكنة' : 'Recensement habitants'}</h1>
      <p className="intro">
        {isAr ? 'مؤشرات داخلية خاصة بالرئيس.' : 'Tableau interne réservé au Président pour le suivi et les dossiers de financement.'}
      </p>
      <AudioHelp scriptId="president-recensement" />

      <div className="bureau-actions recensement-actions">
        <button type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={17} /> {isAr ? 'تحديث' : 'Actualiser'}</button>
        <button type="button" onClick={exportCsv} disabled={!filtered.length}><Download size={17} /> Export CSV</button>
      </div>
      {error ? <p className="error-text" role="alert">{error}</p> : null}

      <div className="bureau-stats">
        <div className="bureau-stat green"><span>{isAr ? 'المسجلون' : 'Inscrits'}</span><strong>{profiles.length}</strong></div>
        <div className="bureau-stat green"><span>{isAr ? 'النشيطون' : 'Validés actifs'}</span><strong>{active}</strong></div>
        <div className="bureau-stat gold"><span>{isAr ? 'في الانتظار' : 'En attente'}</span><strong>{pending}</strong></div>
        <div className="bureau-stat soft"><span>{isAr ? 'مرفوضون' : 'Refusés'}</span><strong>{rejected}</strong></div>
      </div>

      <div className="recensement-charts">
        <section>
          <h2>{isAr ? 'حسب الجنس' : 'Répartition par sexe'}</h2>
          {Object.entries(genderCounts).map(([label, value]) => (
            <div className="recensement-bar" key={label}>
              <span>{label.replace('_', ' ')}</span>
              <div><i style={{ width: `${profiles.length ? (value / profiles.length) * 100 : 0}%` }} /></div>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
        <section>
          <h2>{isAr ? 'حسب العمر' : 'Répartition par âge'}</h2>
          {ageGroups.map((group) => {
            const value = enriched.filter((profile) => profile.ageGroup === group).length;
            return (
              <div className="recensement-bar" key={group}>
                <span>{group.replace('_', ' ')}</span>
                <div><i style={{ width: `${profiles.length ? (value / profiles.length) * 100 : 0}%` }} /></div>
                <strong>{value}</strong>
              </div>
            );
          })}
        </section>
      </div>

      <div className="recensement-filters">
        <label className="field recensement-search">
          <span>{isAr ? 'بحث' : 'Recherche'}</span>
          <div className="input-wrap"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        </label>
        <label className="field"><span>{isAr ? 'الحالة' : 'Statut'}</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Tous</option><option value="active">Actif</option><option value="pending">En attente</option><option value="suspended">Suspendu</option><option value="expired">Expiré</option></select></label>
        <label className="field"><span>{isAr ? 'الجنس' : 'Sexe'}</span><select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)}><option value="all">Tous</option><option value="homme">Homme</option><option value="femme">Femme</option><option value="non_precisé">Non précisé</option></select></label>
        <label className="field"><span>{isAr ? 'العمر' : 'Âge'}</span><select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)}><option value="all">Tous</option>{ageGroups.map((group) => <option value={group} key={group}>{group.replace('_', ' ')}</option>)}</select></label>
      </div>

      <div className="recensement-table-wrap">
        <table className="recensement-table">
          <thead><tr><th>Nom</th><th>Téléphone</th><th>Adhésion</th><th>Sexe</th><th>Âge</th><th>Foyer</th><th>Cotisation</th></tr></thead>
          <tbody>
            {filtered.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.full_name || '—'}</td>
                <td>{profile.phone || '—'}</td>
                <td>{profile.membership_status}</td>
                <td>{profile.gender || '—'}</td>
                <td>{profile.age ?? '—'}</td>
                <td>{profile.household_id ? 'Oui' : 'Non renseigné'}</td>
                <td>{profile.cotisation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="recensement-map-section">
        <h2><MapPinned size={21} /> {isAr ? 'خريطة الأسر' : 'Carte des foyers'}</h2>
        {locatedHouseholds.length === 0 ? (
          <p className="empty-state">{isAr ? 'ما كايناش إحداثيات GPS دابا.' : 'Aucune coordonnée GPS enregistrée pour le moment.'}</p>
        ) : (
          <div className="recensement-map-list">
            {locatedHouseholds.map((household) => (
              <a
                key={household.id}
                href={`https://www.openstreetmap.org/?mlat=${household.latitude}&mlon=${household.longitude}#map=17/${household.latitude}/${household.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPinned size={18} />
                <span>{household.household_name || household.address_in_village || 'Foyer'}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
