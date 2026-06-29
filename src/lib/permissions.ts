import type { ModuleKey, PermissionAction, RoutePath, UserRole } from '../types/roles';

type PermissionRule = {
  roles: UserRole[];
  actions: PermissionAction[];
};

const publicRoles: UserRole[] = ['habitant', 'adherent', 'soutien', 'bureau', 'president'];
const internalRoles: UserRole[] = ['bureau', 'president'];
export const modulePermissions: Record<ModuleKey, PermissionRule> = {
  publicHome: { roles: publicRoles, actions: ['view'] },
  publicExplorer: { roles: publicRoles, actions: ['view'] },
  login: { roles: publicRoles, actions: ['view'] },
  habitantLogin: { roles: publicRoles, actions: ['view'] },
  bureauHome: { roles: internalRoles, actions: ['view'] },
  presidentHome: { roles: ['president'], actions: ['view'] },
  publicRegistration: { roles: publicRoles, actions: ['view', 'create'] },
  residentSpace: { roles: publicRoles, actions: ['view'] },
  publicAnnouncements: { roles: publicRoles, actions: ['view'] },
  publicDocuments: { roles: publicRoles, actions: ['view'] },
  publicReports: { roles: publicRoles, actions: ['view', 'create'] },
  publicDouars: { roles: publicRoles, actions: ['view'] },
  joinPlatform: { roles: publicRoles, actions: ['view', 'create'] },
  about: { roles: publicRoles, actions: ['view'] },
  oralMemory: { roles: publicRoles, actions: ['view'] },
  heritage: { roles: publicRoles, actions: ['view'] },
  timeline: { roles: publicRoles, actions: ['view'] },
  communityMap: { roles: publicRoles, actions: ['view'] },
  projects: { roles: publicRoles, actions: ['view'] },
  bureauProjects: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  events: { roles: publicRoles, actions: ['view'] },
  bureauEvents: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  youth: { roles: publicRoles, actions: ['view'] },
  bureauYouth: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  solidarity: { roles: publicRoles, actions: ['view'] },
  bureauSolidarity: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  water: { roles: publicRoles, actions: ['view'] },
  bureauWater: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  agriculture: { roles: publicRoles, actions: ['view'] },
  bureauAgriculture: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  diaspora: { roles: publicRoles, actions: ['view'] },
  bureauDiaspora: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  cooperatives: { roles: publicRoles, actions: ['view'] },
  bureauCooperatives: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  registrationRequests: { roles: internalRoles, actions: ['view', 'update', 'validate', 'archive'] },
  bureauAnnouncements: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete'] },
  bureauDocuments: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete'] },
  meetingDocuments: { roles: internalRoles, actions: ['view', 'archive'] },
  bureauReports: { roles: internalRoles, actions: ['view', 'update', 'archive'] },
  bureauOralMemory: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete'] },
  bureauHeritage: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete'] },
  bureauTimeline: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete'] },
  bureauCommunityMap: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete'] },
  members: { roles: internalRoles, actions: ['view', 'create', 'update'] },
  contributions: { roles: internalRoles, actions: ['view', 'create', 'update', 'archive'] },
  contactsAuthorities: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  fieldCollection: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  actionPlan: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  internalTasks: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  administrativeProcedures: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  meetingsDecisions: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  localBackup: { roles: internalRoles, actions: ['view', 'delete', 'archive'] },
  presidentInternalSteering: { roles: ['president'], actions: ['view'] },
  presidentContentEditor: { roles: ['president'], actions: ['view', 'create', 'update', 'delete', 'validate'] },
  presidentOrchid: { roles: ['president'], actions: ['view'] },
  presidentStrategicDossiers: { roles: ['president'], actions: ['view', 'update'] },
  presidentCensus: { roles: ['president'], actions: ['view'] },
  associationRenewal: { roles: internalRoles, actions: ['view', 'create', 'update', 'delete', 'archive'] },
  workflows: { roles: internalRoles, actions: ['view', 'update', 'validate', 'archive'] },
  statistics: { roles: internalRoles, actions: ['view'] },
  mosque: { roles: internalRoles, actions: ['view', 'create', 'update', 'validate'] },
};

