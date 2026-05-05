import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseAuthClient } from '../lib/supabaseClient';
import {
  base64ToSalt,
  deriveKeyFromPassword,
  generateSalt,
  saltToBase64,
} from '../lib/encryption';

const VAULT_SALT_META_KEY = 'vault_salt';

type AuthContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  loading: boolean;
  authBusy: boolean;
  vaultKey: CryptoKey | null;
  signIn: (
    email: string,
    password: string,
    publicComputer: boolean,
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    publicComputer: boolean,
  ) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  unlockVault: (masterPassword: string) => Promise<{ error: Error | null }>;
  lockVault: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient>(() =>
    createSupabaseAuthClient(true),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session: next } }) => {
      if (!cancelled) {
        setSession(next);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setVaultKey(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const lockVault = useCallback(() => {
    setVaultKey(null);
  }, []);

  const unlockVault = useCallback(
    async (masterPassword: string) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        return { error: new Error(userErr?.message ?? 'Không có phiên đăng nhập') };
      }

      const u = userData.user;
      let saltB64 = u.user_metadata?.[VAULT_SALT_META_KEY] as string | undefined;

      if (!saltB64) {
        const salt = generateSalt();
        saltB64 = saltToBase64(salt);
        const { error: updErr } = await supabase.auth.updateUser({
          data: { [VAULT_SALT_META_KEY]: saltB64 },
        });
        if (updErr) {
          return { error: new Error(updErr.message) };
        }
      }

      try {
        const salt = base64ToSalt(saltB64);
        const key = await deriveKeyFromPassword(masterPassword, salt);
        setVaultKey(key);
        return { error: null };
      } catch {
        return { error: new Error('Không thể tạo khóa mã hóa') };
      }
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string, publicComputer: boolean) => {
      setAuthBusy(true);
      try {
        const persist = !publicComputer;
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session) {
          await supabase.auth.signOut();
        }

        const client = createSupabaseAuthClient(persist);
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: new Error(error.message) };
        }

        setSupabase(client);
        setSession(data.session ?? null);
        setVaultKey(null);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Đăng nhập thất bại') };
      } finally {
        setAuthBusy(false);
      }
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, publicComputer: boolean) => {
      setAuthBusy(true);
      try {
        const persist = !publicComputer;
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session) {
          await supabase.auth.signOut();
        }

        const client = createSupabaseAuthClient(persist);
        const { data, error } = await client.auth.signUp({ email, password });

        if (error) {
          return { error: new Error(error.message), needsEmailConfirmation: false };
        }

        setSupabase(client);
        setSession(data.session ?? null);
        setVaultKey(null);
        return {
          error: null,
          needsEmailConfirmation: !data.session,
        };
      } catch (err) {
        return {
          error: err instanceof Error ? err : new Error('Đăng ký thất bại'),
          needsEmailConfirmation: false,
        };
      } finally {
        setAuthBusy(false);
      }
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    setVaultKey(null);
    await supabase.auth.signOut();
    const defaultClient = createSupabaseAuthClient(true);
    setSupabase(defaultClient);
    setSession(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      loading,
      authBusy,
      vaultKey,
      signIn,
      signUp,
      signOut,
      unlockVault,
      lockVault,
    }),
    [
      supabase,
      session,
      loading,
      authBusy,
      vaultKey,
      signIn,
      signUp,
      signOut,
      unlockVault,
      lockVault,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
