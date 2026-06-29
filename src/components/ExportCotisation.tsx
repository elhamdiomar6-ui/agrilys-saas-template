import { getStorageKey } from '../lib/storage/storageUtils';

type CotisationStatus = 'a_jour' | 'en_retard' | 'exonere' | 'a_verifier';

type ExportableFoyerCotisant = {
  id: string;
  nom: string;
  repere: string;
  statut: CotisationStatus;
  montantDu: number;
  montantPaye: number;
  periode: string;
  observationPrivee: string;
};

const preferredStorageKeys = [
  getStorageKey('cotisationImam', 'v1'),
  'agadir_cotisations_imam',
];

function toNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeStatus(value: unknown): CotisationStatus {
  if (value === 'a_jour' || value === 'en_retard' || value === 'exonere' || value === 'a_verifier') {
    return value;
  }
  return 'a_verifier';
}

function normalizeCanonical(item: Record<string, unknown>, index: number): ExportableFoyerCotisant | null {
  if (typeof item.headName !== 'string' || typeof item.status !== 'string') return null;

  return {
    id: typeof item.id === 'string' ? item.id : `foyer-${index}`,
    nom: item.headName,
    repere: typeof item.localName === 'string' ? item.localName : '',
    statut: normalizeStatus(item.status),
    montantDu: toNumber(item.imamDue) + toNumber(item.schoolDue),
    montantPaye: toNumber(item.imamPaid) + toNumber(item.schoolPaid),
    periode: typeof item.period === 'string' ? item.period : '',
    observationPrivee: typeof item.privateObservation === 'string' ? item.privateObservation : '',
  };
}

function normalizeStatsMirror(item: Record<string, unknown>, index: number): ExportableFoyerCotisant | null {
  if (typeof item.nom_famille_fr !== 'string' || typeof item.statut !== 'string') return null;

  return {
    id: typeof item.id === 'string' ? item.id : `foyer-${index}`,
    nom: item.nom_famille_fr,
    repere: typeof item.nom_famille_ar === 'string' ? item.nom_famille_ar : '',
    statut: normalizeStatus(item.statut),
    montantDu: toNumber(item.montant_du),
    montantPaye: toNumber(item.montant_paye),
    periode: typeof item.periode === 'string' ? item.periode : '',
    observationPrivee: typeof item.observation_privee === 'string' ? item.observation_privee : '',
  };
}

function normalizeRows(value: unknown): ExportableFoyerCotisant[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!isRecord(item)) return null;
      return normalizeCanonical(item, index) || normalizeStatsMirror(item, index);
    })
    .filter((item): item is ExportableFoyerCotisant => Boolean(item));
}

function readKey(key: string): ExportableFoyerCotisant[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return normalizeRows(JSON.parse(raw));
  } catch {
    return [];
  }
}

function readCotisationsFromLocalStorage() {
  if (typeof window === 'undefined') return { key: '', foyers: [] as ExportableFoyerCotisant[] };

  for (const key of preferredStorageKeys) {
    const foyers = readKey(key);
    if (foyers.length > 0) return { key, foyers };
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || preferredStorageKeys.includes(key)) continue;
    const foyers = readKey(key);
    if (foyers.length > 0 && key.toLowerCase().includes('cotisation')) return { key, foyers };
  }

  return { key: '', foyers: [] as ExportableFoyerCotisant[] };
}

function escapeCsv(value: string | number) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(foyers: ExportableFoyerCotisant[]) {
  const headers = ['nom_complet', 'famille', 'statut_foyer', 'cotisation_due', 'cotisation_payee', 'periode', 'observation'];
  const rows = foyers.map((foyer) => [
    foyer.nom,
    foyer.repere,
    foyer.statut,
    foyer.montantDu,
    foyer.montantPaye,
    foyer.periode,
    foyer.observationPrivee,
  ]);

  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');
}

function downloadUtf8Csv(filename: string, csv: string) {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function todayForFilename() {
  return new Date().toISOString().slice(0, 10);
}

export function ExportCotisation() {
  const exportAll = () => {
    const { foyers } = readCotisationsFromLocalStorage();
    if (foyers.length === 0) return;
    downloadUtf8Csv(`cotisation-imam-export-prive-${todayForFilename()}.csv`, buildCsv(foyers));
  };

  const exportLate = () => {
    const { foyers } = readCotisationsFromLocalStorage();
    const late = foyers.filter((foyer) => foyer.statut === 'en_retard');
    if (late.length === 0) return;
    downloadUtf8Csv(`cotisation-imam-retards-prive-${todayForFilename()}.csv`, buildCsv(late));
  };

  const source = readCotisationsFromLocalStorage();
  const hasData = source.foyers.length > 0;
  const hasLateData = source.foyers.some((foyer) => foyer.statut === 'en_retard');

  return (
    <section className="cotisation-export-panel" aria-label="Exports privés cotisation Imam">
      <div>
        <h2>Exports privés</h2>
        <p>CSV local UTF-8 avec BOM pour Excel. Les données restent sur cet appareil.</p>
        {source.key ? <small>Source détectée : {source.key}</small> : null}
      </div>
      <div className="cotisation-export-actions">
        <button type="button" onClick={exportAll} disabled={!hasData}>Exporter CSV privé</button>
        <button type="button" onClick={exportLate} disabled={!hasLateData}>Exporter les retards</button>
      </div>
    </section>
  );
}

export default ExportCotisation;