export const routeModules: Record<RoutePath, ModuleKey> = {
  '/': 'publicHome',
  '/explorer': 'publicExplorer',
  '/login': 'login',
  '/connexion-habitant': 'habitantLogin',
  '/bureau': 'bureauHome',
  '/president': 'presidentHome',
  '/inscription': 'publicRegistration',
  '/habitant': 'residentSpace',
  '/a-propos': 'about',
  '/annonces': 'publicAnnouncements',
  '/documents-publics': 'publicDocuments',
  '/signalement': 'publicReports',
  '/douars': 'publicDouars',
  '/douars/:slug': 'publicDouars',
  '/rejoindre': 'joinPlatform',
  '/memoire-orale': 'oralMemory',
  '/patrimoine': 'heritage',
  '/chronologie': 'timeline',
  '/carte': 'communityMap',
  '/carte-communautaire': 'communityMap',
  '/projets': 'projects',
  '/evenements': 'events',
  '/jeunesse': 'youth',
  '/entraide': 'solidarity',
  '/eau': 'water',
  '/agriculture': 'agriculture',
  '/diaspora': 'diaspora',
  '/cooperatives': 'cooperatives',
  '/membres': 'members',
  '/cotisations': 'contributions',
  '/bureau/inscriptions': 'registrationRequests',
  '/bureau/annonces': 'bureauAnnouncements',
  '/bureau/documents-publics': 'bureauDocuments',
  '/bureau/documents-reunion': 'meetingDocuments',
  '/bureau/signalements': 'bureauReports',
  '/bureau/memoire-orale': 'bureauOralMemory',
  '/bureau/patrimoine': 'bureauHeritage',
  '/bureau/chronologie': 'bureauTimeline',
  '/bureau/carte-communautaire': 'bureauCommunityMap',
  '/bureau/projets': 'bureauProjects',
  '/bureau/evenements': 'bureauEvents',
  '/bureau/jeunesse': 'bureauYouth',
  '/bureau/entraide': 'bureauSolidarity',
  '/bureau/eau': 'bureauWater',
  '/bureau/agriculture': 'bureauAgriculture',
  '/bureau/diaspora': 'bureauDiaspora',
  '/bureau/cooperatives': 'bureauCooperatives',
  '/bureau/contacts': 'contactsAuthorities',
  '/bureau/collecte-terrain': 'fieldCollection',
  '/bureau/plan-action': 'actionPlan',
  '/bureau/taches': 'internalTasks',
  '/bureau/demarches': 'administrativeProcedures',
  '/bureau/reunions': 'meetingsDecisions',
  '/bureau/sauvegarde': 'localBackup',
  '/president/pilotage-interne': 'presidentInternalSteering',
  '/president/editeur-contenu': 'presidentContentEditor',
  '/president/orchid': 'presidentOrchid',
  '/president/dossiers-strategiques': 'presidentStrategicDossiers',
  '/president/recensement': 'presidentCensus',
  '/bureau/membres': 'members',
  '/bureau/cotisations': 'contributions',
  '/bureau/renouvellement': 'associationRenewal',
  '/bureau/workflows': 'workflows',
  '/bureau/workflow-publication': 'workflows',
  '/bureau/statistiques': 'statistics',
  '/bureau/mosquee': 'mosque',
};

export function hasPermission(role: UserRole, module: ModuleKey, action: PermissionAction = 'view') {
  const permission = modulePermissions[module];
  return permission.roles.includes(role) && permission.actions.includes(action);
}

export function canAccessRoute(route: RoutePath, role: UserRole) {
  return hasPermission(role, routeModules[route], 'view');
}

export function getVisibleModules(role: UserRole) {
  return Object.entries(modulePermissions)
    .filter(([, permission]) => permission.roles.includes(role))
    .map(([module]) => module as ModuleKey);
}

export function isInternalRoute(route: RoutePath) {
  return route === '/bureau' || route === '/president' || route.startsWith('/bureau/') || route.startsWith('/president/') || route === '/membres' || route === '/cotisations';
}

export const permissionArchitectureNote = 'Frontend permissions are an interface structure only until real backend authentication and server-side authorization are added.';

