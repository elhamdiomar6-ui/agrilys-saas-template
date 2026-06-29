import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '../../types/roles';
import { requestHabitantSession } from '../habitants';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../supabaseClient';

type AuthContextValue = {
  isConfigured: boolean;
  configError: string | null;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  profileId: string | null;
  passwordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: UserRole | null }>;
  signInHabitant: (phone: string, pin: string) => Promise<{ error: string | null; role: UserRole | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const roleRank: Record<string, number> = {
  habitant: 10,
  adherent: 20,
  soutien: 15,
  bureau: 40,
  president: 50,
  platform_admin: 60,
};

function mapRole(role: string | null | undefined): UserRole | null {
  if (role === 'platform_admin') return 'president';
  if (role === 'president' || role === 'bureau' || role === 'habitant' || role === 'adherent' || role === 'soutien') return role;
  return null;
}

function roleFromAppMetadata(user: User): UserRole | null {
  const metadata = user.app_metadata as Record<string, unknown> | undefined;
  const roleValue = metadata && typeof metadata.role === 'string' ? metadata.role : null;
  return mapRole(roleValue);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const loadProfile = async (currentSession: Session | null): Promise<UserRole | null> => {
    if (!supabase || !currentSession?.user) {
      setRole(null);
      setProfileId(null);
      return null;
    }

    const appMetadataRole = roleFromAppMetadata(currentSession.user);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', currentSession.user.id)
      .maybeSingle();

    if (profileError || !profile?.id) {
      setRole(appMetadataRole);
      setProfileId(null);
      return appMetadataRole;
    }

    setProfileId(profile.id);

    const { data: assignments, error: roleError } = await supabase
      .from('role_assignments')
      .select('role,status')
      .eq('user_profile_id', profile.id)
      .eq('status', 'active');

    if (roleError || !assignments?.length) {
      setRole(appMetadataRole);
      return appMetadataRole;
    }

    const roles = [
      ...assignments.map((assignment) => assignment.role),
      ...(appMetadataRole ? [appMetadataRole] : []),
    ];
    const strongest = roles.sort((a, b) => (roleRank[b] || 0) - (roleRank[a] || 0))[0];
    const mappedRole = mapRole(strongest);
    setRole(mappedRole);
    return mappedRole;
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await loadProfile(data.session);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setPasswordRecovery(false);
      setSession(nextSession);
      loadProfile(nextSession).finally(() => setLoading(false));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isConfigured: isSupabaseConfigured,
    configError: supabaseConfigError,
    loading,
    session,
    user: session?.user ?? null,
    role,
    profileId,
    passwordRecovery,
    signIn: async (email: string, password: string) => {
      if (!supabase) return { error: 'Supabase non configuré.', role: null };
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return { error: error.message, role: null };
      }
      setSession(data.session);
      const signedInRole = await loadProfile(data.session);
      setLoading(false);
      return { error: null, role: signedInRole };
    },
    signInHabitant: async (phone: string, pin: string) => {
      if (!supabase) return { error: 'Supabase non configuré.', role: null };
      setLoading(true);
      try {
        const { tokenHash } = await requestHabitantSession(phone, pin);
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        });
        if (error || !data.session) {
          setLoading(false);
          return { error: error?.message || 'Session habitant non créée.', role: null };
        }
        setSession(data.session);
        const signedInRole = await loadProfile(data.session);
        setLoading(false);
        return { error: null, role: signedInRole };
      } catch (error) {
        setLoading(false);
        return {
          error: error instanceof Error ? error.message : 'Connexion habitant impossible.',
          role: null,
        };
      }
    },
    requestPasswordReset: async (email: string) => {
      if (!supabase) return { error: 'Supabase non configuré.' };
      const redirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return { error: error?.message ?? null };
    },
    updatePassword: async (password: string) => {
      if (!supabase) return { error: 'Supabase non configuré.' };
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) setPasswordRecovery(false);
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      setSession(null);
      setRole(null);
      setProfileId(null);
      setPasswordRecovery(false);
    },
    refreshProfile: async () => { await loadProfile(session); },
  }), [loading, passwordRecovery, profileId, role, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
