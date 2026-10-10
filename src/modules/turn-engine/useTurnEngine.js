import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useHousehold } from '../household/index.js';
import { generateModes } from './modeGenerator.js';
import {
  getTurnQueueRef,
  ensureQueueExists,
  advanceMarkDone,
  advanceSkip,
} from './turnQueueService.js';
import { getWhoseTurn } from './turnEngine.js';

export function useTurnEngine(choreId) {
  const { currentHousehold, getMembersList } = useHousehold();
  const members = getMembersList();
  const modes = generateModes(members);

  const [selectedModeKey, setSelectedModeKey] = useState(modes[0]?.modeKey || '');
  const [currentQueue, setCurrentQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync default mode when modes list changes
  useEffect(() => {
    if (modes.length > 0 && (!selectedModeKey || !modes.some((m) => m.modeKey === selectedModeKey))) {
      // Default to highest size mode (all members participating)
      setSelectedModeKey(modes[modes.length - 1].modeKey);
    }
  }, [modes, selectedModeKey]);

  // Ensure queue exists and listen for real-time changes
  useEffect(() => {
    if (!currentHousehold?.id || !choreId || !selectedModeKey) {
      setCurrentQueue(null);
      setLoading(false);
      return;
    }

    const currentMode = modes.find((m) => m.modeKey === selectedModeKey);
    if (!currentMode) return;

    setLoading(true);
    let unsubSnapshot = null;

    ensureQueueExists(
      currentHousehold.id,
      choreId,
      selectedModeKey,
      currentMode.modeLabel,
      currentMode.memberUids
    )
      .then(() => {
        const qRef = getTurnQueueRef(currentHousehold.id, choreId, selectedModeKey);
        unsubSnapshot = onSnapshot(qRef, (snap) => {
          if (snap.exists()) {
            setCurrentQueue(snap.data());
          }
          setLoading(false);
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    return () => {
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [currentHousehold?.id, choreId, selectedModeKey]);

  const markDone = async (doneByUid) => {
    if (!currentHousehold?.id || !choreId || !selectedModeKey) return;
    setError(null);
    try {
      await advanceMarkDone(currentHousehold.id, choreId, selectedModeKey, doneByUid);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const skip = async (skipUid) => {
    if (!currentHousehold?.id || !choreId || !selectedModeKey) return;
    setError(null);
    try {
      await advanceSkip(currentHousehold.id, choreId, selectedModeKey, skipUid);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const whoseTurnUid = getWhoseTurn(currentQueue);
  const whoseTurnMember = members.find((m) => m.uid === whoseTurnUid);

  return {
    modes,
    selectedModeKey,
    setSelectedModeKey,
    currentQueue,
    whoseTurnUid,
    whoseTurnName: whoseTurnMember?.displayName || 'Unknown',
    loading,
    error,
    markDone,
    skip,
  };
}
