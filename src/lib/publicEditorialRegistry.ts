import {
  homeEditorialCopy,
  explorerEditorialCopy,
  loginEditorialCopy,
  residentEditorialCopy,
} from '../data/appEditorialCopies';
import { documentsPublicsCopy } from '../pages/DocumentsPublics';
import { eauCopy } from '../pages/Eau';
import { evenementsCopy } from '../pages/Evenements';
import { projetsCopy } from '../pages/Projets';
import { memoireOraleCopy } from '../pages/MemoireOrale';
import { jeunesseCopy } from '../pages/Jeunesse';
import { entraideCopy } from '../pages/Entraide';
import { agricultureCopy } from '../pages/Agriculture';
import { cooperativesCopy } from '../pages/Cooperatives';
import { diasporaCopy } from '../pages/Diaspora';
import type { EditorialPageId } from './agadirHistoryContent';

export type GenericEditorialPage = {
  id: EditorialPageId;
  label: string;
  audioScriptId: string;
  localAudio: boolean;
  supportsImage: boolean;
  fallback: Record<'fr' | 'ar', Record<string, unknown>>;
};

function page(
  id: EditorialPageId,
  label: string,
  audioScriptId: string,
  fallback: unknown,
  options: { localAudio?: boolean; supportsImage?: boolean } = {},
): GenericEditorialPage {
  return {
    id,
    label,
    audioScriptId,
    localAudio: options.localAudio ?? true,
    supportsImage: options.supportsImage ?? false,
    fallback: fallback as GenericEditorialPage['fallback'],
  };
}

export const publicEditorialPages: GenericEditorialPage[] = [
  page('accueil', 'Accueil', 'home-guide', homeEditorialCopy, { supportsImage: true }),
  page('habitant', 'Services habitants', 'habitant', residentEditorialCopy),
  page('explorer', 'Explorer', 'explorer', explorerEditorialCopy),
  page('documents-publics', 'Documents publics', 'documents-publics', documentsPublicsCopy),
  page('eau', 'Eau et forage', 'eau', eauCopy),
  page('evenements', 'Événements', 'evenements', evenementsCopy),
  page('projets', 'Projets communautaires', 'projets', projetsCopy),
  page('memoire-orale', 'Mémoire orale', 'memoire-orale', memoireOraleCopy, { supportsImage: true }),
  page('jeunesse', 'Jeunesse', 'jeunesse', jeunesseCopy),
  page('entraide', 'Entraide', 'entraide', entraideCopy),
  page('agriculture', 'Agriculture', 'agriculture', agricultureCopy),
  page('cooperatives', 'Coopératives', 'cooperatives', cooperativesCopy),
  page('diaspora', 'Diaspora', 'diaspora', diasporaCopy),
  page('connexion', 'Connexion', 'connexion', loginEditorialCopy, { localAudio: false }),
];
