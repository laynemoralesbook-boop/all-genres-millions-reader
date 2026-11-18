import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  ADMIN_EMAILS,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
  type UserProfile,
} from '../types/models';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  authLoading: boolean;
  siteSettings: SiteSettings;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const settingsRef = doc(db, 'site_settings', 'main');
    const unsubscribe = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteSettings>;
          setSiteSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...data,
          });
        } else {
          setSiteSettings(DEFAULT_SITE_SETTINGS);
        }
      },
      (err) => {
        console.warn('Site settings listener note:', err.message);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadUserContext = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }

    const email = (firebaseUser.email || '').toLowerCase();
    let adminFlag = Boolean(
      firebaseUser.emailVerified && ADMIN_EMAILS.includes(email)
    );

    if (!adminFlag && firebaseUser.emailVerified) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) {
          adminFlag = true;
        }
      } catch {
        // Not an admin record
      }
    }
    setIsAdmin(adminFlag);

    try {
      const profileRef = doc(db, 'users', firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        await loadUserContext(firebaseUser);
      } catch (err) {
        console.error('Auth context load error:', err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    await loadUserContext(result.user);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    await loadUserContext(auth.currentUser);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        authLoading,
        siteSettings,
        signInWithGoogle,
        logout,
        refreshProfile,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export async function ensureReaderProfile(
  firebaseUser: User,
  overrides?: Partial<UserProfile>
): Promise<UserProfile> {
  const ref = doc(db, 'users', firebaseUser.uid);
  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const current = existing.data() as UserProfile;
      if (overrides) {
        const updated = {
          fullName: overrides.fullName ?? current.fullName,
          country: overrides.country ?? current.country,
          favoriteGenres: overrides.favoriteGenres ?? current.favoriteGenres,
          readingInterests: overrides.readingInterests ?? current.readingInterests,
          readingGoalBooks: overrides.readingGoalBooks ?? current.readingGoalBooks,
          booksReadCount: overrides.booksReadCount ?? current.booksReadCount,
          challengeJoined: overrides.challengeJoined ?? current.challengeJoined,
          challengeNotes: overrides.challengeNotes ?? current.challengeNotes,
          savedBookIds: overrides.savedBookIds ?? current.savedBookIds,
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, { ...current, ...updated }, { merge: true });
        return { ...current, ...updated };
      }
      return current;
    }

    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      fullName: overrides?.fullName || firebaseUser.displayName || 'Reader',
      email: firebaseUser.email || '',
      country: overrides?.country || '',
      favoriteGenres: overrides?.favoriteGenres || [],
      readingInterests: overrides?.readingInterests || '',
      readingGoalBooks: overrides?.readingGoalBooks ?? 12,
      booksReadCount: overrides?.booksReadCount ?? 0,
      challengeJoined: overrides?.challengeJoined ?? false,
      challengeNotes: overrides?.challengeNotes || '',
      savedBookIds: overrides?.savedBookIds || [],
      role: 'reader',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
  }
}
