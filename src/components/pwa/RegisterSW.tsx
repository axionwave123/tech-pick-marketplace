'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function RegisterSW() {
  const [deferred, setDeferred] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* ignore */
      });
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShowInstall(false);
  }

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[55] mx-auto max-w-md rounded-2xl border border-white/15 bg-surface-900/95 p-4 shadow-xl backdrop-blur-md light:border-slate-200 light:bg-white sm:left-auto sm:right-20">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white light:text-slate-900">Install TechPick NG</p>
          <p className="mt-0.5 text-xs text-surface-400 light:text-slate-600">
            Add to your home screen for a faster, app-like experience.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
            >
              Install app
            </button>
            <button
              type="button"
              onClick={() => setShowInstall(false)}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-white light:text-slate-600"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setShowInstall(false)}
          className="text-surface-500 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
