import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Goals = {
  exerciseDaysPerWeek: number | null;
  minSleepHours: number | null;
};

const DEFAULT_GOALS: Goals = {
  exerciseDaysPerWeek: null,
  minSleepHours: null,
};

export async function saveGoals(uid: string, goals: Goals): Promise<void> {
  const ref = doc(db, 'habits', uid, 'meta', 'goals');
  await setDoc(ref, goals);
}

export async function getGoals(uid: string): Promise<Goals> {
  const ref = doc(db, 'habits', uid, 'meta', 'goals');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Goals) : DEFAULT_GOALS;
}
