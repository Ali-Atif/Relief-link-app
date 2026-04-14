/**
 * App-wide auth: Firebase when online, cached user in AsyncStorage when offline.
 * Screens use `useAuth()` — never import Firebase auth directly from screens.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from '../services/firebase';
import type { CachedUser } from '../services/authCache';
import { clearCachedUser, loadCachedUser, saveCachedUser } from '../services/authCache';
import { getUserProfile, saveUserProfile, type UserRole } from '../services/userProfiles';
import { getAuthErrorMessage } from '../utils/authErrors';

export type AuthUser = CachedUser;

type AuthContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  busy: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: {
    email: string;
    password: string;
    role: UserRole;
    displayName: string;
    ngoName?: string;
    phone?: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseUser(fbUser: User): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    role: 'user',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoutInProgress = useRef(false);
  /** While true, ignore transient Firebase session from `createUserWithEmailAndPassword` until `signOut` finishes. */
  const registrationInProgress = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = await loadCachedUser();
      if (cancelled || !cached) return;
      setUser((prev) => prev ?? cached);
    })();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        if (registrationInProgress.current) {
          setInitializing(false);
          return;
        }
        const profile = await getUserProfile(fbUser.uid);
        const mapped: AuthUser = profile
          ? {
              uid: profile.uid,
              email: profile.email,
              displayName: profile.displayName,
              role: profile.role,
              ngoName: profile.ngoName,
              phone: profile.phone,
              address: profile.address,
            }
          : mapFirebaseUser(fbUser);
        setUser(mapped);
        await saveCachedUser(mapped);
      } else if (logoutInProgress.current) {
        setUser(null);
      } else {
        const cached = await loadCachedUser();
        setUser(cached);
      }
      setInitializing(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (e) {
      setError(getAuthErrorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const register = useCallback(async (input: {
    email: string;
    password: string;
    role: UserRole;
    displayName: string;
    ngoName?: string;
    phone?: string;
    address?: string;
  }) => {
    setError(null);
    setBusy(true);
    registrationInProgress.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
      await saveUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        role: input.role,
        displayName: input.displayName.trim(),
        ngoName: input.ngoName,
        phone: input.phone,
        address: input.address,
      });
      await clearCachedUser();
      await signOut(auth);
      return true;
    } catch (e) {
      setError(getAuthErrorMessage(e));
      try {
        await clearCachedUser();
        await signOut(auth);
      } catch {
        /* ignore cleanup errors */
      }
      return false;
    } finally {
      registrationInProgress.current = false;
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    logoutInProgress.current = true;
    setBusy(true);
    try {
      await clearCachedUser();
      await signOut(auth);
      setUser(null);
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      logoutInProgress.current = false;
      setBusy(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      busy,
      error,
      clearError,
      login,
      register,
      logout,
    }),
    [user, initializing, busy, error, clearError, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
