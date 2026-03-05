import { toast, ToastOptions } from 'react-toastify';

import Base from '@/components/reactToastifies/Base';

// interface ToastSuccessProps extends ToastOptions {}
// type ToastSuccessProps = ToastOptions & {};

export const toastSuccess = (
  title?: string | null,
  message?: string | null,
  options: ToastOptions = {}
) => {
  const { ...rest } = options;

  return toast.success(Base, {
    ...rest,
    data: {
      title,
      message,
    },
  });
};

export const toastError = (
  title?: string | null,
  message?: string | null,
  options: ToastOptions = {}
) => {
  const { ...rest } = options;

  return toast.error(Base, {
    ...rest,
    data: {
      title,
      message,
    },
  });
};
