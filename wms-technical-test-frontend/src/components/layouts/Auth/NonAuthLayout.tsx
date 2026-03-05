'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getAuthProfile } from '@/redux/slices/auth';
import { getAccessToken, getRefreshToken } from '@/utils/auth';
import { needRedirectUnprotectedRoute } from '@/routes/routes';

interface NonAuthLayoutProps {
  children?: ReactNode;
}

const NonAuthLayout = ({ children }: NonAuthLayoutProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [authLoading, setAuthLoading] = useState(true);
  const [authSkip, setAuthSkip] = useState(false);
  const getAuthProfileData = useAppSelector(
    (state) => state.auth.getAuthProfileData
  );
  const getAuthProfileErrorMessage = useAppSelector(
    (state) => state.auth.getAuthProfileErrorMessage
  );
  const getAuthProfileLoading = useAppSelector(
    (state) => state.auth.getAuthProfileLoading
  );
  const getAuthProfileStatus = useAppSelector(
    (state) => state.auth.getAuthProfileStatus
  );

  const dispatchGetAuthProfile = useCallback(() => {
    dispatch(getAuthProfile());
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    const isNeedRedirectUnprotectedRoute = needRedirectUnprotectedRoute.some(
      (route) => pathname.startsWith(route)
    );

    if (!isNeedRedirectUnprotectedRoute) {
      setAuthLoading(false);
      setAuthSkip(true);

      return;
    }

    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken || !refreshToken) {
      setAuthLoading(false);
      setAuthSkip(true);

      return;
    }

    dispatchGetAuthProfile();
  }, [pathname, dispatchGetAuthProfile]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth, pathname]);

  useEffect(() => {
    if (getAuthProfileLoading && !authLoading) {
      setAuthLoading(true);
    }
    if (!getAuthProfileLoading && authLoading) {
      if (getAuthProfileStatus === 'unauthenticated') {
        const redirectUrl = '/login';

        router.replace(redirectUrl);

        return;
      }

      if (getAuthProfileData || getAuthProfileErrorMessage) {
        setAuthLoading(false);
      }
    }
  }, [
    getAuthProfileData,
    getAuthProfileErrorMessage,
    getAuthProfileLoading,
    getAuthProfileStatus,
    router,
    dispatch,
    authLoading,
  ]);

  const authNotAuthenticated =
    !authLoading &&
    (getAuthProfileStatus === 'unauthenticated' ||
      getAuthProfileStatus === 'error');

  return (
    <>
      {(authLoading || getAuthProfileStatus === 'loading') && <div className='w-full flex justify-center text-center'>Loading</div>}
      {(authSkip || authNotAuthenticated) && children}
    </>
  );
};

export default NonAuthLayout;
