'use client';

import { FC, memo, ReactNode, useEffect } from 'react';

import { cn } from '@/utils/cn';
import Button from '../commons/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { postAuthLogout, postAuthLogoutReset } from '@/redux/slices/auth';
import { toastError, toastSuccess } from '@/helpers/reactToastify';
import { deleteAccessToken, deleteRefreshToken } from '@/utils/auth';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children?: ReactNode;
  mainClassName?: string;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({
  mainClassName,
  children,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const postAuthLogoutData = useAppSelector(
    (state) => state.auth.postAuthLogoutData
  );
  const postAuthLogoutErrorMessage = useAppSelector(
    (state) => state.auth.postAuthLogoutErrorMessage
  );
  const postAuthLogoutLoading = useAppSelector(
    (state) => state.auth.postAuthLogoutLoading
  );

  const logoutHandler = () => {
    dispatch(postAuthLogout());
  };

  const deleteToken = async () => {
    await deleteAccessToken();
    await deleteRefreshToken();
  };

  useEffect(() => {
    if (!postAuthLogoutLoading) {
      if (postAuthLogoutData) {
        toastSuccess('Success', postAuthLogoutData.message, {
          onClose: () => {
            router.replace('/login');
          },
        });
        deleteToken();
      } else if (postAuthLogoutErrorMessage) {
        toastError('Error', postAuthLogoutErrorMessage);
      }

      if (postAuthLogoutData || postAuthLogoutErrorMessage) {
        dispatch(postAuthLogoutReset());
      }
    }
  }, [
    postAuthLogoutData,
    postAuthLogoutErrorMessage,
    postAuthLogoutLoading,
    dispatch,
    router,
  ]);

  return (
    <>
      <main
        className={cn(
          'relative ml-0 flex min-h-[calc(100vh-73px)] w-full flex-1 flex-col px-7 py-5 transition-all duration-300',
          mainClassName
        )}
      >
        <div className='flex flex-row gap-3 mb-4 justify-end'>
          <div className='flex flex-col text-end'>
            <span>{user?.email}</span>
            <span>{user?.role_name}</span>
          </div>
          <Button
            isLoading={postAuthLogoutLoading}
            color='white'
            isOutline
            onClick={() => logoutHandler()}
          >
            Logout
          </Button>
        </div>

        {children}
      </main>
    </>
  );
};

export default memo(DashboardLayout);
