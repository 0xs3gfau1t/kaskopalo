import {
  collection,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import {
  initializeQueue,
  processMarkDone,
  processSkip,
} from './turnEngine.js';

export function getTurnQueueRef(householdId, choreId, modeKey) {
  return doc(db, 'households', householdId, 'chores', choreId, 'turnQueues', modeKey);
}

/**
 * Ensures turn queue document exists in Firestore for a given mode
 */
export async function ensureQueueExists(householdId, choreId, modeKey, modeLabel, memberUids) {
  const qRef = getTurnQueueRef(householdId, choreId, modeKey);
  const snap = await getDoc(qRef);

  if (!snap.exists()) {
    const initial = initializeQueue(modeKey, modeLabel, memberUids);
    await setDoc(qRef, {
      ...initial,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return initial;
  }
  return snap.data();
}

/**
 * Transaction-safe mark done
 */
export async function advanceMarkDone(householdId, choreId, modeKey, doneByUid) {
  const qRef = getTurnQueueRef(householdId, choreId, modeKey);

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(qRef);
    if (!snap.exists()) {
      throw new Error('Turn queue not found');
    }

    const currentData = snap.data();
    const updated = processMarkDone(currentData, doneByUid);

    transaction.update(qRef, {
      currentIndex: updated.currentIndex,
      debt: updated.debt,
      updatedAt: serverTimestamp(),
    });

    return updated;
  });
}

/**
 * Transaction-safe skip
 */
export async function advanceSkip(householdId, choreId, modeKey, skipUid) {
  const qRef = getTurnQueueRef(householdId, choreId, modeKey);

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(qRef);
    if (!snap.exists()) {
      throw new Error('Turn queue not found');
    }

    const currentData = snap.data();
    const updated = processSkip(currentData, skipUid);

    transaction.update(qRef, {
      currentIndex: updated.currentIndex,
      debt: updated.debt,
      updatedAt: serverTimestamp(),
    });

    return updated;
  });
}
