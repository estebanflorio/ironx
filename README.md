# IronX — PWA

Migrado desde el proyecto Expo/React Native original a **Vite + React + TypeScript + Tailwind**, con el mismo Firebase de fondo.

## Arrancar en tu máquina (Windows)

```powershell
cd G:\diseño\00apps\ironx-pwa
npm install
copy .env.example .env
```

Completá `.env` con las credenciales de tu proyecto Firebase (las mismas que usabas en el `.env` de la versión Expo — son los mismos valores, solo cambian de prefijo `EXPO_PUBLIC_*` a `VITE_*`).

```powershell
npm run dev
```

Se abre solo en el navegador, sin QR, sin Expo Go, sin red LAN — típicamente en `http://localhost:5173`.

## Qué se portó y qué cambió

| Archivo original (Expo)              | Estado                                                                 |
|---------------------------------------|-------------------------------------------------------------------------|
| `types/index.ts`                      | Igual, sin cambios                                                     |
| `services/firebase.ts`                | Igual, solo cambia `process.env.EXPO_PUBLIC_*` → `import.meta.env.VITE_*` |
| `hooks/useRoutines.ts`                | Igual, sin cambios (es Firestore puro)                                 |
| `hooks/useSessions.ts`                | Igual, sin cambios (es Firestore puro)                                 |
| `hooks/useTimer.ts`                   | `expo-notifications` reemplazado por la **Notification API** del navegador |
| `app/(tabs)/*.tsx`, `components/*.tsx`| Reescritos como componentes web (HTML/Tailwind en vez de `View`/`StyleSheet`) |

## Autenticación

Ya está armado el login/registro con email y contraseña (`src/pages/Login.tsx` + `src/hooks/useAuth.ts`). Para que funcione:

1. Andá a [Firebase Console](https://console.firebase.google.com) → tu proyecto → **Authentication** → pestaña **Sign-in method**.
2. Habilitá el proveedor **Email/contraseña** si todavía no está activo.
3. Listo — desde la app, "¿No tenés cuenta? Creá una" registra un usuario nuevo con Firebase Auth.

Cada rutina y sesión se guarda en Firestore bajo `users/{uid}/routines` y `users/{uid}/sessions`, así que cada usuario ve solo lo suyo (siempre que tengas las reglas de seguridad de Firestore configuradas para exigir que `request.auth.uid == uid` — revisalo en la consola de Firebase si todavía no las tenés).

## Pendientes antes de tener datos reales

- **Íconos PWA**: `vite.config.ts` referencia `icon-192.png` e `icon-512.png` en `public/` — todavía no están generados, agregalos antes de buildear para producción.
- **Notificaciones en iOS**: la Notification API solo funciona en Safari/iOS si la PWA está agregada a la pantalla de inicio (limitación de Apple).
- **Reglas de Firestore**: confirmá que tenés reglas que restrinjan `users/{uid}/**` al propio usuario autenticado.

## Deploy

Mismo flujo que tus otras apps: `vercel` desde la raíz del proyecto, o conectando el repo en el dashboard de Vercel.
