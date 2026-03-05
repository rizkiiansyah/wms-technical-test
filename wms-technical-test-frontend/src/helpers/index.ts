/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export const getErrorMessage = (error: any): string => {
  let message;

  if (axios.isAxiosError(error)) {
    const response = error;

    message =
      response?.response?.data?.error ??
      response?.response?.data?.message ??
      response?.message ??
      'Something went wrong.';
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    // console.error('Unknown error:', error);
  }

  message = message ?? 'Something went wrong.';

  return message;
};

export const isNullOrUndefined = (
  value: string | number | boolean | null | undefined,
) => {
  return value === null || value === undefined;
};

export const emptyArray = <T>(): T[] => [];

export const isNullOrUndefinedOrEmptyString = (
  value: string | null | undefined,
) => {
  return value === null || value === undefined || value === '';
};
