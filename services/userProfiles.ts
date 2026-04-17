import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';

import { db } from './firebase';

export type UserRole = 'user' | 'ngo';

export type UserProfile = {
  uid: string;
  role: UserRole;
  email: string | null;
  displayName: string;
  ngoName?: string;
  registrationNumber?: string;
  phone?: string;
  address?: string;
  createdAtIso?: string;
};

const USER_PROFILES_COLLECTION = 'user_profiles';

function tsToIso(ts: Timestamp | null | undefined): string | undefined {
  if (!ts) return undefined;
  return ts.toDate().toISOString();
}

function mapDoc(snap: QueryDocumentSnapshot<DocumentData>): UserProfile {
  const data = snap.data();
  return {
    uid: snap.id,
    role: (data.role as UserRole) ?? 'user',
    email: (data.email as string | null | undefined) ?? null,
    displayName: (data.displayName as string | undefined) ?? 'Member',
    ngoName: data.ngoName as string | undefined,
    registrationNumber: data.registrationNumber as string | undefined,
    phone: data.phone as string | undefined,
    address: data.address as string | undefined,
    createdAtIso: tsToIso(data.createdAt as Timestamp | null | undefined),
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(
    doc(db, USER_PROFILES_COLLECTION, profile.uid),
    {
      uid: profile.uid,
      role: profile.role,
      email: profile.email ?? null,
      displayName: profile.displayName.trim(),
      ngoName: profile.ngoName?.trim() ?? null,
      registrationNumber: profile.registrationNumber?.trim() ?? null,
      phone: profile.phone?.trim() ?? null,
      address: profile.address?.trim() ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USER_PROFILES_COLLECTION, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: snap.id,
    role: (data.role as UserRole) ?? 'user',
    email: (data.email as string | null | undefined) ?? null,
    displayName: (data.displayName as string | undefined) ?? 'Member',
    ngoName: data.ngoName as string | undefined,
    registrationNumber: data.registrationNumber as string | undefined,
    phone: data.phone as string | undefined,
    address: data.address as string | undefined,
    createdAtIso: tsToIso(data.createdAt as Timestamp | null | undefined),
  };
}

export async function listNgoProfiles(): Promise<UserProfile[]> {
  const q = query(collection(db, USER_PROFILES_COLLECTION), where('role', '==', 'ngo'));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}
