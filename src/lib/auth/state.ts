import type { AuthState, UserSession } from '../../types/auth';

export const authArchitectureStatus = 'not_configured' as const;

export const anonymousSession: UserSession = {
  status: 'not_configured',
  provider: 'none',
};

export function getInitialAuthState(): AuthState {
  return {
    configured: false,
    status: 'not_configured',
    session: anonymousSession,
    lastCheckedAt: new Date().toISOString(),
    reason: 'Real authentication is not connected yet.',
  };
}

export function assertAuthNotConnected() {
  return true;
}
