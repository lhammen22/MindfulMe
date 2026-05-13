import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export type NotifStatus = 'loading' | 'unsupported' | 'denied' | 'off' | 'on';

export async function getNotifStatus(): Promise<NotifStatus> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return sub ? 'on' : 'off';
  } catch {
    return 'unsupported';
  }
}

export async function subscribeToPush(uid: string): Promise<NotifStatus> {
  if (!('serviceWorker' in navigator)) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission === 'denied') return 'denied';
  if (permission !== 'granted') return 'off';

  const reg = await navigator.serviceWorker.ready;
  const vapidKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '';
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const subJson = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  await setDoc(doc(db, 'pushSubscriptions', uid), subJson);
  return 'on';
}

export async function unsubscribeFromPush(uid: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    await sub?.unsubscribe();
  } catch { /* ignore */ }
  await deleteDoc(doc(db, 'pushSubscriptions', uid));
}
