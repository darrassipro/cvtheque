import { setRequestLocale } from 'next-intl/server';
import HomePage from '@/components/home/HomePage';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}