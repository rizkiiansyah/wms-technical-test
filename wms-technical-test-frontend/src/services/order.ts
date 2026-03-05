import { GetOrdersParams, Order } from '@/types/order';
import { BaseResponse, PaginationBaseResponse } from '@/types/response';
import { apiGet, apiPost } from '@/utils/api';

export const getOrders = async (
  params: GetOrdersParams
): Promise<PaginationBaseResponse<Order[]>> => {
  const url = '/orders';
  const response = await apiGet<PaginationBaseResponse<Order[]>>(url, {
    requireAccessToken: true,
    params,
  });

  return response.data;
};

export const getOrder = async (
  orderSN: string
): Promise<BaseResponse<Order>> => {
  const url = '/orders/' + orderSN;
  const response = await apiGet<BaseResponse<Order>>(url, {
    requireAccessToken: true,
  });

  return response.data;
};

export const postOrderPick = async (orderSN: string): Promise<BaseResponse> => {
  const url = `/orders/${orderSN}/pick`;
  const response = await apiPost<null, BaseResponse>(url, null, {
    requireAccessToken: true,
  });

  return response.data;
};

export const postOrderPack = async (orderSN: string): Promise<BaseResponse> => {
  const url = `/orders/${orderSN}/pack`;
  const response = await apiPost<null, BaseResponse>(url, null, {
    requireAccessToken: true,
  });

  return response.data;
};

export const postOrderShip = async (
  orderSN: string,
  data: { channel_id: string }
): Promise<BaseResponse> => {
  const url = `/orders/${orderSN}/ship`;
  const response = await apiPost<{ channel_id: string }, BaseResponse>(
    url,
    data,
    {
      requireAccessToken: true,
    }
  );

  return response.data;
};
