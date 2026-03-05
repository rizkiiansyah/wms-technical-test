/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { RejectWithValue } from '@/types/response';

export const getErrorMessage = (error: any): string => {
  let message = 'Something went wrong';

  if (axios.isAxiosError(error)) {
    const response = error;
    const dataMessage = response?.response?.data?.message;
    const dataError = response?.response?.data?.error;
    const dataErrorMessage =
      dataError && typeof dataError === 'string' ? dataError : null;

    message =
      dataMessage ??
      dataErrorMessage ??
      response?.message ??
      'Something went wrong';
  }

  return message;
};

export const getRejectWithValue = (error: any): RejectWithValue => {
  if (axios.isAxiosError(error)) {
    return {
      statusCode: error.status,
      message: error.message,
      response: error,
    };
  } else {
    let message = 'Something went wrong.';

    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      statusCode: null,
      message: message,
    };
  }
};
