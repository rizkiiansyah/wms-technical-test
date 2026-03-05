import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from 'axios';

import { getAccessToken, getRefreshToken, setAccessToken } from '@/utils/auth';
import { BaseResponse } from '@/types/response';
import {
  PostAuthRefreshTokenRequest,
  PostAuthRefreshTokenResponseData,
} from '@/types/auth';
import { setRefreshToken } from './auth/client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    if (config.requireAccessToken) {
      const accessToken = await getAccessToken();

      if (accessToken) {
        if (!config.headers) config.headers = new AxiosHeaders();

        config.headers?.set('Authorization', `Bearer ${accessToken}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const data = error.response?.data as { error_type?: string } | undefined;

    if (
      error.response?.status === 401 &&
      data?.error_type === 'access_token_expired' &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers!.set('Authorization', `Bearer ${token}`);
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        const response = await apiPost<
          PostAuthRefreshTokenRequest,
          BaseResponse<PostAuthRefreshTokenResponseData>
        >('/auth/refresh-token', {
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.data?.access_token;
        const newRefreshToken = response.data.data?.refresh_token;

        if (newAccessToken && newRefreshToken) {
          await setAccessToken(newAccessToken);
          await setRefreshToken(newRefreshToken);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers!.set(
          'Authorization',
          `Bearer ${newAccessToken}`
        );

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiGet = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  return await api.get(url, config).then((response) => response);
};

export const apiPost = async <TRequest, TResponse>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const newConfig: AxiosRequestConfig = {
    ...config,
  };
  if (config?.isFormData)
    newConfig.headers = {
      'Content-Type': 'multipart/form-data',
    };

  return await api.post(url, data, newConfig).then((response) => response);
};

export const apiPut = async <TRequest, TResponse>(
  url: string,
  data: TRequest,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const newConfig: AxiosRequestConfig = {
    ...config,
  };
  if (config?.isFormData)
    newConfig.headers = {
      'Content-Type': 'multipart/form-data',
    };

  return await api.put(url, data, newConfig).then((response) => response);
};

export const apiDelete = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  return await api.delete(url, config).then((response) => response);
};
