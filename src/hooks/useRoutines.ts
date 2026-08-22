import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Routine, RoutineExercise } from '../types';

// Las rutinas creadas antes de sumar el campo "order" no lo tienen todavía.
// No podemos usar orderBy('order') en la query de Firestore porque eso
// excluiría directamente los documentos que no tienen ese campo. Por eso
// seguimos pidiendo por createdAt y resolvemos el orden final en el cliente:
// las rutinas con "order" explícito van primero (respetando ese orden), y
// las viejas sin "order" quedan al final, ordenadas por más reciente.
// En cuanto el usuario reordena algo una vez, se normaliza todo con order
// secuencial y este fallback deja de hacer falta.
function sortKey(r: Routine) {
  return typeof r.order === 'number' ? r.order : Number.MAX_SAFE_INTEGER - r.createdAt;
}

export function useRoutines() {
  const [rawRoutines, setRawRoutines] = useState<Routine[]>([]);
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
      setRawRoutines(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const routines = useMemo(
    () => [...rawRoutines].sort((a, b) => sortKey(a) - sortKey(b)),
    [rawRoutines]
  );

  const addRoutine = useCallback(
    async (routine: { name: string; exercises: RoutineExercise[] }) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Usuario no autenticado');
      const maxOrder = rawRoutines.reduce(
        (max, r) => (typeof r.order === 'number' ? Math.max(max, r.order) : max),
        -1
      );
      await addDoc(collection(db, 'users', uid, 'routines'), {
        ...routine,
        createdAt: Date.now(),
        order: maxOrder + 1
      });
    },
    [rawRoutines]
  );

  const updateRoutine = useCallback(
    async (routineId: string, patch: { name: string; exercises: RoutineExercise[] }) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Usuario no autenticado');
      await updateDoc(doc(db, 'users', uid, 'routines', routineId), patch);
    },
    []
  );

  const removeRoutine = useCallback(async (routineId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    await deleteDoc(doc(db, 'users', uid, 'routines', routineId));
  }, []);

  // Mueve una rutina un lugar hacia arriba o abajo en la lista, y de paso
  // normaliza el "order" de TODAS las rutinas visibles a valores 0..n-1
  // según su posición actual. Esto hace que rutinas viejas sin "order" se
  // migren solas la primera vez que se reordena algo.
  const moveRoutine = useCallback(
    async (routineId: string, direction: 'up' | 'down') => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Usuario no autenticado');

      const index = routines.findIndex((r) => r.id === routineId);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= routines.length) return;

      const reordered = [...routines];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

      const batch = writeBatch(db);
      reordered.forEach((r, i) => {
        if (r.order !== i) {
          batch.update(doc(db, 'users', uid, 'routines', r.id), { order: i });
        }
      });
      await batch.commit();
    },
    [routines]
  );

  return { routines, loading, addRoutine, updateRoutine, removeRoutine, moveRoutine };
}
