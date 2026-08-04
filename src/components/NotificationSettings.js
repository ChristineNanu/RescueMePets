import React, { useState, useEffect } from 'react';
import { isPushSupported, getPushPermissionState, hasActiveSubscription, subscribeToPush, unsubscribeFromPush } from '../push';

export default function NotificationSettings() {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!isPushSupported()) { setSupported(false); setLoading(false); return; }
    setPermission(getPushPermissionState());
    setEnabled(await hasActiveSubscription());
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const toggle = async () => {
    setBusy(true);
    if (enabled) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
    await refresh();
    setBusy(false);
  };

  if (!supported || loading) return null;

  return (
    <div className="bg-white rounded-2xl p-4 mb-5 shadow-card border border-teal-50 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-black text-gray-800">🔔 Push Notifications</p>
        {permission === 'denied' ? (
          <p className="text-xs text-coral-600 mt-0.5">Blocked in your browser settings — enable notifications for this site in your browser to turn this back on.</p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">
            {enabled ? "You'll be notified about messages and application updates, even when this tab is closed." : "Off — you'll only see updates while you're using the app."}
          </p>
        )}
      </div>
      {permission !== 'denied' && (
        <button
          onClick={toggle}
          disabled={busy}
          role="switch"
          aria-checked={enabled}
          className={`relative flex-shrink-0 w-12 h-7 rounded-full border-0 cursor-pointer transition-all disabled:opacity-50
            ${enabled ? 'bg-teal-600' : 'bg-gray-200'}`}>
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all
            ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
      )}
    </div>
  );
}
