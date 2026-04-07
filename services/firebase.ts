/**
 * Single Firebase app instance + Auth + Firestore.
 *
 * Import `auth` / `db` from here everywhere else so you never create duplicate apps.
 * Web SDK is used (Expo); Metro needs `metro.config.js` package exports for subpaths.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  type Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './firebaseConfig';

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();

/**
 * Firebase Auth (modular v9+ API). Session + tokens are mirrored in AsyncStorage
 * via `authCache.ts` so the app can restore “signed in” state offline.
 */
export const auth: Auth = getAuth(app);
/** Firestore — NGO incident reports (online path). */
export const db: Firestore = getFirestore(app);
export { app };

/** Re-export auth helpers so screens can import from one module if you prefer. */
export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
};
