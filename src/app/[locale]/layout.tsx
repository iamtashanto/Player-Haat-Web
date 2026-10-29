import React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { routing } from '@/i18n/routing';
import { AppProviders } from '@/components/providers';
import '../globals.css';

const inter = localFont({
  src: '../../assets/fonts/Inter.ttf',
  variable: '--font-latin',
  display: 'swap',
});

const hindSiliguri = localFont({
  src: [
    { path: '../../assets/fonts/HindSiliguri-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../assets/fonts/HindSiliguri-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../assets/fonts/HindSiliguri-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../assets/fonts/HindSiliguri-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-bangla',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PlayerHaat — Find Players & Khep Matches Across Bangladesh',
    template: '%s · PlayerHaat',
  },
  description:
    'Bangladesh-wide platform for local football and cricket players, team captains, clubs, and tournament recruiters.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                unstyled: true,
              }}
            />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
