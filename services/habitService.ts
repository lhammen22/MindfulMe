import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type HabitEntry = {
  mood: number | null;
  sleep: number | null;
  exercise: boolean | null;
  gratitude: string;
  affirmation: string;
  createdAt: Timestamp;
};

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export async function saveEntry(uid: string, date: string, data: Partial<HabitEntry>) {
  const ref = doc(db, 'habits', uid, 'entries', date);
  await setDoc(ref, { ...data, updatedAt: Timestamp.now() }, { merge: true });
}

export async function getEntry(uid: string, date: string): Promise<HabitEntry | null> {
  const ref = doc(db, 'habits', uid, 'entries', date);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as HabitEntry) : null;
}

export async function getRecentEntries(uid: string, days = 7): Promise<Array<HabitEntry & { date: string }>> {
  const ref = collection(db, 'habits', uid, 'entries');
  const snap = await getDocs(ref);
  return snap.docs
    .map(d => ({ date: d.id, ...(d.data() as HabitEntry) }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days);
}
