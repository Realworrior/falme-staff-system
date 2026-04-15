import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { db } from '../firebase';

const FirebaseDataContext = createContext();

export const FirebaseDataProvider = ({ children }) => {
  const [data, setData] = useState({
    templates: [],
    logs: [],
    tickets: [],
    overrides: {},
    loading: {
      templates: true,
      logs: true,
      tickets: true,
      overrides: true
    }
  });

  const [error, setError] = useState(null);

  // Helper for processing standard Firebase lists (objects with keys)
  const processList = (val, initialValue = []) => {
    if (val === null) return initialValue;
    if (typeof val === 'object' && !Array.isArray(val)) {
      return Object.entries(val).map(([key, item]) => ({
        firebaseKey: key,
        id: key,
        ...(typeof item === 'object' ? item : { value: item })
      }));
    }
    if (Array.isArray(val)) {
      return val.map((item, idx) => 
        (typeof item === 'object' && item !== null) 
          ? { ...item, firebaseKey: idx.toString() } 
          : { value: item, firebaseKey: idx.toString() }
      );
    }
    return val;
  };

  useEffect(() => {
    const listeners = [
      { path: 'supportTemplates', key: 'templates', isList: true },
      { path: 'aviatorLogs', key: 'logs', isList: true },
      { path: 'supportTickets', key: 'tickets', isList: true },
      { path: 'rotaOverrides', key: 'overrides', isList: false }
    ];

    const unsubscribes = listeners.map(l => {
      const dataRef = ref(db, l.path);
      return onValue(dataRef, (snapshot) => {
        const val = snapshot.val();
        setData(prev => ({
          ...prev,
          [l.key]: l.isList ? processList(val) : (val || {}),
          loading: { ...prev.loading, [l.key]: false }
        }));
      }, (err) => {
        console.error(`Firebase error at ${l.path}:`, err);
        setError(err);
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, [l.key]: false }
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // Generic Update Methods
  const updateRecord = async (path, recordId, updates) => {
    const recordRef = ref(db, `${path}/${recordId}`);
    return update(recordRef, updates);
  };

  const createRecord = async (path, record) => {
    const collectionRef = ref(db, path);
    const newRef = push(collectionRef);
    return set(newRef, record);
  };

  const deleteRecord = async (path, recordId) => {
    const recordRef = ref(db, `${path}/${recordId}`);
    return remove(recordRef);
  };

  const setAllData = async (path, newData) => {
    const dataRef = ref(db, path);
    return set(dataRef, newData);
  };

  // derived overall loading state
  const isSyncing = Object.values(data.loading).some(v => v);

  const value = {
    ...data,
    isSyncing,
    error,
    actions: {
      updateRecord,
      createRecord,
      deleteRecord,
      setAllData
    }
  };

  return (
    <FirebaseDataContext.Provider value={value}>
      {children}
    </FirebaseDataContext.Provider>
  );
};

export const useGlobalData = () => {
  const context = useContext(FirebaseDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a FirebaseDataProvider');
  }
  return context;
};
