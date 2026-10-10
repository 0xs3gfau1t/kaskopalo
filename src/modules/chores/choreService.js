import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';

export function getChoresCollection(householdId) {
  return collection(db, 'households', householdId, 'chores');
}

export async function addChore(householdId, name, existingChores, user) {
  const trimmed = (name || '').trim();
  if (trimmed.length === 0) {
    throw new Error('Chore name cannot be empty.');
  }
  if (trimmed.length > 50) {
    throw new Error('Chore name must be 50 characters or fewer.');
  }

  const isDuplicate = existingChores.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    throw new Error('A chore with this name already exists.');
  }

  const ref = await addDoc(getChoresCollection(householdId), {
    name: trimmed,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateChore(householdId, choreId, newName, existingChores) {
  const trimmed = (newName || '').trim();
  if (trimmed.length === 0) {
    throw new Error('Chore name cannot be empty.');
  }

  const isDuplicate = existingChores.some(
    (c) => c.id !== choreId && c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    throw new Error('A chore with this name already exists.');
  }

  const docRef = doc(db, 'households', householdId, 'chores', choreId);
  await updateDoc(docRef, {
    name: trimmed,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChore(householdId, choreId) {
  const docRef = doc(db, 'households', householdId, 'chores', choreId);
  await deleteDoc(docRef);
}
