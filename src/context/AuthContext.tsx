import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
const VAULT_UNLOCK_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 60 * 60 * 1000;
const VAULT_PASSPHRASE_CACHE_KEY = 'vault_passphrase_cache';
const VAULT_PASSPHRASE_CACHE_EXP_KEY = 'vault_passphrase_cache_exp';

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
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
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
  const vaultLockTimerRef = useRef<number | null>(null);
  const sessionTimeoutRef = useRef<number | null>(null);

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
    window.sessionStorage.removeItem(VAULT_PASSPHRASE_CACHE_KEY);
    window.sessionStorage.removeItem(VAULT_PASSPHRASE_CACHE_EXP_KEY);
  }, []);

  useEffect(() => {
    if (vaultLockTimerRef.current) {
      window.clearTimeout(vaultLockTimerRef.current);
      vaultLockTimerRef.current = null;
    }
    if (!vaultKey) {
      return;
    }
    vaultLockTimerRef.current = window.setTimeout(() => {
      lockVault();
    }, VAULT_UNLOCK_TTL_MS);
    return () => {
      if (vaultLockTimerRef.current) {
        window.clearTimeout(vaultLockTimerRef.current);
        vaultLockTimerRef.current = null;
      }
    };
  }, [vaultKey, lockVault]);

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
        window.sessionStorage.setItem(VAULT_PASSPHRASE_CACHE_KEY, masterPassword);
        window.sessionStorage.setItem(
          VAULT_PASSPHRASE_CACHE_EXP_KEY,
          String(Date.now() + VAULT_UNLOCK_TTL_MS),
        );
        return { error: null };
      } catch {
        return { error: new Error('Không thể tạo khóa mã hóa') };
      }
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthBusy(true);
      try {
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session) {
          await supabase.auth.signOut();
        }

        const client = createSupabaseAuthClient(true);
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
    async (email: string, password: string) => {
      setAuthBusy(true);
      try {
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session) {
          await supabase.auth.signOut();
        }

        const client = createSupabaseAuthClient(true);
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

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    try {
      const base = import.meta.env.BASE_URL || '/';
      const normalizedBase = base.endsWith('/') ? base : `${base}/`;
      const redirectTo = `${window.location.origin}${normalizedBase}dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Đăng nhập Google thất bại') };
    } finally {
      setAuthBusy(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!session?.user || vaultKey) {
      return;
    }

    const cachedPassphrase = window.sessionStorage.getItem(VAULT_PASSPHRASE_CACHE_KEY);
    const cachedExp = Number(window.sessionStorage.getItem(VAULT_PASSPHRASE_CACHE_EXP_KEY) ?? '0');

    if (!cachedPassphrase || !Number.isFinite(cachedExp) || Date.now() >= cachedExp) {
      window.sessionStorage.removeItem(VAULT_PASSPHRASE_CACHE_KEY);
      window.sessionStorage.removeItem(VAULT_PASSPHRASE_CACHE_EXP_KEY);
      return;
    }

    void unlockVault(cachedPassphrase);
  }, [session?.user, vaultKey, unlockVault]);

  const signOut = useCallback(async () => {
    lockVault();
    await supabase.auth.signOut();
    const defaultClient = createSupabaseAuthClient(true);
    setSupabase(defaultClient);
    setSession(null);
  }, [supabase, lockVault]);

  useEffect(() => {
    if (sessionTimeoutRef.current) {
      window.clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    if (!session) {
      return;
    }
    sessionTimeoutRef.current = window.setTimeout(() => {
      void signOut();
    }, SESSION_TTL_MS);
    return () => {
      if (sessionTimeoutRef.current) {
        window.clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    };
  }, [session, signOut]);

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
      signInWithGoogle,
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
      signInWithGoogle,
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
