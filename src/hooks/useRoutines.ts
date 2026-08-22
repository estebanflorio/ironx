import { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Routine } from '../types';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', uid, 'routines'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Routine[];
      setRoutines(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addRoutine = useCallback(async (routine: Omit<Routine, 'id' | 'createdAt'>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    await addDoc(collection(db, 'users', uid, 'routines'), {
      ...routine,
      createdAt: Date.now()
    });
  }, []);

  const removeRoutine = useCallback(async (routineId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    await deleteDoc(doc(db, 'users', uid, 'routines', routineId));
  }, []);

  return { routines, loading, addRoutine, removeRoutine };
}
