import { createClient } from '@supabase/supabase-js';

declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  from: (input: string, encoding: 'base64') => { toString: (encoding: 'utf-8') => string };
};

function captureError(error: unknown, context?: Record<string, unknown>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  const logData = { timestamp: new Date().toISOString(), error: errorMessage, stack: errorStack, context };
  console.error('[API-Error]', JSON.stringify(logData));
}

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type OrchidRequestBody = {
  agentId?: string;
  message?: string;
  locale?: string;
  history?: Array<{ role?: string; content?: string }>;
  file?: OrchidFilePayload;
  audio?: OrchidAudioPayload;
};

type OrchidFilePayload = {
  base64?: string;
  mediaType?: string;
  fileName?: string;
  scanMode?: boolean;
};

type OrchidAudioPayload = {
  base64?: string;
  mediaType?: string;
  durationSeconds?: number;
};

type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const ANTHROPIC_FALLBACK_MODELS = (
  process.env.ANTHROPIC_FALLBACK_MODELS ||
  'claude-haiku-4-5-20251001'
)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);
const MAX_INLINE_BASE64_LENGTH = 3_700_000;
const ALLOWED_AUDIO_TYPES = new Set(['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav']);
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const LANG_RULE = `INSTRUCTION PRIORITAIRE - LANGUE :
Tu detectes automatiquement la langue de chaque message.
Si le message contient des caracteres arabes -> reponds en arabe ou en darija selon le registre utilise.
Si le message est en francais -> reponds en francais uniquement, SAUF si l'utilisateur demande explicitement une traduction ou reponse en darija.
Si l'utilisateur demande explicitement "darija", "دارجة", "بالدارجة" ou une traduction en darija -> reponds en darija marocaine, meme si le message est en francais.
La darija marocaine est la langue prioritaire pour les habitants du douar. Tu la maitrises et tu l'utilises naturellement quand demandee.
Ne melange JAMAIS le francais et l'arabe dans une meme reponse sauf si l'utilisateur le fait lui-meme.
`;

function localeLanguageRule(locale?: string) {
  if (locale === 'ar') {
    return `INSTRUCTION PRIORITAIRE - LOCALE INTERFACE :
La locale de l'interface est ar.
Tu dois repondre en arabe uniquement, meme si le contexte systeme contient du francais.
Ne traduis pas en francais et ne melange pas les langues.
`;
  }
  if (locale === 'fr') {
    return `INSTRUCTION PRIORITAIRE - LOCALE INTERFACE :
La locale de l'interface est fr.
Tu dois repondre en francais uniquement, sauf si l'utilisateur ecrit explicitement en arabe.
Ne melange pas les langues.
`;
  }
  return '';
}

const ASSO_NAME = process.env.ASSOCIATION_NAME || "Agadir N'Tguida";
const ASSO_PLACE = process.env.ASSOCIATION_PLACE || "Douar Agadir N'Tguida, Commune de Boutrouch, Caidat de Lakhsass, Province de Sidi Ifni, Region Guelmim-Oued Noun, Maroc";
const ASSO_EMAIL = process.env.ASSOCIATION_EMAIL || 'agadirnetguida.asso@gmail.com';
const ASSO_URL = process.env.ASSOCIATION_URL || 'agadirnetguida.com';
const ASSO_EXTRA = process.env.ASSOCIATION_EXTRA_CONTEXT || '';

const ASSOCIATION_CONTEXT = `
ASSOCIATION : Association ${ASSO_NAME} pour le developpement et la cooperation.
Adresse : ${ASSO_PLACE}.
Email officiel : ${ASSO_EMAIL}.
Application : ${ASSO_URL} - React, Vite, Supabase, Vercel.${ASSO_EXTRA ? `\n${ASSO_EXTRA}` : ''}

MISSIONS PRINCIPALES :
- Preservation et valorisation du patrimoine culturel amazigh.
- Developpement du tourisme culturel et rural responsable.
- Soutien aux cooperatives locales et aux produits du terroir.
- Renforcement du lien entre habitants, bureau, president et diaspora.
- Developpement rural integre, sobre et durable.

REGLES ORCHID :
- Ne jamais exposer de donnees personnelles non validees.
- Ne jamais publier un document officiel sans validation du bureau.
- Repondre de facon utile, prudente, concrete et adaptee a la realite du douar.
- Proposer des actions simples, realistes et respectueuses de la dignite des habitants.
- Eviter les reponses generales ou vagues. Chaque reponse doit contenir des elements concrets :
  decision possible, action recommandee, risque a verifier, document a preparer,
  personne ou instance a consulter, ou prochaine etape operationnelle.
- Distinguer clairement ce qui est confirme, ce qui est probable, et ce qui doit etre verifie.
- Quand la demande est floue, poser 1 a 3 questions utiles ou proposer une premiere reponse structuree.

FORMAT DE REPONSE — REGLES STRICTES :
- ZERO emoji. Aucun symbole decoratif (pas de ✅ ❌ 🔇 💡 👉 🚨 💰 📢 ou similaires).
- ZERO separateur horizontal (pas de --- ni de ===).
- ZERO menu numerote style chatbot ("1. Option A / 2. Option B / 3. Option C").
  Si tu proposes des choix, formule-les en prose naturelle.
- Pas de titres en majuscules decoratives type "### 🔇 Fonctionnalite Audio — Non disponible".
- Tu es un conseiller senior, pas un chatbot de service client. Ton ton est direct, professionnel et concis.
- Format acceptable : texte court, bullet points sobres si necessaire, une ou deux sections max avec titres simples.
- Longueur adaptee a la question : reponse courte si la question est simple, detaillee si la question est complexe.
`;

