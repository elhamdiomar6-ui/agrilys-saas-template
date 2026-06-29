import type { ModuleKey, PermissionAction, RoutePath, UserRole } from '../../types/roles';
import type { ProtectedRouteRule } from '../../types/auth';

export const futureProtectedRoutes: ProtectedRouteRule[] = [
  {
    route: '/membres',
    allowedRoles: ['bureau', 'president'],
    requiredModule: 'members',
    requiredAction: 'view',
    publicFallbackRoute: '/',
  },
  {
    route: '/cotisations',
    allowedRoles: ['bureau', 'president'],
    requiredModule: 'contributions',
    requiredAction: 'view',
    publicFallbackRoute: '/',
  },
  {
    route: '/bureau/workflows',
    allowedRoles: ['bureau', 'president'],
    requiredModule: 'workflows',
    requiredAction: 'view',
    publicFallbackRoute: '/',
  },
  {
    route: '/bureau/statistiques',
    allowedRoles: ['bureau', 'president'],
    requiredModule: 'statistics',
    requiredAction: 'view',
    publicFallbackRoute: '/',
  },
  {
    route: '/bureau/mosquee',
    allowedRoles: ['bureau', 'president'],
    requiredModule: 'mosque',
    requiredAction: 'view',
    publicFallbackRoute: '/',
  },
];

export function describeFutureAccess(route: RoutePath): ProtectedRouteRule | undefined {
  return futureProtectedRoutes.find((rule) => rule.route === route);
}

export function createModuleAccessRule(module: ModuleKey, allowedRoles: UserRole[], actions: PermissionAction[]) {
  return { module, allowedRoles, actions };
}
