import { FC, ReactNode } from 'react';

import { useAppSelector } from '@/hooks/redux';

interface PermissionCanAccessProps {
  children?: ReactNode;
  roleAccessKeys: string[];
}

const PermissionCanAccess: FC<PermissionCanAccessProps> = ({
  children,
  roleAccessKeys,
}) => {
  const authRoleAccesses = useAppSelector((state) => state.auth.roleAccesses);
  const canAccess = authRoleAccesses.some(
    (authPermission) =>
      authPermission.key && roleAccessKeys.includes(authPermission.key),
  );

  if (!canAccess) {
    return <></>;
  }

  return children;
};

export default PermissionCanAccess;
