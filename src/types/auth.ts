import type { ModuleKey, PermissionAction, RoutePath, UserRole } from './roles';

export type AuthProvider = 'none' | 'supabase_future' | 'custom_future';
export type AuthStatus = 'not_configured' | 'anonymous' | 'authenticated' | 'expired' | 'loading';
export type SessionAuditEvent = 'login' | 'logout' | 'refresh' | 'password_reset_requested' | 'role_changed' | 'session_expired';

export type AuthTenantScope = {
  associationId?: string;
  douarId?: string;
};

export type UserIdentity = AuthTenantScope & {
  id: string;
  displayName: string;
  phone?: string;
  email?: string;
  preferredLanguage: 'fr' | 'ar' | 'tzm';
  role: UserRole;
};

export type UserSession = {
  status: AuthStatus;
  provider: AuthProvider;
  user?: UserIdentity;
  issuedAt?: string;
  expiresAt?: string;
  sessionId?: string;
  tokenPreview?: never;
};

export type AuthState = {
  configured: boolean;
  status: AuthStatus;
  session: UserSession | null;
  lastCheckedAt?: string;
  reason?: string;
};

export type ProtectedRouteRule = {
  route: RoutePath;
  allowedRoles: UserRole[];
  requiredModule?: ModuleKey;
  requiredAction?: PermissionAction;
  publicFallbackRoute: RoutePath;
};

export type ModuleAccessRule = {
  module: ModuleKey;
  allowedRoles: UserRole[];
  actions: PermissionAction[];
};

export type PasswordRecoveryRequest = {
  identifier: string;
  requestedAt: string;
  deliveryChannel: 'email' | 'sms' | 'whatsapp_future';
};

export type SessionAuditEntry = AuthTenantScope & {
  id: string;
  userId?: string;
  event: SessionAuditEvent;
  at: string;
  role?: UserRole;
  note?: string;
};

export type FutureTokenPolicy = {
  accessTokenTtlMinutes: number;
  refreshTokenRotation: boolean;
  requireServerSideRoleCheck: boolean;
  storeTokensInBrowser: false;
};
