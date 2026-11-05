import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageNav } from '@/components/layout/PageNav';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ReportWidget } from '@/components/ReportWidget';
import { SiteAssistant } from '@/components/assistant/SiteAssistant';
import { RegisterSW } from '@/components/pwa/RegisterSW';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TechPick NG — Find. Compare. Buy Smart.',
    template: '%s | TechPick NG',
  },
  description:
    'Product discovery, reviews, price comparison and deals for smartphones, laptops and electronics in Nigeria.',
  manifest: '/manifest.webmanifest',
  applicationName: 'TechPick NG',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TechPick NG',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jakarta.variable} font-sans min-h-screen flex flex-col bg-surface-950 text-surface-100 light:bg-slate-50 light:text-slate-900`}
      >
        <ThemeProvider>
          <Header />
          <PageNav />
          <main className="flex-1">{children}</main>
          <Footer />
          <ReportWidget />
          <SiteAssistant />
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
