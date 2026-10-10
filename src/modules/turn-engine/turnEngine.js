/**
 * Pure functions for the round-robin turn engine with debt and skip tracking.
 */

/**
 * Initializes a new queue state for a mode
 */
export function initializeQueue(modeKey, modeLabel, memberUids) {
  const debt = {};
  memberUids.forEach((uid) => {
    debt[uid] = 0;
  });

  return {
    modeKey,
    modeLabel,
    rotation: [...memberUids],
    currentIndex: 0,
    debt,
    active: true,
  };
}

/**
 * Determines whose turn it currently is.
 * A person with debt > 0 remains up next until all their debt is paid.
 */
export function getWhoseTurn(queue) {
  if (!queue || !queue.rotation || queue.rotation.length === 0) return null;
  return queue.rotation[queue.currentIndex];
}

/**
 * Marks chore as done.
 * - If done by current person: decrements debt if any, else advances index.
 * - If done by another person: decrements their debt if any, keeps current turn pointer.
 */
export function processMarkDone(queue, doneByUid) {
  const currentUid = queue.rotation[queue.currentIndex];
  const newDebt = { ...(queue.debt || {}) };
  let newIndex = queue.currentIndex;

  if (doneByUid === currentUid) {
    const currentDebt = newDebt[currentUid] || 0;
    if (currentDebt > 0) {
      newDebt[currentUid] = currentDebt - 1;
      // Stays at same index: must complete regular turn after clearing debt
    } else {
      newIndex = (queue.currentIndex + 1) % queue.rotation.length;
    }
  } else {
    // Manual completion by someone else
    const workerDebt = newDebt[doneByUid] || 0;
    if (workerDebt > 0) {
      newDebt[doneByUid] = workerDebt - 1;
    }
    // Index does not advance; current person still owes their turn
  }

  return {
    ...queue,
    currentIndex: newIndex,
    debt: newDebt,
  };
}

/**
 * Skips the turn for a member (typically current person).
 * Increments skipped member's debt and advances to the next member.
 */
export function processSkip(queue, skipUid) {
  const currentUid = queue.rotation[queue.currentIndex];
  if (skipUid !== currentUid) {
    // Only current-turn person can be skipped
    return queue;
  }

  const newDebt = { ...(queue.debt || {}) };
  newDebt[skipUid] = (newDebt[skipUid] || 0) + 1;
  const newIndex = (queue.currentIndex + 1) % queue.rotation.length;

  return {
    ...queue,
    currentIndex: newIndex,
    debt: newDebt,
  };
}
