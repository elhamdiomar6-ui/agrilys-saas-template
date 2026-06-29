import { readCotisationImamHouseholds, saveCotisationImamHouseholds } from '../data/cotisationImam';
import type { CotisationImamHousehold, CotisationPaymentHistoryItem, CotisationPaymentKind } from '../types/cotisationImam';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type CotisationStorageMode = 'supabase' | 'local';

type CotisationResult = {
  mode: CotisationStorageMode;
  households: CotisationImamHousehold[];
  error?: string;
};

type FoyerRow = {
  id: string;
  nom: string;
  prenom: string | null;
  telephone: string | null;
  adresse: string | null;
  statut: 'actif' | 'inactif';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PaiementRow = {
  id: string;
  foyer_id: string;
  annee: number;
  montant: number;
  statut: 'paye' | 'en_attente' | 'exonere';
  date_paiement: string | null;
  mode_paiement: string | null;
  notes: string | null;
  created_at: string;
};

function parseNotes(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return { privateObservation: value };
  }
}

function numberFrom(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function yearFromPeriod(period: string) {
  const match = period.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function paymentNotes(kind: CotisationPaymentKind, period: string, note: string) {
  return JSON.stringify({ kind, period, note });
}

function mapFoyer(row: FoyerRow, payments: PaiementRow[]): CotisationImamHousehold {
  const notes = parseNotes(row.notes);
  const history: CotisationPaymentHistoryItem[] = payments
    .filter((payment) => payment.foyer_id === row.id)
    .map((payment) => {
      const paymentMeta = parseNotes(payment.notes);
      const kind = paymentMeta.kind === 'ecole_coranique' ? 'ecole_coranique' : 'imam';
      return {
        id: payment.id,
        kind,
        amount: payment.montant || 0,
        period: typeof paymentMeta.period === 'string' ? paymentMeta.period : String(payment.annee),
        at: payment.date_paiement || payment.created_at,
        note: typeof paymentMeta.note === 'string' ? paymentMeta.note : '',
      };
    });

  const imamPaid = history.filter((item) => item.kind === 'imam').reduce((sum, item) => sum + item.amount, 0);
  const schoolPaid = history.filter((item) => item.kind === 'ecole_coranique').reduce((sum, item) => sum + item.amount, 0);

  return {
    id: row.id,
    headName: row.nom,
    localName: row.prenom || '',
    area: row.adresse || '',
    maritalStatus: typeof notes.maritalStatus === 'string' ? notes.maritalStatus as CotisationImamHousehold['maritalStatus'] : 'inconnu',
    status: typeof notes.status === 'string' ? notes.status as CotisationImamHousehold['status'] : 'a_verifier',
    period: typeof notes.period === 'string' ? notes.period : String(new Date().getFullYear()),
    imamDue: numberFrom(notes.imamDue),
    imamPaid,
    schoolDue: numberFrom(notes.schoolDue),
    schoolPaid,
    privateObservation: typeof notes.privateObservation === 'string' ? notes.privateObservation : '',
    history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function householdNotes(household: CotisationImamHousehold) {
  return JSON.stringify({
    maritalStatus: household.maritalStatus,
    status: household.status,
    period: household.period,
    imamDue: household.imamDue,
    schoolDue: household.schoolDue,
    privateObservation: household.privateObservation,
  });
}

async function saveHouseholdToSupabase(household: CotisationImamHousehold): Promise<CotisationImamHousehold> {
  if (!supabase) throw new Error('Supabase non configure.');

  const payload = {
    nom: household.headName,
    prenom: household.localName || null,
    adresse: household.area || null,
    statut: 'actif',
    notes: householdNotes(household),
    updated_at: new Date().toISOString(),
  };

  const query = isUuid(household.id)
    ? supabase.from('cotisation_foyers').update(payload).eq('id', household.id).select('id').single()
    : supabase.from('cotisation_foyers').insert(payload).select('id').single();

  const { data, error } = await query;
  if (error) throw error;
  const foyerId = data.id as string;

  await supabase.from('cotisation_paiements').delete().eq('foyer_id', foyerId);

  const payments = household.history
    .filter((item) => item.amount > 0)
    .map((item) => ({
      foyer_id: foyerId,
      annee: yearFromPeriod(item.period),
      montant: Math.round(item.amount),
      statut: 'paye',
      date_paiement: item.at ? item.at.slice(0, 10) : null,
      mode_paiement: 'especes',
      notes: paymentNotes(item.kind, item.period, item.note),
    }));

  if (payments.length > 0) {
    const { error: paymentError } = await supabase.from('cotisation_paiements').insert(payments);
    if (paymentError) throw paymentError;
  }

  return { ...household, id: foyerId, updatedAt: payload.updated_at };
}

export async function loadCotisations(): Promise<CotisationResult> {
  const local = readCotisationImamHouseholds();
  if (!isSupabaseConfigured || !supabase) return { mode: 'local', households: local, error: 'Supabase non configure.' };

  try {
    const [{ data: foyers, error: foyersError }, { data: paiements, error: paiementsError }] = await Promise.all([
      supabase.from('cotisation_foyers').select('*').order('nom', { ascending: true }),
      supabase.from('cotisation_paiements').select('*').order('created_at', { ascending: false }),
    ]);

    if (foyersError) throw foyersError;
    if (paiementsError) throw paiementsError;

    const households = (foyers || []).map((row) => mapFoyer(row as FoyerRow, (paiements || []) as PaiementRow[]));
    saveCotisationImamHouseholds(households.length > 0 ? households : local);
    return { mode: 'supabase', households: households.length > 0 ? households : local };
  } catch (error) {
    return { mode: 'local', households: local, error: error instanceof Error ? error.message : 'Erreur Supabase.' };
  }
}

export async function saveCotisations(households: CotisationImamHousehold[]): Promise<CotisationResult> {
  saveCotisationImamHouseholds(households);
  if (!isSupabaseConfigured || !supabase) return { mode: 'local', households, error: 'Supabase non configure.' };

  try {
    const saved: CotisationImamHousehold[] = [];
    for (const household of households) {
      saved.push(await saveHouseholdToSupabase(household));
    }
    saveCotisationImamHouseholds(saved);
    return { mode: 'supabase', households: saved };
  } catch (error) {
    return { mode: 'local', households, error: error instanceof Error ? error.message : 'Erreur Supabase.' };
  }
}

export async function migrateLocalCotisationsToSupabase(): Promise<CotisationResult> {
  return saveCotisations(readCotisationImamHouseholds());
}
