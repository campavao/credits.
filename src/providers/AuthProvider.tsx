import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  profile: User | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  passwordRecovery: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error: Error | null }>;
  updateAvatarActors: (actorIds: number[]) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Fired when the user arrives via a password-reset email link.
        if (_event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error as Error | null };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    return { error: error as Error | null };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    // When "Confirm email" is ON in Supabase, sign-up succeeds but returns no
    // session — the user must click an emailed link before they can sign in.
    const needsConfirmation = !error && !data.session;
    return { error: error as Error | null, needsConfirmation };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const resetPassword = async (email: string) => {
    // The email link must return the user to the app; on web that's the current
    // origin (e.g. https://creditz.vercel.app). This URL must be allow-listed in
    // Supabase → Authentication → URL Configuration → Redirect URLs.
    const redirectTo = Platform.OS === 'web' ? window.location.origin : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setPasswordRecovery(false);
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setPasswordRecovery(false);
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  const updateDisplayName = async (name: string) => {
    if (!session?.user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('users')
      .update({ display_name: name, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    if (!error) await fetchProfile(session.user.id);
    return { error: error as Error | null };
  };

  const updateAvatarActors = async (actorIds: number[]) => {
    if (!session?.user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('users')
      .update({ avatar_actor_ids: actorIds, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    if (!error) await fetchProfile(session.user.id);
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signInWithPhone,
        verifyOtp,
        signUpWithPassword,
        signInWithPassword,
        resetPassword,
        updatePassword,
        passwordRecovery,
        signOut,
        refreshProfile,
        updateDisplayName,
        updateAvatarActors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
