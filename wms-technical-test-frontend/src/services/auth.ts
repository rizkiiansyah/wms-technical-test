import { apiGet, apiPost } from '@/utils/api';

import {
  GetAuthProfileResponseData,
  PostAuthLoginRequest,
  PostAuthLoginResponseData,
} from '@/types/auth';
import { BaseResponse } from '@/types/response';

export const postAuthLogin = async (
  data: PostAuthLoginRequest
): Promise<BaseResponse<PostAuthLoginResponseData>> => {
  const url = '/auth/login';
  const response = await apiPost<
    PostAuthLoginRequest,
    BaseResponse<PostAuthLoginResponseData>
  >(url, data);

  return response.data;
};

export const getAuthProfile = async (): Promise<
  BaseResponse<GetAuthProfileResponseData>
> => {
  const url = '/auth/profile';
  const response = await apiGet<BaseResponse<GetAuthProfileResponseData>>(url, {
    requireAccessToken: true,
  });

  return response.data;
};

export const postAuthLogout = async (): Promise<BaseResponse> => {
  const url = '/auth/logout';
  const response = await apiPost<null, BaseResponse>(url, null, {
    requireAccessToken: true,
  });

  return response.data;
};
