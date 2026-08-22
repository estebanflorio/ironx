import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile } from '../types';

const EMPTY_PROFILE: UserProfile = {
  displayName: '',
  heightCm: null,
  currentWeightKg: null,
  goalWeightKg: null,
  birthYear: null,
  weightHistory: [],
  updatedAt: 0
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    const ref = doc(db, 'users', uid, 'profile', 'main');
    const unsubscribe = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? ({ ...EMPTY_PROFILE, ...snap.data() } as UserProfile) : EMPTY_PROFILE);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Guarda datos básicos del perfil (nombre, altura, objetivo, año de nacimiento)
  // sin tocar el historial de peso.
  const saveProfile = useCallback(
    async (patch: Omit<UserProfile, 'weightHistory' | 'updatedAt'>) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Usuario no autenticado');
      const ref = doc(db, 'users', uid, 'profile', 'main');
      await setDoc(ref, { ...patch, updatedAt: Date.now() }, { merge: true });
    },
    []
  );

  // Registra un nuevo peso corporal: actualiza el peso actual y lo suma
  // al historial, para poder ver la tendencia en el tiempo más adelante.
  const logWeight = useCallback(
    async (weightKg: number) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Usuario no autenticado');
      const ref = doc(db, 'users', uid, 'profile', 'main');
      const entry = { date: Date.now(), weightKg };
      await setDoc(
        ref,
        {
          currentWeightKg: weightKg,
          weightHistory: [...profile.weightHistory, entry],
          updatedAt: Date.now()
        },
        { merge: true }
      );
    },
    [profile.weightHistory]
  );

  return { profile, loading, saveProfile, logWeight };
}
