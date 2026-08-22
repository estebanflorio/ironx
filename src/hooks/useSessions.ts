import { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Session } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', uid, 'sessions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Session[];
      setSessions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logSession = useCallback(async (session: Omit<Session, 'id'>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    await addDoc(collection(db, 'users', uid, 'sessions'), session);
  }, []);

  // Mayor peso levantado por ejercicio, en base al historial de sesiones
  const getPersonalRecords = useCallback(() => {
    const prs: Record<string, { weight: number; date: number }> = {};
    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        const maxSet = ex.sets.reduce(
          (max, s) => (s.weight > max.weight ? s : max),
          { weight: 0, reps: 0, setNumber: 0 }
        );
        if (!prs[ex.exerciseId] || maxSet.weight > prs[ex.exerciseId].weight) {
          prs[ex.exerciseId] = { weight: maxSet.weight, date: session.date };
        }
      });
    });
    return prs;
  }, [sessions]);

  return { sessions, loading, logSession, getPersonalRecords };
}
