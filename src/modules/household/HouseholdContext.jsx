import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../identity/index.js';
import {
  createHousehold as serviceCreate,
  joinHouseholdByCode as serviceJoin,
  leaveHousehold as serviceLeave,
} from './householdService.js';

const HouseholdContext = createContext(null);

export function HouseholdProvider({ children }) {
  const { user } = useAuth();
  const [currentHousehold, setCurrentHousehold] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's household list from users/{uid}
  useEffect(() => {
    if (!user) {
      setCurrentHousehold(null);
      setHouseholds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, async (snap) => {
      if (snap.exists()) {
        const hIds = snap.data().households || [];
        // Fetch household summaries
        const list = [];
        for (const hid of hIds) {
          const hSnap = await getDoc(doc(db, 'households', hid));
          if (hSnap.exists()) {
            list.push({ id: hid, name: hSnap.data().name });
          }
        }
        setHouseholds(list);

        // Auto-select first household if none selected or invalid
        if (list.length > 0) {
          setCurrentHousehold((prev) => {
            if (prev && list.some((h) => h.id === prev.id)) return prev;
            return { id: list[0].id, name: list[0].name };
          });
        } else {
          setCurrentHousehold(null);
        }
      } else {
        setHouseholds([]);
        setCurrentHousehold(null);
      }
      setLoading(false);
    });

    return () => unsubUser();
  }, [user]);

  // Subscribe to currently selected household details in real-time
  useEffect(() => {
    if (!currentHousehold?.id) return;

    const hRef = doc(db, 'households', currentHousehold.id);
    const unsubHousehold = onSnapshot(hRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentHousehold({
          id: snap.id,
          name: data.name,
          inviteCode: data.inviteCode,
          members: data.members || {},
          memberCount: data.memberCount || Object.keys(data.members || {}).length,
          createdBy: data.createdBy,
        });
      }
    });

    return () => unsubHousehold();
  }, [currentHousehold?.id]);

  const createHousehold = async (name) => {
    setError(null);
    try {
      const hid = await serviceCreate(name, user);
      setCurrentHousehold({ id: hid, name });
      return hid;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const joinHousehold = async (code) => {
    setError(null);
    try {
      const hid = await serviceJoin(code, user);
      setCurrentHousehold({ id: hid });
      return hid;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const leaveHousehold = async () => {
    if (!currentHousehold?.id || !user) return;
    setError(null);
    try {
      await serviceLeave(currentHousehold.id, user.uid);
      setCurrentHousehold(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const switchHousehold = (hid) => {
    const found = households.find((h) => h.id === hid);
    if (found) setCurrentHousehold(found);
  };

  const getMembersList = () => {
    if (!currentHousehold?.members) return [];
    return Object.entries(currentHousehold.members)
      .filter(([_, m]) => m !== null)
      .map(([uid, m]) => ({
        uid,
        displayName: m.displayName || 'Member',
        role: m.role || 'member',
      }));
  };

  const value = {
    currentHousehold,
    households,
    loading,
    error,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    switchHousehold,
    getMembersList,
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}
