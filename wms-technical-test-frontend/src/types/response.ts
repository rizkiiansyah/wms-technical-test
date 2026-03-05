/* eslint-disable @typescript-eslint/no-explicit-any */
export type BaseResponse<TData = null | undefined> = {
  status?: string | null;
  message?: string | null;
  data?: TData | null;
};

export type PaginationBaseResponse<TData = null | undefined> = {
  status?: string | null;
  message?: string | null;
  data?: TData | null;
  meta?: {
    page?: number | null;
    limit?: number | null;
    total?: number | null;
    total_pages?: number | null;
  } | null;
};

export type BaseErrorResponse = {
  status?: string | null;
  message?: string | null;
  error?: {
    code?: string | null;
    details?: string | null;
    type?: string | null;
  } | null;
};

export type RejectWithValue = {
  statusCode?: number | null;
  message?: string | null;
  response?: any;
};
