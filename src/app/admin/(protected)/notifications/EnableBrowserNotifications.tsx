'use client';

import { useEffect, useState } from 'react';

export function EnableBrowserNotifications({ highPriority }: { highPriority: number }) {
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPerm('unsupported');
      return;
    }
    setPerm(Notification.permission);
  }, []);

  async function enable() {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === 'granted' && highPriority > 0) {
      new Notification('TechPick NG Admin', {
        body: `You have ${highPriority} high-priority item(s). Open Notifications in admin.`,
        icon: '/icon-192.png',
      });
    }
  }

  if (perm === 'unsupported') {
    return (
      <p className="text-xs text-surface-500">
        This browser does not support desktop notifications. Use the bell icon in the admin header.
      </p>
    );
  }

  if (perm === 'granted') {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
        Browser notifications are on. You will get alerts when high-priority items appear while you use
        admin.
      </p>
    );
  }

  if (perm === 'denied') {
    return (
      <p className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-xs text-surface-400">
        Notifications are blocked in this browser. Allow them in site settings if you want desktop alerts.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500"
    >
      Enable browser notifications
    </button>
  );
}
