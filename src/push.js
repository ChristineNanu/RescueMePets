import { API_BASE_URL } from './constants';
import { apiFetch } from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined';
}

export function getPushPermissionState() {
  return isPushSupported() ? Notification.permission : 'unsupported';
}

async function registerServiceWorker() {
  return navigator.serviceWorker.register('/sw.js');
}

/** Requests notification permission and subscribes this browser to push.
 * Returns true on success, false if permission was denied or unsupported. */
export async function subscribeToPush() {
  if (!isPushSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await registerServiceWorker();
  const { public_key } = await apiFetch(`${API_BASE_URL}/push/vapid-public-key`).then(r => r.json());
  if (!public_key) return false;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key),
    });
  }

  await apiFetch(`${API_BASE_URL}/push/subscribe`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
  return true;
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await apiFetch(`${API_BASE_URL}/push/unsubscribe`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => {});
  await subscription.unsubscribe();
}
