import { LogisticChannel } from '@/types/logisticChannel';
import { BaseResponse } from '@/types/response';
import { apiGet } from '@/utils/api';

export const getLogisticChannelDropdown = async (): Promise<
  BaseResponse<LogisticChannel[]>
> => {
  const url = '/logistic-channels/dropdown';
  const response = await apiGet<BaseResponse<LogisticChannel[]>>(url, {
    requireAccessToken: true,
  });

  return response.data;
};
