import { useEffect, useMemo, useState } from 'react';

type CotisationStatus = 'a_jour' | 'en_retard' | 'exonere' | 'a_verifier';

type NormalizedFoyerCotisant = {
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
  'agadirnetguida.cotisationImam.v1',
  'agadir_cotisations_imam',
];

export const statsCotisationUpdatedEvent = 'agadirnetguida:cotisations-imam-updated';

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

function normalizeCanonical(item: Record<string, unknown>, index: number): NormalizedFoyerCotisant | null {
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

function normalizeStatsMirror(item: Record<string, unknown>, index: number): NormalizedFoyerCotisant | null {
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

function normalizeRows(value: unknown): NormalizedFoyerCotisant[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!isRecord(item)) return null;
      return normalizeCanonical(item, index) || normalizeStatsMirror(item, index);
    })
    .filter((item): item is NormalizedFoyerCotisant => Boolean(item));
}

function readKey(key: string): NormalizedFoyerCotisant[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return normalizeRows(JSON.parse(raw));
  } catch {
    return [];
  }
}

function readCotisationsFromLocalStorage() {
  if (typeof window === 'undefined') return { key: '', foyers: [] as NormalizedFoyerCotisant[] };

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

  return { key: '', foyers: [] as NormalizedFoyerCotisant[] };
}

function formatDh(value: number) {
  return `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 2 }).format(value)} DH`;
}

export function StatsCotisation() {
  const [source, setSource] = useState(() => readCotisationsFromLocalStorage());

  useEffect(() => {
    const refresh = () => setSource(readCotisationsFromLocalStorage());
    refresh();
    window.addEventListener(statsCotisationUpdatedEvent, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(statsCotisationUpdatedEvent, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const stats = useMemo(() => {
    const foyers = source.foyers;
    const foyersEnRetard = foyers.filter((foyer) => foyer.statut === 'en_retard');
    const foyersExoneres = foyers.filter((foyer) => foyer.statut === 'exonere');
    const totalAttendu = foyers.reduce((sum, foyer) => sum + foyer.montantDu, 0);
    const totalEncaisse = foyers.reduce((sum, foyer) => sum + foyer.montantPaye, 0);
    const resteARecouvrer = Math.max(0, totalAttendu - totalEncaisse);
    const tauxRecouvrement = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;

    return {
      totalFoyers: foyers.length,
      foyersEnRetard,
      foyersExoneres,
      totalAttendu,
      totalEncaisse,
      resteARecouvrer,
      tauxRecouvrement,
    };
  }, [source.foyers]);

  return (
    <section className="cotisation-analysis-panel" aria-label="Indicateurs et retards cotisation Imam">
      <div className="cotisation-analysis-heading">
        <h2>Indicateurs & Retards</h2>
        <p>Espace de contrôle interne réservé au Bureau de l'Association.</p>
        {source.key ? <small>Données locales lues depuis : {source.key}</small> : null}
      </div>

      <div className="cotisation-analysis-grid">
        <div className="cotisation-analysis-card">
          <span>Taux de recouvrement</span>
          <strong className={stats.tauxRecouvrement >= 70 ? 'positive' : 'warning'}>{stats.tauxRecouvrement}%</strong>
          <div className="cotisation-progress" aria-hidden="true">
            <span style={{ width: `${Math.min(100, stats.tauxRecouvrement)}%` }} />
          </div>
        </div>

        <div className="cotisation-analysis-card">
          <span>Total encaissé</span>
          <strong>{formatDh(stats.totalEncaisse)}</strong>
          <small>Sur un attendu de {formatDh(stats.totalAttendu)}</small>
        </div>

        <div className="cotisation-analysis-card">
          <span>Reste à recouvrer</span>
          <strong className={stats.resteARecouvrer > 0 ? 'danger' : 'positive'}>{formatDh(stats.resteARecouvrer)}</strong>
        </div>

        <div className="cotisation-analysis-card">
          <span>Foyers exonérés</span>
          <strong>{stats.foyersExoneres.length} / {stats.totalFoyers}</strong>
          <small>Solidarité communautaire du douar</small>
        </div>
      </div>

      <div className="cotisation-late-panel">
        <h3>Liste des foyers en retard ({stats.foyersEnRetard.length})</h3>
        {stats.foyersEnRetard.length === 0 ? (
          <p className="cotisation-good-state">Aucun foyer en retard dans les données locales de cet appareil.</p>
        ) : (
          <div className="cotisation-late-table-wrap">
            <table className="cotisation-late-table">
              <thead>
                <tr>
                  <th>Famille</th>
                  <th>Période</th>
                  <th>Dû</th>
                  <th>Payé</th>
                  <th>Note Bureau</th>
                </tr>
              </thead>
              <tbody>
                {stats.foyersEnRetard.map((foyer) => {
                  const retardMontant = Math.max(0, foyer.montantDu - foyer.montantPaye);
                  return (
                    <tr key={foyer.id}>
                      <td>
                        <strong>{foyer.nom}</strong>
                        {foyer.repere ? <span dir="auto">{foyer.repere}</span> : null}
                      </td>
                      <td>{foyer.periode || '-'}</td>
                      <td>{formatDh(foyer.montantDu)}</td>
                      <td>{formatDh(foyer.montantPaye)}</td>
                      <td>{foyer.observationPrivee || '-'} {retardMontant > 0 ? `(${formatDh(retardMontant)} en retard)` : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default StatsCotisation;
