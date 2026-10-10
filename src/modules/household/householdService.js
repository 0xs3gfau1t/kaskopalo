import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { generateInviteCode, sanitizeInviteCode } from './inviteCodeUtils.js';

export async function createHousehold(name, creatorUser) {
  if (!name || name.trim().length === 0) {
    throw new Error('Household name is required.');
  }

  const batch = writeBatch(db);
  const householdRef = doc(db, 'households', crypto.randomUUID());
  const inviteCode = generateInviteCode();
  const inviteRef = doc(db, 'inviteCodes', inviteCode);

  const householdData = {
    name: name.trim(),
    inviteCode,
    createdBy: creatorUser.uid,
    createdAt: serverTimestamp(),
    memberCount: 1,
    members: {
      [creatorUser.uid]: {
        displayName: creatorUser.displayName || 'Creator',
        role: 'admin',
        joinedAt: serverTimestamp(),
      },
    },
  };

  batch.set(householdRef, householdData);
  batch.set(inviteRef, {
    householdId: householdRef.id,
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', creatorUser.uid);
  batch.set(
    userRef,
    {
      displayName: creatorUser.displayName || '',
      email: creatorUser.email || '',
      households: arrayUnion(householdRef.id),
    },
    { merge: true }
  );

  await batch.commit();
  return householdRef.id;
}

export async function joinHouseholdByCode(rawCode, user) {
  const code = sanitizeInviteCode(rawCode);
  if (code.length === 0) {
    throw new Error('Invite code is required.');
  }

  const inviteSnap = await getDoc(doc(db, 'inviteCodes', code));
  if (!inviteSnap.exists()) {
    throw new Error('Invalid or expired invite code.');
  }

  const { householdId } = inviteSnap.data();
  const householdRef = doc(db, 'households', householdId);
  const householdSnap = await getDoc(householdRef);

  if (!householdSnap.exists()) {
    throw new Error('Household no longer exists.');
  }

  const householdData = householdSnap.data();
  if (householdData.members && householdData.members[user.uid]) {
    return householdId; // Already a member
  }

  const currentCount = householdData.memberCount || Object.keys(householdData.members || {}).length;
  if (currentCount >= 8) {
    throw new Error('Household is full (maximum 8 members).');
  }

  const batch = writeBatch(db);
  batch.update(householdRef, {
    [`members.${user.uid}`]: {
      displayName: user.displayName || 'Member',
      role: 'member',
      joinedAt: serverTimestamp(),
    },
    memberCount: currentCount + 1,
  });

  const userRef = doc(db, 'users', user.uid);
  batch.set(
    userRef,
    {
      displayName: user.displayName || '',
      email: user.email || '',
      households: arrayUnion(householdId),
    },
    { merge: true }
  );

  await batch.commit();
  return householdId;
}

export async function leaveHousehold(householdId, userId) {
  const householdRef = doc(db, 'households', householdId);
  const userRef = doc(db, 'users', userId);

  const householdSnap = await getDoc(householdRef);
  if (!householdSnap.exists()) return;

  const data = householdSnap.data();
  const members = { ...(data.members || {}) };
  delete members[userId];
  const remainingCount = Object.keys(members).length;

  const batch = writeBatch(db);
  if (remainingCount === 0) {
    batch.delete(householdRef);
    if (data.inviteCode) {
      batch.delete(doc(db, 'inviteCodes', data.inviteCode));
    }
  } else {
    batch.update(householdRef, {
      [`members.${userId}`]: deleteFieldHack(),
      memberCount: remainingCount,
    });
  }

  batch.update(userRef, {
    households: arrayRemove(householdId),
  });

  await batch.commit();
}

function deleteFieldHack() {
  // FieldValue.delete() representation in modular SDK
  return null;
}
