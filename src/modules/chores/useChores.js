import { useState, useEffect } from 'react';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../identity/index.js';
import {
  getChoresCollection,
  addChore as serviceAdd,
  updateChore as serviceUpdate,
  deleteChore as serviceDelete,
} from './choreService.js';

export function useChores(householdId) {
  const { user } = useAuth();
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) {
      setChores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(getChoresCollection(householdId), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setChores(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId]);

  const add = async (name) => {
    setError(null);
    try {
      return await serviceAdd(householdId, name, chores, user);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (choreId, name) => {
    setError(null);
    try {
      await serviceUpdate(householdId, choreId, name, chores);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const remove = async (choreId) => {
    setError(null);
    try {
      await serviceDelete(householdId, choreId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    chores,
    loading,
    error,
    addChore: add,
    updateChore: update,
    deleteChore: remove,
  };
}
