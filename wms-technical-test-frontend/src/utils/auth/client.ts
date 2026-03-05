/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '@/types/user';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || '';

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const accessToken = await getCookie('access_token');

    if (!accessToken || typeof accessToken !== 'string') {
      return null;
    }

    return accessToken;
  } catch (error) {
    // console.error('Failed to get access token:', error);
    return null;
  }
};

export const setAccessToken = async (token: string) => {
  try {
    await setCookie('access_token', token);
  } catch (error) {
    // console.error('Failed to set access token:', error);
  }
};

export const deleteAccessToken = async () => {
  try {
    await deleteCookie('access_token');
  } catch (error) {
    // console.error('Failed to delete access token:', error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getCookie('refresh_token');

    if (!refreshToken || typeof refreshToken !== 'string') {
      return null;
    }

    return refreshToken;
  } catch (error) {
    // console.error('Failed to get refresh token:', error);
    return null;
  }
};

export const setRefreshToken = async (token: string) => {
  try {
    await setCookie('refresh_token', token);
  } catch (error) {
    // console.error('Failed to set refresh token:', error);
  }
};

export const deleteRefreshToken = async () => {
  try {
    await deleteCookie('refresh_token');
  } catch (error) {
    // console.error('Failed to delete refresh token:', error);
  }
};

export async function getUserFromCookies() {
  try {
    const userCookie = await getCookie('user');
    const userDetailCookie = await getCookie('user-detail');

    if (!userCookie) return null;

    const decodedUser = decodeURIComponent(userCookie as string);
    const decodedUserDetail = userDetailCookie
      ? decodeURIComponent(userDetailCookie as string)
      : null;
    const userBytes = CryptoJS.AES.decrypt(decodedUser, SECRET_KEY);
    const userDetailBytes = decodedUserDetail
      ? CryptoJS.AES.decrypt(decodedUserDetail, SECRET_KEY)
      : null;
    const userDecrypted = userBytes.toString(CryptoJS.enc.Utf8);
    const userDetailDecrypted = userDetailBytes
      ? userDetailBytes.toString(CryptoJS.enc.Utf8)
      : null;
    const user = userDecrypted ? JSON.parse(userDecrypted) : null;
    const userDetail = userDetailDecrypted
      ? JSON.parse(userDetailDecrypted)
      : null;

    if (user) {
      user.user_detail = userDetail;
    }

    return user;
  } catch (error) {
    // console.error('Failed to get user:', error);
    return null;
  }
}

export const setUserToLocalStorage = async (user?: User | null) => {
  try {
    if (user) {
      const userEncrypted = CryptoJS.AES.encrypt(
        JSON.stringify(user),
        SECRET_KEY
      ).toString();
      const userEncoded = encodeURIComponent(userEncrypted);

      localStorage.setItem('user', userEncoded);
    }
  } catch (error) {
    // console.error('Failed to set user encrypted to local storage:', error);
  }
};

export const deleteUserFromLocalStorage = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    // console.error('Failed to delete user encrypted from local storage:', error);
  }
};

export async function getUserFromLocalStorage() {
  try {
    const userEncrypted = localStorage.getItem('user');

    if (!userEncrypted) return null;

    const userDecoded = decodeURIComponent(userEncrypted as string);
    const userBytes = CryptoJS.AES.decrypt(userDecoded, SECRET_KEY);
    const userDecrypted = userBytes.toString(CryptoJS.enc.Utf8);
    const user = userDecrypted ? JSON.parse(userDecrypted) : null;

    return user;
  } catch (error) {
    // console.error('Failed to get user:', error);

    return null;
  }
}
