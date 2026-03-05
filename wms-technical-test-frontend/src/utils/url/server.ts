'use server';

import { headers } from 'next/headers';

export const appUrl = async () => {
  const headersList = await headers();
  const url =
    headersList.get('app-url') ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000';

  return url;
};
