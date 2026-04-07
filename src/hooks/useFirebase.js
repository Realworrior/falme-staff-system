import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

/**
 * Custom hook for real-time Firebase data
 * @param {string} path - The database path to listen to
 * @param {any} initialValue - The initial value for the state
 */
export const useFirebaseData = (path, initialValue = []) => {
    const [data, setData] = useState(initialValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const dataRef = ref(db, path);
        setLoading(true);

        const unsubscribe = onValue(dataRef, (snapshot) => {
            const val = snapshot.val();
            // Convert objects to arrays if needed for lists
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                const list = Object.entries(val).map(([key, item]) => ({
                    firebaseKey: key,
                    id: key,
                    ...item
                }));
                setData(list);
            } else if (Array.isArray(val)) {
                const list = val.map((item, idx) => (typeof item === 'object' && item !== null ? { ...item, firebaseKey: idx.toString() } : item));
                setData(list);
            } else {
                setData(val || initialValue);
            }
            setLoading(false);
        }, (err) => {
            console.error(`Firebase error at ${path}:`, err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [path]);

    const createRecord = useCallback(async (record) => {
        const dataRef = ref(db, path);
        if (Array.isArray(data)) {
            // If it's an array, we usually replace the whole array or push to a list
            // For templates, we often replace the array. For logs/tickets, we push.
            if (path === 'aviatorLogs' || path === 'supportTickets') {
                return push(dataRef, record);
            } else {
                return set(dataRef, record);
            }
        }
        return push(dataRef, record);
    }, [path, data]);

    const updateRecord = useCallback(async (id, updates) => {
        const itemRef = ref(db, `${path}/${id}`);
        return update(itemRef, updates);
    }, [path]);

    const deleteRecord = useCallback(async (id) => {
        const itemRef = ref(db, `${path}/${id}`);
        return remove(itemRef);
    }, [path]);

    const setAllData = useCallback(async (newData) => {
        const dataRef = ref(db, path);
        return set(dataRef, newData);
    }, [path]);

    return { data, loading, error, createRecord, updateRecord, deleteRecord, setAllData };
};
