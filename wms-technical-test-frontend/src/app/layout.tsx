import { ReactNode } from 'react';
import { Viewport } from 'next';
import { connection } from 'next/server';

import { appUrl } from '@/utils/url';
import ReduxProvider from '@/redux/ReduxProvider';

import '@/styles/css/app.css';
import '@/styles/scss/globals.scss';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export async function generateMetadata() {
  await connection();

  const url = await appUrl();

  return {
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_NAME + ' description.',
    openGraph: {
      title: process.env.NEXT_PUBLIC_APP_NAME,
      description: process.env.NEXT_PUBLIC_APP_NAME + ' description.',
      type: 'website',
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      locale: 'id_ID',
      url: new URL(url),
    },
    twitter: {
      title: process.env.NEXT_PUBLIC_APP_NAME,
      description: process.env.NEXT_PUBLIC_APP_NAME + ' description.',
      card: 'summary_large_image',
      site: process.env.NEXT_PUBLIC_APP_NAME,
    },
  };
}

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return (
    <html lang='en' className={`bg-white`}>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;