const AGENT_PROMPTS: Record<string, string> = {
  directeur: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es ORCHID, directeur general et assistant strategique interne du President.
Tu coordonnes tous les agents : juridique, financier, patrimoine, communication, financement, technique, architecte, agronome, hydraulique, energie, sante, urbaniste, diaspora, cooperatives.
REFLEXE DONNEES : commence chaque session par statistiques_globales pour avoir une vue complete. Utilise lister_inscriptions pour les demandes en cours, lister_cotisations pour la sante financiere, lister_signalements pour les urgences terrain, lister_annonces pour la communication recente.
Fournis des analyses strategiques basees sur les donnees reelles, pas sur des hypotheses.`,

  juridique: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller juridique de l'association.
Tu aides sur statuts, PV, gouvernance, depot administratif, regles de publication et prudence documentaire.
REFLEXE DONNEES : lister_inscriptions pour analyser les demandes d'adhesion (type, statut, volume), lister_habitants pour connaitre les membres actifs. Si une decision d'inscription est a prendre, utilise approuver_inscription / recommander_inscription / rejeter_inscription apres confirmation.
Donne des avis precis bases sur les donnees reelles de l'association.`,

  financier: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller financier de l'association.
Tu aides sur cotisations, budget, suivi interne, recettes, depenses et prudence comptable.
REFLEXE DONNEES : lister_cotisations est ton outil principal — appelle-le systematiquement pour connaitre les foyers a jour, en retard et exoneres. statistiques_globales pour les chiffres globaux. Identifie les foyers en retard, estime les recettes potentielles, propose des actions de relance concretes basees sur les vraies donnees.`,

  patrimoine: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller patrimoine de l'association.
Tu aides sur les sites patrimoniaux, l'inventaire terrain, le tourisme culturel et les risques de sensibilite.
REFLEXE DONNEES : lister_signalements pour identifier les signalements lies au patrimoine (dommages, acces, degradation). lister_habitants pour mobiliser des habitants sur des projets patrimoniaux. Fournis des analyses concretes basees sur l'etat reel du terrain.`,

  communication: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller communication de l'association.
Tu aides a preparer des messages clairs, sobres, bilingues et institutionnels.
REFLEXE DONNEES : lister_annonces pour voir ce qui a deja ete publie et eviter les doublons. statistiques_globales pour ancrer les messages dans la realite chiffree. Si tu proposes une annonce, utilise creer_annonce (brouillon par defaut, toujours demander confirmation avant).`,

  financement: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller financement de l'association.
Tu aides a identifier des pistes de subventions, dossiers, ONG et partenaires publics sans promesse excessive.
REFLEXE DONNEES : statistiques_globales pour les chiffres a inclure dans les dossiers (membres actifs, habitants, signalements traites). lister_cotisations pour la demonstration de la capacite de gestion. Appuie chaque recommandation sur des donnees reelles.`,

  technique: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller technique de l'application agadirnetguida.com.
Tu aides sur la securite, Supabase, Vercel, modules et priorites de correction.
Tables multi-douars preparees : douars, associations_profils, cooperatives_profils. Routes : /douars, /cooperatives, /rejoindre.
REFLEXE DONNEES : statistiques_globales pour evaluer la charge (nombre d'utilisateurs, inscriptions, signalements). lister_signalements pour les bugs ou problemes techniques signales par les habitants. Donne des diagnostics precis bases sur l'etat reel du systeme.`,

  architecte: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es un architecte et ingenieur en genie civil expert en construction rurale marocaine.
Ton role est de donner une pre-analyse de terrain utile, jamais une validation technique definitive.
Quand tu recois une photo ou une description :
- evalue l'etat apparent du batiment, mur, toit, piste ou ouvrage ;
- identifie les risques prioritaires pour les habitants ;
- propose des mesures immediates de securite ;
- suggere des solutions avec materiaux locaux : pierre, terre, chaux, bois, techniques traditionnelles amazighes ;
- estime les ordres de grandeur en MAD quand c'est raisonnable ;
- liste les artisans ou professionnels a consulter ;
- indique quand il faut un architecte, ingenieur structure, commune ou autorisation.
Pour fissures, effondrement, toiture, electricite ou risques de chute : recommander de securiser la zone et de faire valider par un professionnel qualifie.
REFLEXE DONNEES : lister_signalements pour voir les problemes de batiment ou infrastructure deja signales par les habitants. lister_habitants pour estimer le nombre de foyers concernes par un probleme structurel.
Reponds toujours avec diagnostic probable, risques, actions urgentes, photos/mesures a collecter, estimation simple et prochaine etape.`,

  agronome: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es un ingenieur agronome specialiste de l'agriculture rurale Anti-Atlas, Sidi Ifni et zones arides.
Tu aides sur cultures, sols, irrigation, rendements, maladies, cooperative et adaptation climatique.
Tu connais les cultures adaptees : argan, amandier, figuier, orge, safran, henne et plantes aromatiques.
Quand tu recois une photo ou description :
- identifie les signes visibles sur sol, feuilles, eau, plantation ou rendement ;
- propose des causes probables et ce qui doit etre verifie ;
- recommande des solutions simples, peu couteuses et accessibles a un petit agriculteur ;
- indique les erreurs a eviter ;
- propose les questions a poser a l'ONCA, technicien agricole ou cooperative ;
- mentionne les pistes bio, economie d'eau et valorisation locale.
REFLEXE DONNEES : lister_signalements pour les problemes agricoles ou d'eau signalementes. lister_habitants pour estimer le nombre d'agriculteurs concernes.
Ne promets jamais un rendement certain. Donne des hypotheses, observations a collecter et actions graduelles.`,

  hydraulique: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es un ingenieur eau et hydraulique specialiste des zones rurales arides marocaines.
Tu aides sur eau potable, puits, sources, irrigation, citernes, assainissement rural, pompage solaire et economie d'eau.
Quand tu recois une photo ou description :
- diagnostique le probleme d'eau apparent ;
- distingue urgence sanitaire, manque d'eau, fuite, stockage, irrigation ou assainissement ;
- propose des solutions techniques adaptees au douar ;
- estime les ordres de grandeur en MAD si possible ;
- indique les mesures a collecter : debit, profondeur, distance, hauteur, qualite, saison ;
- identifie les organismes possibles : commune, ONEE/ONEP, INDH, agences de bassin, technicien local.
REFLEXE DONNEES : lister_signalements filtre sur 'eau' pour voir tous les problemes hydriques signales. statistiques_globales pour connaitre le nombre de foyers concernes.
Pour eau potable et sante : recommander analyse de qualite et validation par service competent.`,

  energie: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es un ingenieur energie solaire specialise des installations rurales marocaines.
Tu aides sur eclairage public solaire, pompage, kits domestiques, autonomie energetique et maintenance locale.
Quand tu recois une demande :
- clarifie les besoins : nombre de lampes, pompe, heures, puissance, distance, budget ;
- propose un dimensionnement approximatif prudent ;
- estime cout total, maintenance et economie possible ;
- indique les composants : panneaux, batterie, regulateur, onduleur, pompe, supports ;
- liste les erreurs a eviter : sous-dimensionnement, batterie faible, ombrage, mauvais cablage ;
- propose une solution maintenable localement.
REFLEXE DONNEES : lister_signalements pour les pannes ou manques d'eclairage signales. statistiques_globales pour dimensionner en fonction du nombre de foyers.
Precise toujours qu'un installateur qualifie doit valider le dimensionnement final et la securite electrique.`,

  sante: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es un conseiller en sante communautaire rurale marocaine.
IMPORTANT : tu donnes des informations de prevention, orientation et premiers reflexes. Tu ne remplaces jamais un medecin.
Pour urgence medicale, recommander d'appeler le 150 ou de rejoindre la structure de sante la plus proche.
Tu aides sur hygiene, eau, prevention, scorpion, serpent, deshydratation, infections, sante maternelle et infantile, vaccination et orientation.
Regles strictes :
- ne jamais prescrire de medicament ;
- ne jamais poser un diagnostic certain ;
- donner les signes d'alerte ;
- recommander consultation medicale quand necessaire ;
- proteger la confidentialite des personnes.
REFLEXE DONNEES : lister_signalements pour les problemes de sante ou d'hygiene signales collectivement. lister_habitants pour estimer les populations vulnerables (sans entrer dans les details personnels).
Reponds avec : signes a surveiller, gestes prudents, ce qu'il ne faut pas faire, qui contacter, urgence ou suivi.`,

  urbaniste: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es un urbaniste et amenageur rural specialiste des douars marocains.
Tu aides sur routes, chemins, espaces communs, place, mosquee, ecole, souk, signaletique, patrimoine et qualite de vie.
Quand tu recois une photo ou description :
- analyse l'espace, ses usages et ses conflits ;
- propose un amenagement simple, sobre et respectueux du patrimoine ;
- distingue ce qui releve du douar, de la commune, de la province ou d'une autorisation ;
- estime les phases : urgent, important, a suivre ;
- propose les donnees a collecter : longueur, largeur, pente, acces, photos, usagers, risques ;
- prepare si utile une note courte pour la commune ou un partenaire.
REFLEXE DONNEES : lister_signalements pour les problemes d'espace public ou de voirie signales. statistiques_globales pour le nombre de foyers et d'habitants affectes par un amenagement.
Priorite : preserver l'identite du douar tout en ameliorant securite, acces, proprete et dignite.`,

  diaspora: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller diaspora de l'association.
Tu aides a mobiliser les MRE avec dignite, transparence et actions realistes.
REFLEXE DONNEES : statistiques_globales pour presenter un bilan honnete a la diaspora. lister_annonces pour voir les derniers messages envoyes. lister_cotisations pour identifier les foyers soutenus par des MRE et evaluer les besoins de financement.
Base chaque appel a la diaspora sur des chiffres reels, pas sur des promesses vagues.`,

  cooperatives: `${LANG_RULE}
${ASSOCIATION_CONTEXT}
Tu es le conseiller cooperatives de l'association.
Tu aides sur produits locaux, valorisation rurale, organisation et presentation aux partenaires.
REFLEXE DONNEES : lister_habitants pour identifier les membres potentiellement impliques dans des cooperatives. statistiques_globales pour dimensionner les projets. lister_annonces pour voir les derniers appels lances sur les cooperatives.
Propose des actions concretes ancrées dans la realite du nombre de membres actifs.`,
};

function getBearerToken(req: VercelRequest) {
  const raw = req.headers.authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function normalizeBody(body: unknown): OrchidRequestBody {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as OrchidRequestBody;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object') return body as OrchidRequestBody;
  return {};
}

function cleanHistory(history: OrchidRequestBody['history']) {
  return (history || [])
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .slice(-10)
    .map((item) => ({
      role: item.role as 'user' | 'assistant',
      content: String(item.content || '').slice(0, 4000),
    }))
    .filter((item) => item.content.trim().length > 0);
}

function validateFilePayload(file: OrchidRequestBody['file']) {
  if (!file) return { ok: true as const, file: null };

  const base64 = typeof file.base64 === 'string' ? file.base64.trim() : '';
  const mediaType = typeof file.mediaType === 'string' ? file.mediaType.trim() : '';
  const fileName = typeof file.fileName === 'string' ? file.fileName.trim().slice(0, 180) : 'document';

  if (!base64 || !mediaType) {
    return { ok: false as const, error: 'Fichier incomplet.' };
  }
  if (!ALLOWED_FILE_TYPES.has(mediaType)) {
    return { ok: false as const, error: 'Format de fichier non supporte.' };
  }
  if (base64.length > MAX_INLINE_BASE64_LENGTH) {
    return { ok: false as const, error: 'Fichier trop volumineux apres compression.' };
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return { ok: false as const, error: 'Fichier invalide.' };
  }

  return { ok: true as const, file: { base64, mediaType, fileName } };
}

function validateAudioPayload(audio: OrchidRequestBody['audio']) {
  if (!audio) return { ok: true as const, audio: null };

  const base64 = typeof audio.base64 === 'string' ? audio.base64.trim() : '';
  const mediaType = typeof audio.mediaType === 'string' ? audio.mediaType.trim() : '';
  const durationSeconds = Number(audio.durationSeconds || 0);

  if (!base64 || !mediaType) {
    return { ok: false as const, error: 'Audio incomplet.' };
  }
  if (!ALLOWED_AUDIO_TYPES.has(mediaType)) {
    return { ok: false as const, error: 'Format audio non supporte.' };
  }
  if (base64.length > MAX_INLINE_BASE64_LENGTH) {
    return { ok: false as const, error: 'Audio trop volumineux apres compression.' };
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return { ok: false as const, error: 'Audio invalide.' };
  }

  return {
    ok: true as const,
    audio: {
      base64,
      mediaType,
      durationSeconds: Number.isFinite(durationSeconds) ? Math.max(0, Math.round(durationSeconds)) : 0,
    },
  };
}

function fileToContentBlock(file: { base64: string; mediaType: string; fileName: string }): AnthropicContentBlock {
  if (file.mediaType === 'application/pdf') {
    return {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: file.base64,
      },
    };
  }

  if (file.mediaType.startsWith('image/')) {
    return {
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.mediaType,
        data: file.base64,
      },
    };
  }

  const decoded = Buffer.from(file.base64, 'base64').toString('utf-8').slice(0, 24000);
  return {
    type: 'text',
    text: `Contenu du fichier "${file.fileName}" :\n\n${decoded}`,
  };
}

function getAnthropicModelsToTry() {
  return Array.from(new Set([ANTHROPIC_MODEL, ...ANTHROPIC_FALLBACK_MODELS].filter(Boolean)));
}

function shouldRetryAnthropicModel(status: number, details: string) {
  return status === 404 || details.includes('not_found_error') || details.includes('model:');
}

const TOOLS_INSTRUCTIONS = `
COMPORTEMENT AGENT — ACCES DIRECT A LA BASE DE DONNEES :
Tu disposes d'outils qui interrogent la base en temps reel. Les donnees ci-dessus (snapshot) sont un apercu ; les outils donnent les details complets et a jour.

REGLE ABSOLUE : des qu'une question porte sur des donnees, des chiffres, des noms ou des statuts → appelle l'outil adequat IMMEDIATEMENT, sans demander permission, sans expliquer ce que tu vas faire, sans attendre.

QUEL OUTIL POUR QUELLE QUESTION :
- Inscriptions / demandes / adherents / membres en attente, recommandes, approuves ou rejetes → lister_inscriptions (filtre par status si besoin)
- Liste des habitants / membres actifs / comptes crees → lister_habitants
- Signalements / problemes / eau / route / eclairage / proprete / securite → lister_signalements
- Cotisations / foyers / retard / a jour / exoneres / impayés / finances → lister_cotisations
- Annonces / publications / actualites / communiques → lister_annonces
- Bilan general / etat de l'association / tableau de bord / vue d'ensemble → statistiques_globales
- Si la question est large ou strategique : appelle statistiques_globales en premier, puis les outils specifiques si besoin.

INTERDICTIONS STRICTES :
- Ne JAMAIS repondre "je n'ai pas acces aux donnees" — les outils sont operationnels et autorises.
- Ne JAMAIS utiliser uniquement le snapshot quand un outil peut donner une reponse plus precise.
- Ne JAMAIS demander confirmation avant un outil de lecture.
- Ne JAMAIS inventer des chiffres — appelle toujours l'outil pour verifier.

ACTIONS IRREVERSIBLES (approbation, rejet, creation d'annonce) :
1. Presente clairement ce que tu vas faire et les details de l'action.
2. Demande une confirmation explicite OUI/NON.
3. N'appelle l'outil qu'apres confirmation.
4. Resumes le resultat de l'action avec son statut.
Note : l'approbation met status=approved uniquement — le PIN est genere via l'interface Bureau/inscriptions.
`;

const ORCHID_TOOLS = [
  {
    name: 'lister_inscriptions',
    description: 'Liste les demandes d\'inscription filtrées par statut. Utilise pour répondre aux questions sur les inscrits, demandes en attente, recommandées, approuvées ou rejetées.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['pending', 'under_review', 'approved', 'rejected'], description: 'Filtrer par statut. Omis = tous.' },
        limite: { type: 'number', description: 'Nombre max de résultats (défaut 20).' },
      },
    },
  },
  {
    name: 'lister_habitants',
    description: 'Liste les habitants avec compte actif dans l\'application.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limite: { type: 'number', description: 'Nombre max (défaut 20).' },
      },
    },
  },
  {
    name: 'lister_signalements',
    description: 'Liste les signalements des habitants (eau, route, éclairage, propreté, sécurité, autre). Peut filtrer par statut.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['sent', 'in_progress', 'resolved'], description: 'Filtrer par statut.' },
        limite: { type: 'number', description: 'Nombre max (défaut 10).' },
      },
    },
  },
  {
    name: 'lister_cotisations',
    description: 'Liste les foyers et leur statut de cotisation. Peut filtrer par statut (a_jour, en_retard, exonere, a_verifier).',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['a_jour', 'en_retard', 'exonere', 'a_verifier'], description: 'Filtrer par statut de cotisation.' },
        limite: { type: 'number', description: 'Nombre max (défaut 30).' },
      },
    },
  },
  {
    name: 'lister_annonces',
    description: 'Liste les annonces de l\'association issues du workflow de publication.',
    input_schema: {
      type: 'object' as const,
      properties: {
        statut: { type: 'string', enum: ['publie', 'brouillon', 'en_attente', 'rejete', 'archive'], description: 'Filtrer par statut (défaut: publie).' },
        limite: { type: 'number', description: 'Nombre max (défaut 10).' },
      },
    },
  },
  {
    name: 'statistiques_globales',
    description: 'Résumé chiffré complet : inscriptions par statut, habitants actifs, signalements, cotisations, annonces. Utilise pour donner un état général de l\'application.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'approuver_inscription',
    description: 'Approuve une demande d\'inscription (marque status=approved). DEMANDER CONFIRMATION avant d\'appeler. La génération du PIN se finalise via l\'interface Bureau.',
    input_schema: {
      type: 'object' as const,
      properties: {
        request_id: { type: 'string', description: 'ID UUID de la demande d\'inscription.' },
      },
      required: ['request_id'],
    },
  },
  {
    name: 'recommander_inscription',
    description: 'Marque une demande comme recommandée par le bureau (under_review). DEMANDER CONFIRMATION avant.',
    input_schema: {
      type: 'object' as const,
      properties: {
        request_id: { type: 'string', description: 'ID UUID de la demande.' },
      },
      required: ['request_id'],
    },
  },
  {
    name: 'rejeter_inscription',
    description: 'Rejette définitivement une demande d\'inscription. DEMANDER CONFIRMATION et raison avant.',
    input_schema: {
      type: 'object' as const,
      properties: {
        request_id: { type: 'string', description: 'ID UUID de la demande.' },
        raison: { type: 'string', description: 'Raison du rejet (optionnel mais recommandé).' },
      },
      required: ['request_id'],
    },
  },
  {
    name: 'mettre_a_jour_signalement',
    description: 'Met à jour le statut d\'un signalement et/ou ajoute une note interne.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'ID UUID du signalement.' },
        status: { type: 'string', enum: ['sent', 'in_progress', 'resolved'], description: 'Nouveau statut.' },
        note: { type: 'string', description: 'Note interne à ajouter (optionnel).' },
      },
      required: ['id'],
    },
  },
  {
    name: 'creer_annonce',
    description: 'Crée une nouvelle annonce dans le workflow de publication. MONTRER le contenu à l\'utilisateur et DEMANDER CONFIRMATION avant de créer.',
    input_schema: {
      type: 'object' as const,
      properties: {
        titre: { type: 'string', description: 'Titre de l\'annonce.' },
        contenu: { type: 'string', description: 'Corps de l\'annonce.' },
        statut: { type: 'string', enum: ['brouillon', 'publie'], description: 'brouillon (défaut) ou publie.' },
      },
      required: ['titre', 'contenu'],
    },
  },
];

async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  admin: any,
  userId?: string | null
): Promise<string> {
  try {
    switch (toolName) {
      case 'lister_inscriptions': {
        const limite = Math.min(Number(input.limite) || 20, 50);
        let query = admin
          .from('registration_requests')
          .select('id,full_name,phone,requested_status,status,created_at,message')
          .order('created_at', { ascending: false })
          .limit(limite);
        if (typeof input.status === 'string') query = query.eq('status', input.status);
        const { data, error } = await query;
        if (error) return `Erreur lister_inscriptions: ${error.message}`;
        if (!data?.length) return 'Aucune inscription trouvée.';
        return (data as any[])
          .map((r: any) => `[${r.status}] ${r.full_name} — ${r.requested_status} — ${r.created_at?.slice(0, 10)} — ID: ${r.id}`)
          .join('\n');
      }

      case 'lister_habitants': {
        const limite = Math.min(Number(input.limite) || 20, 100);
        const { data, error } = await admin
          .from('user_profiles')
          .select('id,full_name,phone,status,membership_status,address_in_village,created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limite);
        if (error) return `Erreur lister_habitants: ${error.message}`;
        if (!data?.length) return 'Aucun habitant actif trouvé.';
        return (data as any[])
          .map((h: any) => `${h.full_name} — ${h.phone || '?'} — ${h.membership_status || '?'} — ${h.address_in_village || ''}`)
          .join('\n');
      }

      case 'lister_signalements': {
        const limite = Math.min(Number(input.limite) || 10, 30);
        let query = admin
          .from('resident_reports')
          .select('id,category,level,description,status,internal_note,created_at')
          .order('created_at', { ascending: false })
          .limit(limite);
        if (typeof input.status === 'string') query = query.eq('status', input.status);
        const { data, error } = await query;
        if (error) return `Erreur lister_signalements: ${error.message}`;
        if (!data?.length) return 'Aucun signalement trouvé.';
        return (data as any[])
          .map((r: any) => `[${r.status}] [${r.category}] niveau ${r.level} — ${String(r.description || '').slice(0, 120)} — ${r.created_at?.slice(0, 10)} — ID: ${r.id}`)
          .join('\n');
      }

      case 'lister_cotisations': {
        const limite = Math.min(Number(input.limite) || 30, 200);
        const { data, error } = await admin
          .from('cotisation_foyers')
          .select('id,nom,telephone,statut,notes')
          .eq('statut', 'actif')
          .limit(limite);
        if (error) return `Erreur lister_cotisations: ${error.message}`;
        if (!data?.length) return 'Aucun foyer trouvé.';
        const filterStatus = typeof input.status === 'string' ? input.status : null;
        const rows = (data as any[]).map((row: any) => {
          let cotisStatus = 'a_verifier';
          try {
            const notes = typeof row.notes === 'string' && row.notes ? JSON.parse(row.notes) : {};
            if (typeof notes.status === 'string') cotisStatus = notes.status;
          } catch { /* ignore */ }
          return { nom: row.nom, telephone: row.telephone, cotisStatus };
        });
        const filtered = filterStatus ? rows.filter((r) => r.cotisStatus === filterStatus) : rows;
        if (!filtered.length) return `Aucun foyer avec statut cotisation "${filterStatus}".`;
        return filtered.map((r) => `[${r.cotisStatus}] ${r.nom} — ${r.telephone || '?'}`).join('\n');
      }

      case 'lister_annonces': {
        const limite = Math.min(Number(input.limite) || 10, 30);
        const statutFilter = typeof input.statut === 'string' ? input.statut : 'publie';
        const { data, error } = await admin
          .from('content_workflow')
          .select('id,titre,contenu,statut,publie_le,soumis_le,created_at')
          .eq('content_type', 'annonce')
          .eq('statut', statutFilter)
          .order('created_at', { ascending: false })
          .limit(limite);
        if (error) return `Erreur lister_annonces: ${error.message}`;
        if (!data?.length) return `Aucune annonce avec statut "${statutFilter}".`;
        return (data as any[])
          .map((a: any) => `[${a.statut}] ${a.titre} — ${(a.publie_le || a.soumis_le || a.created_at)?.slice(0, 10)} — ID: ${a.id}\n  ${String(a.contenu || '').slice(0, 200)}`)
          .join('\n\n');
      }

      case 'statistiques_globales': {
        const [
          inscPending, inscReview, inscApproved, inscRejected,
          habitants, signalSent, signalInProgress, signalResolved,
          cotisData, annonces,
        ] = await Promise.all([
          admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'under_review'),
          admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
          admin.from('user_profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          admin.from('resident_reports').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
          admin.from('resident_reports').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
          admin.from('resident_reports').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
          admin.from('cotisation_foyers').select('notes').eq('statut', 'actif').limit(500),
          admin.from('content_workflow').select('id', { count: 'exact', head: true }).eq('content_type', 'annonce').eq('statut', 'publie'),
        ]);
        let cAJour = 0, cEnRetard = 0, cExonere = 0, cAVerifier = 0;
        for (const row of cotisData.data ?? []) {
          try {
            const notes = typeof (row as any).notes === 'string' && (row as any).notes ? JSON.parse((row as any).notes) : {};
            const st = typeof notes.status === 'string' ? notes.status : 'a_verifier';
            if (st === 'a_jour') cAJour++;
            else if (st === 'en_retard') cEnRetard++;
            else if (st === 'exonere') cExonere++;
            else cAVerifier++;
          } catch { cAVerifier++; }
        }
        return [
          'STATISTIQUES GLOBALES :',
          '',
          'INSCRIPTIONS :',
          `  En attente (pending) : ${inscPending.count ?? '?'}`,
          `  En cours bureau (under_review) : ${inscReview.count ?? '?'}`,
          `  Approuvées : ${inscApproved.count ?? '?'}`,
          `  Rejetées : ${inscRejected.count ?? '?'}`,
          `  Habitants actifs : ${habitants.count ?? '?'}`,
          '',
          'SIGNALEMENTS :',
          `  Envoyés (non traités) : ${signalSent.count ?? '?'}`,
          `  En cours : ${signalInProgress.count ?? '?'}`,
          `  Résolus : ${signalResolved.count ?? '?'}`,
          '',
          'COTISATIONS :',
          `  À jour : ${cAJour}`,
          `  En retard : ${cEnRetard}`,
          `  Exonérés : ${cExonere}`,
          `  À vérifier : ${cAVerifier}`,
          '',
          `ANNONCES PUBLIÉES : ${annonces.count ?? '?'}`,
        ].join('\n');
      }

      case 'approuver_inscription': {
        const reqId = String(input.request_id || '');
        if (!reqId) return 'Erreur: request_id manquant.';
        const { error } = await admin
          .from('registration_requests')
          .update({ status: 'approved', decided_at: new Date().toISOString() })
          .eq('id', reqId)
          .eq('status', 'under_review');
        if (error) return `Erreur approuver_inscription: ${error.message}`;
        return `Inscription ${reqId} approuvée. La génération du PIN se finalise via l'interface Bureau/inscriptions.`;
      }

      case 'recommander_inscription': {
        const reqId = String(input.request_id || '');
        if (!reqId) return 'Erreur: request_id manquant.';
        const { error } = await admin
          .from('registration_requests')
          .update({ status: 'under_review' })
          .eq('id', reqId)
          .eq('status', 'pending');
        if (error) return `Erreur recommander_inscription: ${error.message}`;
        return `Inscription ${reqId} marquée comme recommandée par le bureau (under_review).`;
      }

      case 'rejeter_inscription': {
        const reqId = String(input.request_id || '');
        if (!reqId) return 'Erreur: request_id manquant.';
        const raison = typeof input.raison === 'string' ? input.raison : '';
        const { error } = await admin
          .from('registration_requests')
          .update({ status: 'rejected', decided_at: new Date().toISOString(), decision_note: raison || null })
          .eq('id', reqId);
        if (error) return `Erreur rejeter_inscription: ${error.message}`;
        return `Inscription ${reqId} rejetée.${raison ? ` Raison: ${raison}` : ''}`;
      }

      case 'mettre_a_jour_signalement': {
        const id = String(input.id || '');
        if (!id) return 'Erreur: id manquant.';
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (typeof input.status === 'string') updates.status = input.status;
        if (typeof input.note === 'string') updates.internal_note = input.note;
        const { error } = await admin.from('resident_reports').update(updates).eq('id', id);
        if (error) return `Erreur mettre_a_jour_signalement: ${error.message}`;
        return `Signalement ${id} mis à jour (${Object.keys(updates).filter((k) => k !== 'updated_at').join(', ')}).`;
      }

      case 'creer_annonce': {
        const titre = String(input.titre || '').trim();
        const contenu = String(input.contenu || '').trim();
        if (!titre || !contenu) return 'Erreur: titre et contenu requis.';
        const statut = input.statut === 'publie' ? 'publie' : 'brouillon';
        const now = new Date().toISOString();
        const { error } = await admin.from('content_workflow').insert({
          content_type: 'annonce',
          titre,
          contenu,
          statut,
          soumis_le: now,
          publie_le: statut === 'publie' ? now : null,
          ...(userId ? { auteur_id: userId } : {}),
        });
        if (error) return `Erreur creer_annonce: ${error.message}`;
        return `Annonce créée : "${titre}" (statut: ${statut}). Visible dans Bureau → Annonces.`;
      }

      default:
        return `Outil inconnu: ${toolName}`;
    }
  } catch (err) {
    return `Erreur outil ${toolName}: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function isPresident(token: string) {
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: userResult, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userResult.user) {
    return { ok: false, userId: null };
  }

  const appRole = userResult.user.app_metadata?.role;
  if (appRole === 'president' || appRole === 'platform_admin') {
    return { ok: true, userId: userResult.user.id };
  }

  const roleClient = SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : userClient;

  const { data: profile, error: profileError } = await roleClient
    .from('user_profiles')
    .select('id')
    .eq('user_id', userResult.user.id)
    .maybeSingle();

  if (profileError || !profile?.id) {
    if (profileError) console.warn('ORCHID role profile lookup failed:', profileError.message);
    return { ok: false, userId: userResult.user.id };
  }

  const { data: assignment, error: assignmentError } = await roleClient
    .from('role_assignments')
    .select('role,status')
    .eq('user_profile_id', profile.id)
    .eq('role', 'president')
    .eq('status', 'active')
    .maybeSingle();

  if (assignmentError) {
    console.warn('ORCHID role assignment lookup failed:', assignmentError.message);
  }

  return { ok: Boolean(assignment), userId: userResult.user.id };
}

async function fetchDataSnapshot(): Promise<string> {
  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) return '';
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const today = new Date().toISOString().slice(0, 10);

    const [
      reqPending,
      reqRecommended,
      reqApproved,
      habitantsActifs,
      reports,
      announcements,
      cotisations,
    ] = await Promise.all([
      admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'under_review'),
      admin.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      admin.from('user_profiles').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('membership_status', 'active'),
      admin.from('resident_reports').select('id,category,level,status').in('status', ['sent', 'in_progress']).order('created_at', { ascending: false }).limit(10),
      admin.from('content_workflow').select('titre,publie_le').eq('content_type', 'annonce').eq('statut', 'publie').order('publie_le', { ascending: false }).limit(5),
      admin.from('cotisation_foyers').select('nom,statut,notes').eq('statut', 'actif').limit(300),
    ]);

    const lines: string[] = [
      '',
      `=== DONNEES EN TEMPS REEL (snapshot du ${today}) ===`,
    ];

    // Inscriptions
    lines.push('');
    lines.push('INSCRIPTIONS :');
    lines.push(`  - En attente de traitement bureau (pending) : ${reqPending.count ?? '?'}`);
    lines.push(`  - Recommandees par le bureau, en attente president (under_review) : ${reqRecommended.count ?? '?'}`);
    lines.push(`  - Approuvees total (comptes crees) : ${reqApproved.count ?? '?'}`);
    lines.push(`  - Habitants avec compte actif en ce moment : ${habitantsActifs.count ?? '?'}`);

    // Signalements
    const openReports = reports.data ?? [];
    lines.push('');
    lines.push(`SIGNALEMENTS OUVERTS : ${openReports.length}`);
    if (openReports.length > 0) {
      for (const r of openReports) {
        lines.push(`  - [${r.category ?? 'autre'}] niveau ${r.level ?? '?'} — statut : ${r.status}`);
      }
    } else {
      lines.push('  Aucun signalement ouvert en ce moment.');
    }

    // Cotisations
    const foyerRows = cotisations.data ?? [];
    let aJour = 0, enRetard = 0, exonere = 0, aVerifier = 0;
    for (const row of foyerRows) {
      try {
        const notes = typeof row.notes === 'string' && row.notes ? JSON.parse(row.notes) : {};
        const st = typeof notes.status === 'string' ? notes.status : 'a_verifier';
        if (st === 'a_jour') aJour++;
        else if (st === 'en_retard') enRetard++;
        else if (st === 'exonere') exonere++;
        else aVerifier++;
      } catch {
        aVerifier++;
      }
    }
    lines.push('');
    lines.push(`COTISATIONS (foyers actifs suivis : ${foyerRows.length}) :`);
    lines.push(`  - A jour : ${aJour}`);
    lines.push(`  - En retard : ${enRetard}`);
    lines.push(`  - Exoneres : ${exonere}`);
    lines.push(`  - A verifier : ${aVerifier}`);

    // Annonces
    const recentAnnouncements = announcements.data ?? [];
    lines.push('');
    lines.push(`DERNIERES ANNONCES PUBLIEES (${recentAnnouncements.length}) :`);
    if (recentAnnouncements.length > 0) {
      for (const a of recentAnnouncements) {
        lines.push(`  - ${a.publie_le?.slice(0, 10) ?? '?'} : ${a.titre ?? '?'}`);
      }
    } else {
      lines.push('  Aucune annonce publiee pour le moment.');
    }

    lines.push('');
    lines.push('=== FIN DONNEES TEMPS REEL ===');

    return lines.join('\n');
  } catch {
    return '';
  }
}

async function saveConversation(params: {
  agentId: string;
  userId: string;
  userMessage: string;
  assistantReply: string;
}) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('ORCHID persistence skipped: SUPABASE_SERVICE_ROLE_KEY missing.');
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabaseAdmin.from('orchid_conversations').insert([
    {
      agent_id: params.agentId,
      role: 'user',
      content: params.userMessage,
      created_by: params.userId,
    },
    {
      agent_id: params.agentId,
      role: 'assistant',
      content: params.assistantReply,
      created_by: params.userId,
    },
  ]);

  if (error) {
    console.error('ORCHID persistence error:', error.message);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({
      error: 'Configuration Supabase serveur ORCHID incomplete.',
      missing: [
        ...(!SUPABASE_URL ? ['SUPABASE_URL ou VITE_SUPABASE_URL'] : []),
        ...(!SUPABASE_ANON_KEY ? ['SUPABASE_ANON_KEY ou VITE_SUPABASE_ANON_KEY'] : []),
      ],
    });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Session Supabase requise.' });
  }

  const presidentCheck = await isPresident(token);
  if (!presidentCheck.ok) {
    return res.status(403).json({ error: 'Acces reserve au President.' });
  }

  const body = normalizeBody(req.body);
  const agentId = String(body.agentId || 'directeur');
  const message = String(body.message || '').trim();
  const fileValidation = validateFilePayload(body.file);
  const audioValidation = validateAudioPayload(body.audio);

  if (!message) {
    return res.status(400).json({ error: 'Message requis.' });
  }
  if (message.length > 6000) {
    return res.status(400).json({ error: 'Message trop long.' });
  }
  if (!fileValidation.ok) {
    return res.status(400).json({ error: fileValidation.error });
  }
  if (!audioValidation.ok) {
    return res.status(400).json({ error: audioValidation.error });
  }
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({
      error: 'Configuration IA serveur ORCHID incomplete.',
      missing: ['ANTHROPIC_API_KEY'],
    });
  }

  const locale = typeof body.locale === 'string' ? body.locale.trim().toLowerCase() : '';
  const dataSnapshot = await fetchDataSnapshot();
  const systemPrompt = `${localeLanguageRule(locale)}\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.directeur}\n${TOOLS_INSTRUCTIONS}${dataSnapshot}`;
  const formattedHistory = cleanHistory(body.history);
  const audioContext = audioValidation.audio
    ? [
        message,
        '',
        `[Enregistrement audio de ${audioValidation.audio.durationSeconds}s recu - contexte : reunion de l'association Agadir N'Tguida.]`,
        "Le son brut n'est pas transcrit automatiquement dans cette version. Produis une trame utile, indique les informations a verifier, et demande une transcription ou des notes si necessaire.",
      ].join('\n')
    : null;
  const messages = audioContext
    ? [
        ...formattedHistory,
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: audioContext }],
        },
      ]
    : fileValidation.file
      ? [
          ...formattedHistory,
          {
          role: 'user' as const,
          content: [fileToContentBlock(fileValidation.file), { type: 'text' as const, text: message }],
        },
      ]
    : [...formattedHistory, { role: 'user' as const, content: message }];

  const agentAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let loopMessages: any[] = [...messages];
  let finalReply: string | null = null;
  const MAX_ITERATIONS = 6;

  outerLoop:
  for (const model of getAnthropicModelsToTry()) {
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: fileValidation.file || audioValidation.audio ? 3000 : 2500,
          system: systemPrompt,
          messages: loopMessages,
          tools: ORCHID_TOOLS,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error(`ORCHID Anthropic error [model=${model}, iter=${iter}]:`, details.slice(0, 1000));
        if (iter === 0 && shouldRetryAnthropicModel(response.status, details)) {
          break; // try next model
        }
        break outerLoop;
      }

      if (iter === 0 && model !== ANTHROPIC_MODEL) {
        console.warn(`ORCHID fallback model: ${model}`);
      }

      const data: any = await response.json();
      const stopReason: string = data?.stop_reason ?? 'end_turn';

      if (stopReason === 'tool_use') {
        const toolBlocks: any[] = (data?.content ?? []).filter((b: any) => b.type === 'tool_use');
        if (toolBlocks.length === 0) {
          const textBlock = (data?.content ?? []).find((b: any) => b.type === 'text');
          finalReply = textBlock?.text ?? null;
          break outerLoop;
        }

        loopMessages = [...loopMessages, { role: 'assistant', content: data.content }];

        const toolResults = await Promise.all(
          toolBlocks.map(async (tb: any) => ({
            type: 'tool_result' as const,
            tool_use_id: tb.id,
            content: await executeTool(tb.name, tb.input ?? {}, agentAdmin, presidentCheck.userId),
          }))
        );

        loopMessages = [...loopMessages, { role: 'user', content: toolResults }];
        continue;
      }

      // end_turn or other
      const textBlock = (data?.content ?? []).find((b: any) => b.type === 'text');
      finalReply = textBlock?.text ?? null;
      break outerLoop;
    }
  }

  if (finalReply === null) {
    return res.status(502).json({ error: 'Erreur du service IA.' });
  }

  const resolvedReply = finalReply.trim() || 'Réponse IA vide.';

  if (presidentCheck.userId) {
    await saveConversation({
      agentId,
      userId: presidentCheck.userId,
      userMessage: message,
      assistantReply: resolvedReply,
    });
  }

    return res.status(200).json({ reply: resolvedReply });
  } catch (error) {
    captureError(error, { endpoint: '/api/orchid/chat', method: req.method });
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur interne';
    return res.status(500).json({ error: 'Erreur serveur ORCHID.', details: errorMessage });
  }
}
