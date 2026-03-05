'use server';

import { cookies } from 'next/headers';

export const getAccessToken = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    return accessToken ?? null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

export const setAccessToken = async (token: string) => {
  try {
    const cookieStore = await cookies();

    cookieStore.set('access_token', token);
  } catch (error) {
    console.error('Failed to set access token:', error);
  }
};

export const deleteAccessToken = async () => {
  try {
    const cookieStore = await cookies();

    cookieStore.delete('access_token');
  } catch (error) {
    console.error('Failed to set access token:', error);
  }
};

export const getRefreshToken = async () => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    return refreshToken ?? null;
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

export const setRefreshToken = async (token: string) => {
  try {
    const cookieStore = await cookies();

    cookieStore.set('refresh_token', token);
  } catch (error) {
    console.error('Failed to set refresh token:', error);
  }
};

export const deleteRefreshToken = async () => {
  try {
    const cookieStore = await cookies();

    cookieStore.delete('refresh_token');
  } catch (error) {
    console.error('Failed to set refresh token:', error);
  }
};

// export const getUserFromHeaders = async () => {
//   try {
//     const h = await headers();
//     const userEncoded = h.get('user');
//     const userDetailEncoded = h.get('user-detail');
//     const user: User | null = userEncoded ? JSON.parse(userEncoded) : null;
//     const userDetail: UserDetail | null = userDetailEncoded
//       ? JSON.parse(userDetailEncoded)
//       : null;

//     if (user) {
//       user.user_detail = userDetail;
//     }

//     return user;
//   } catch (error) {
//     return null;
//   }
// };
