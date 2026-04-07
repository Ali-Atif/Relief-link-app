import { removeItem, setItem, getItem } from './storage';

/** AsyncStorage key for a small JSON snapshot of the signed-in user (offline-friendly). */
export const CACHED_USER_KEY = 'relieflink_cached_user';

export type CachedUser = {
  uid: string;
  email: string | null;
  displayName?: string | null;
};

export async function saveCachedUser(user: CachedUser): Promise<void> {
  await setItem(CACHED_USER_KEY, JSON.stringify(user));
}

export async function loadCachedUser(): Promise<CachedUser | null> {
  const raw = await getItem(CACHED_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedUser;
  } catch {
    return null;
  }
}

export async function clearCachedUser(): Promise<void> {
  await removeItem(CACHED_USER_KEY);
}
