import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type {
  AuthorProfile,
  AuthorSubmission,
  BookListing,
  ContactMessage,
  PaymentRecord,
  ReadingProgressItem,
  SiteSettings,
  UserProfile,
} from '../types/models';

export async function fetchApprovedBooks(): Promise<BookListing[]> {
  try {
    const q = query(
      collection(db, 'books'),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookListing, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'books');
  }
}

export async function fetchAllBooksAdmin(): Promise<BookListing[]> {
  try {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookListing, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'books');
  }
}

export async function fetchBookById(bookId: string): Promise<BookListing | null> {
  try {
    const snap = await getDoc(doc(db, 'books', bookId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<BookListing, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `books/${bookId}`);
  }
}

export async function fetchApprovedAuthors(): Promise<AuthorProfile[]> {
  try {
    const q = query(
      collection(db, 'authors'),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuthorProfile, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'authors');
  }
}

export async function fetchAllAuthorsAdmin(): Promise<AuthorProfile[]> {
  try {
    const q = query(collection(db, 'authors'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuthorProfile, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'authors');
  }
}

export async function fetchAuthorById(authorId: string): Promise<AuthorProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'authors', authorId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<AuthorProfile, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `authors/${authorId}`);
  }
}

export async function fetchUserSubmissions(uid: string): Promise<AuthorSubmission[]> {
  try {
    const q = query(collection(db, 'submissions'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuthorSubmission, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'submissions');
  }
}

export async function fetchAllSubmissionsAdmin(): Promise<AuthorSubmission[]> {
  try {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuthorSubmission, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'submissions');
  }
}

export async function fetchUserPayments(uid: string): Promise<PaymentRecord[]> {
  try {
    const q = query(collection(db, 'payments'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  }
}

export async function fetchAllPaymentsAdmin(): Promise<PaymentRecord[]> {
  try {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  }
}

export async function fetchAllReadersAdmin(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function fetchAllMessagesAdmin(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'contact_messages');
  }
}

export async function fetchUserReadingProgress(uid: string): Promise<ReadingProgressItem[]> {
  try {
    const q = query(collection(db, 'reading_progress'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReadingProgressItem, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reading_progress');
  }
}

export async function saveBookAdmin(id: string, payload: Omit<BookListing, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) {
  const ref = doc(db, 'books', id);
  try {
    if (isNew) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `books/${id}`);
  }
}

export async function deleteBookAdmin(id: string) {
  try {
    await deleteDoc(doc(db, 'books', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
  }
}

export async function saveAuthorAdmin(id: string, payload: Omit<AuthorProfile, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) {
  const ref = doc(db, 'authors', id);
  try {
    if (isNew) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `authors/${id}`);
  }
}

export async function deleteAuthorAdmin(id: string) {
  try {
    await deleteDoc(doc(db, 'authors', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `authors/${id}`);
  }
}

export async function saveSiteSettingsAdmin(settings: Omit<SiteSettings, 'updatedAt'>) {
  const ref = doc(db, 'site_settings', 'main');
  try {
    await setDoc(ref, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
  }
}
