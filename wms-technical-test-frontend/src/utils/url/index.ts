import { appUrl as appUrlServer } from './server';
import { appUrl as appUrlClient } from './client';

export const appUrl = async () => {
  if (typeof window === 'undefined') {
    return await appUrlServer();
  } else {
    return await appUrlClient();
  }
};
