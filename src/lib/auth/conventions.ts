import type { FutureTokenPolicy } from '../../types/auth';

export const futureTokenPolicy: FutureTokenPolicy = {
  accessTokenTtlMinutes: 30,
  refreshTokenRotation: true,
  requireServerSideRoleCheck: true,
  storeTokensInBrowser: false,
};

export const authConventions = {
  publicArea: 'Routes publiques lisibles sans session future.',
  internalArea: 'Routes internes exigeant session valide et role bureau ou president.',
  administrativeArea: 'Operations sensibles reservees au president et aux permissions serveur futures.',
  passwordRecovery: 'Flux futur gere par fournisseur auth, jamais par stockage local.',
  sessionAudit: 'Journal futur des evenements de session, sans exposer de token.',
} as const;
