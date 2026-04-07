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
import { getAuthErrorMessage } from '../utils/authErrors';

export type AuthUser = CachedUser;

type AuthContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  busy: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseUser(fbUser: User): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoutInProgress = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = await loadCachedUser();
      if (cancelled || !cached) return;
      setUser((prev) => prev ?? cached);
    })();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUser(fbUser);
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
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
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
