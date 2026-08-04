import React, { useState, useEffect } from 'react';
import { isPushSupported, getPushPermissionState, subscribeToPush } from '../push';

// Note: re-syncing an already-granted subscription (e.g. returning visit, or
// a different account on a shared browser) is NotificationSettings' job, not
// this component's — keeping that logic in one place avoids both components
// racing to subscribe on mount and showing stale state to each other.
export default function EnableNotificationsBanner() {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    const state = getPushPermissionState();
    if (state === 'default' && !sessionStorage.getItem('push_prompt_dismissed')) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('push_prompt_dismissed', '1');
    setVisible(false);
  };

  const enable = async () => {
    setEnabling(true);
    const ok = await subscribeToPush();
    setEnabling(false);
    if (ok) setVisible(false);
    else dismiss();
  };

  if (!visible) return null;

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap animate-scale-in">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div>
          <p className="text-sm font-bold text-gray-800">Get notified instantly</p>
          <p className="text-xs text-gray-500">New messages and application updates, even when this tab is closed.</p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={dismiss}
          className="px-3 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
          Not now
        </button>
        <button onClick={enable} disabled={enabling}
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl border-0 cursor-pointer hover:bg-teal-700 disabled:opacity-50">
          {enabling ? 'Enabling...' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
