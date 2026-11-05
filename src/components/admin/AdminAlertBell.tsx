'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

type Alert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: 'high' | 'medium' | 'low';
  count?: number;
};

type Props = {
  total: number;
  high: number;
  alerts: Alert[];
};

export function AdminAlertBell({ total, high, alerts }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || high <= 0) return;
    if (!('Notification' in window)) return;

    const key = `tp-admin-alert-${high}-${alerts.map((a) => a.id).join(',')}`;
    if (sessionStorage.getItem(key)) return;

    async function maybeNotify() {
      let perm = Notification.permission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
      }
      if (perm !== 'granted') return;
      try {
        new Notification('TechPick NG Admin', {
          body:
            alerts
              .filter((a) => a.severity === 'high')
              .map((a) => a.detail)
              .join(' · ') || `${total} items need attention`,
          icon: '/icon-192.png',
          tag: 'techpick-admin-alerts',
        });
        sessionStorage.setItem(key, '1');
      } catch {
        /* ignore */
      }
    }
    void maybeNotify();
  }, [high, total, alerts]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface-800 text-surface-200 hover:bg-surface-700 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-surface-700 bg-surface-900 shadow-xl">
            <div className="border-b border-surface-800 px-3 py-2">
              <p className="text-sm font-bold text-white">Notifications</p>
              <p className="text-[11px] text-surface-500">
                {total === 0
                  ? 'You are caught up'
                  : `${total} item${total === 1 ? '' : 's'} need attention`}
              </p>
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {alerts.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-surface-500">No alerts right now</li>
              )}
              {alerts.map((a) => (
                <li key={a.id} className="border-b border-surface-800/80 last:border-0">
                  <Link
                    href={a.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 hover:bg-surface-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{a.title}</p>
                      {a.count != null && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            a.severity === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {a.count}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-surface-400">{a.detail}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-surface-800 px-3 py-2">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                Open notifications page →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
