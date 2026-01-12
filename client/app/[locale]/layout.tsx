import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ModalContainer from '@/components/modals/ModalContainer';

const locales = ['fr', 'ar', 'en'];

export const metadata: Metadata = {
  title: 'CVTech - Intelligent CV Management',
  description: 'Upload, analyze, and manage CVs with advanced AI extraction',
  icons: '/icon.ico',
  openGraph: {
    title: 'CVTech - Intelligent CV Management',
    description: 'Upload, analyze, and manage CVs with advanced AI extraction',
    url: 'https://cvtech.com',
    siteName: 'CVTech',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CVTech',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CVTech - Intelligent CV Management',
    description: 'Upload, analyze, and manage CVs with advanced AI extraction',
    images: ['/og-image.jpg'],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <ModalContainer />
      </div>
    </NextIntlClientProvider>
  );
}
