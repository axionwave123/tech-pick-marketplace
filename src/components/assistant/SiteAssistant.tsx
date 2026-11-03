'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

type LinkItem = { label: string; href: string };
type ChatMsg = { role: 'user' | 'assistant'; text: string; links?: LinkItem[] };

const STARTERS = [
  'Cheap phones',
  'Laptop deals',
  'Where are articles?',
  'How do I compare?',
];

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      text: 'Ask me how to find products, deals, or guides on TechPick NG — I’ll point you to the right page.',
      links: [
        { label: 'Deals', href: '/deals' },
        { label: 'Smartphones', href: '/categories/smartphones' },
        { label: 'Articles', href: '/articles' },
      ],
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: data.text || 'Try Search from the top bar.',
          links: Array.isArray(data.links) ? data.links : [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'Could not reach the assistant. Use the menu: Search, Deals, or Articles.',
          links: [
            { label: 'Search', href: '/search' },
            { label: 'Deals', href: '/deals' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close site assistant' : 'Open site assistant'}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40 transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed right-5 z-[60] flex w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-surface-950/95 shadow-2xl backdrop-blur-xl light:border-slate-200 light:bg-white"
          style={{ bottom: '5.5rem' }}
          role="dialog"
          aria-label="Site assistant"
        >
          <div className="flex items-center gap-2 border-b border-white/10 bg-brand-600/20 px-4 py-3 light:border-slate-100">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <div>
              <p className="text-sm font-bold text-white light:text-slate-900">Site helper</p>
              <p className="text-[11px] text-surface-400 light:text-slate-500">
                Ask where to go — products, deals, guides
              </p>
            </div>
          </div>

          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-6 bg-brand-600 text-white'
                    : 'mr-4 bg-white/10 text-surface-100 light:bg-slate-100 light:text-slate-800'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-brand-400/40 bg-brand-500/15 px-2.5 py-1 text-[11px] font-semibold text-brand-200 hover:bg-brand-500/25 light:border-brand-300 light:text-brand-700"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-surface-400 light:text-slate-500">Thinking…</p>
            )}
            <div ref={bottomRef} />
          </div>

          {!messages.some((m) => m.role === 'user') && (
            <div className="flex flex-wrap gap-1.5 border-t border-white/5 px-3 py-2 light:border-slate-100">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-surface-300 hover:border-brand-400/50 hover:text-white light:border-slate-200 light:text-slate-600"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-white/10 p-3 light:border-slate-100"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Infinix phone, deals, articles…"
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-surface-500 focus:border-brand-500 light:border-slate-200 light:bg-slate-50 light:text-slate-900 light:placeholder:text-slate-400"
              maxLength={400}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
