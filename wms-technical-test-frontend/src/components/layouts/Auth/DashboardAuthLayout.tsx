'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  getAuthProfile,
  getAuthProfileReset,
  setRoleAccesses,
  setUser,
} from '@/redux/slices/auth';
import ContentError from '@/components/errors/ContentAny';
import DashboardLayout from '../DashboardLayout';
import { RoleAccess } from '@/types/roleAccess';
import routes from '@/routes/routes';

interface DashboardAuthLayoutProps {
  children?: ReactNode;
}

const DashboardAuthLayout = ({ children }: DashboardAuthLayoutProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [authLoading, setAuthLoading] = useState(false);
  const authLoadingRef = useRef(true);
  const oldPathnameRef = useRef<string | null>(null);
  const authRun = useRef(false);
  const [roleAccess, setRoleAccess] = useState<
    boolean | RoleAccess | undefined | null
  >(null);
  const getAuthProfileData = useAppSelector(
    (state) => state.auth.getAuthProfileData,
  );
  const getAuthProfileErrorMessage = useAppSelector(
    (state) => state.auth.getAuthProfileErrorMessage,
  );
  const getAuthProfileLoading = useAppSelector(
    (state) => state.auth.getAuthProfileLoading,
  );
  const getAuthProfileStatus = useAppSelector(
    (state) => state.auth.getAuthProfileStatus,
  );
  const dispatchGetAuthProfile = useCallback(() => {
    dispatch(getAuthProfile());
  }, [dispatch]);

  const getRoleAccess = useCallback(
    (roleAccesses: RoleAccess[], pathname: string) => {
      const route = routes.find((route) => route.url === pathname);
      let roleAccess = null;

      if (route?.permissionKey) {
        roleAccess = roleAccesses.find(
          (roleAccess) => roleAccess.key === route.permissionKey,
        );
      } else {
        roleAccess = true;
      }

      return roleAccess;
    },
    [],
  );

  useEffect(() => {
    authRun.current = true;
    oldPathnameRef.current = pathname;

    dispatchGetAuthProfile();

    return () => {
      authLoadingRef.current = true;

      setAuthLoading(true);
      dispatch(getAuthProfileReset());
    };
  }, [dispatchGetAuthProfile, pathname, dispatch]);

  useEffect(() => {
    if (!authRun.current) return;
    if (getAuthProfileLoading && !authLoading) {
      authLoadingRef.current = true;

      setAuthLoading(true);
    }
    if (!getAuthProfileLoading && authLoading) {
      if (getAuthProfileData) {
        const user = getAuthProfileData.data?.user;
        const roleAccesses = getAuthProfileData.data?.role_accesses ?? [];

        dispatch(setUser(user));
        dispatch(setRoleAccesses(roleAccesses));
      } else if (getAuthProfileErrorMessage) {
        dispatch(setUser(null));
      }

      if (getAuthProfileStatus === 'unauthenticated') {
        router.replace('/login');

        return;
      }
      if (getAuthProfileStatus === 'error') {
        //
      }

      if (getAuthProfileData || getAuthProfileErrorMessage) {
        authLoadingRef.current = false;

        const roleAccesses = getAuthProfileData?.data?.role_accesses ?? [];

        setAuthLoading(false);
        setRoleAccess(getRoleAccess(roleAccesses, pathname));
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
    getRoleAccess,
    pathname,
  ]);

  const isPathnameSame = pathname === oldPathnameRef.current;
  const authAuthenticated =
    isPathnameSame &&
    !authLoadingRef.current &&
    !authLoading &&
    getAuthProfileStatus === 'authenticated';
  const errorMessage =
    getAuthProfileStatus === 'authenticated'
      ? null
      : getAuthProfileStatus === 'unauthenticated'
        ? "You don't have permission to access this page"
        : 'Something went wrong';

  if (getAuthProfileStatus === 'error') {
    return (
      <DashboardLayout mainClassName='p-0'>
        <ContentError
          containerClassName='min-h-[calc(100vh-73px)]'
          message='Something went wrong'
          buttonMessage='Back to Home'
          buttonHref='/'
        />
      </DashboardLayout>
    );
  }

  return (
    <>
      {(authLoading || getAuthProfileStatus === 'loading') && <div className='w-full flex justify-center text-center'>Loading</div>}
      {roleAccess === undefined && errorMessage && (
        <DashboardLayout mainClassName='p-0'>
          <ContentError
            containerClassName='min-h-[calc(100vh-73px)]'
            message={errorMessage}
            buttonMessage='Back to Dashboard'
            buttonHref='/admin/dashboard'
          />
        </DashboardLayout>
      )}
      {roleAccess && authAuthenticated && children}
    </>
  );
};

export default DashboardAuthLayout;
