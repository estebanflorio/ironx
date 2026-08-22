import { useState, useRef, useCallback, useEffect } from 'react';

// Reemplaza expo-notifications: usa la Notification API nativa del navegador.
// En PWA instalada (Android/desktop) esto dispara una notificación del sistema
// igual que hacía la versión nativa. En iOS Safari solo funciona si la PWA
// está agregada a la pantalla de inicio (limitación de Apple, no del código).
async function notifyRestOver() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'granted') {
    new Notification('Descanso terminado', {
      body: 'Es hora de la siguiente serie',
      icon: '/icon-192.png'
    });
  }
}

export function useTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(async (seconds: number) => {
    setSecondsLeft(seconds);
    setIsRunning(true);

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      notifyRestOver();
    }, seconds * 1000);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { secondsLeft, isRunning, start, stop };
}
