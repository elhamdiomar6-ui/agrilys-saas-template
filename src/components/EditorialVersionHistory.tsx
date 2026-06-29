import { History, RotateCcw } from 'lucide-react';
import type { EditorialVersion } from '../lib/editorialVersions';

type EditorialVersionHistoryProps = {
  versions: EditorialVersion[];
  restoring: boolean;
  onRestore: (version: EditorialVersion) => void;
};

export default function EditorialVersionHistory({
  versions,
  restoring,
  onRestore,
}: EditorialVersionHistoryProps) {
  return (
    <section className="editor-history-section">
      <div className="editor-history-heading">
        <History size={22} />
        <div>
          <h2>Historique des versions</h2>
          <p>Chaque publication et changement de média conserve l’état précédent.</p>
        </div>
      </div>
      {versions.length === 0 ? (
        <p className="empty-state">Aucune version antérieure enregistrée.</p>
      ) : (
        <div className="editor-history-list">
          {versions.map((version) => (
            <article className="editor-history-item" key={version.id}>
              <div>
                <strong>{version.action}</strong>
                <span>{new Intl.DateTimeFormat('fr-MA', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(version.createdAt))}</span>
              </div>
              <button
                className="secondary-action"
                type="button"
                disabled={restoring}
                onClick={() => onRestore(version)}
              >
                <RotateCcw size={17} /> Restaurer
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
