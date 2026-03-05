import {
  getAccessToken as getAccessTokenClient,
  setAccessToken as setAccessTokenClient,
  deleteAccessToken as deleteAccessTokenClient,
  getRefreshToken as getRefreshTokenClient,
  setRefreshToken as setRefreshTokenClient,
  deleteRefreshToken as deleteRefreshTokenClient,
} from './client';
import {
  getAccessToken as getAccessTokenServer,
  setAccessToken as setAccessTokenServer,
  deleteAccessToken as deleteAccessTokenServer,
  getRefreshToken as getRefreshTokenServer,
  setRefreshToken as setRefreshTokenServer,
  deleteRefreshToken as deleteRefreshTokenServer,
} from './server';

export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return await getAccessTokenServer();
  } else {
    return await getAccessTokenClient();
  }
};

export const setAccessToken = async (token: string) => {
  if (typeof window === 'undefined') {
    await setAccessTokenServer(token);
  } else {
    await setAccessTokenClient(token);
  }
};

export const deleteAccessToken = async () => {
  if (typeof window === 'undefined') {
    await deleteAccessTokenServer();
  } else {
    await deleteAccessTokenClient();
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return await getRefreshTokenServer();
  } else {
    return await getRefreshTokenClient();
  }
};

export const setRefreshToken = async (token: string) => {
  if (typeof window === 'undefined') {
    await setRefreshTokenServer(token);
  } else {
    await setRefreshTokenClient(token);
  }
};

export const deleteRefreshToken = async () => {
  if (typeof window === 'undefined') {
    await deleteRefreshTokenServer();
  } else {
    await deleteRefreshTokenClient();
  }
};
