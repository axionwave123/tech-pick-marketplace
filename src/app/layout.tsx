import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageNav } from '@/components/layout/PageNav';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ReportWidget } from '@/components/ReportWidget';

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
        </ThemeProvider>
      </body>
    </html>
  );
}
