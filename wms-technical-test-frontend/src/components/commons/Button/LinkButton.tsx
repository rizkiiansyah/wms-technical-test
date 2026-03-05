'use client';

import { FC, ReactNode } from 'react';
import { FaCircleNotch } from 'react-icons/fa6';
import Link from 'next/link';
import { UrlObject } from 'url';

import { cn } from '@/utils/cn';

interface LinkButtonProps {
  href: string | UrlObject;
  className?: string;
  isLoading?: boolean;
  children?: ReactNode | null;
  paddingVersion?: 'v1' | 'v2' | null;
}

const LinkButton: FC<LinkButtonProps> = ({
  href,
  className,
  isLoading = false,
  children,
  paddingVersion = 'v1',
}) => {
  let paddingClassName = 'xs:py-[15.75px] py-[15.75px] sm:py-[15.75px]';

  if (paddingVersion === 'v2') {
    paddingClassName = 'xs:py-2.5 py-2.5 sm:py-2.5';
  }

  return (
    <Link
      href={href}
      className={cn(
        'xs:px-6 rounded-[38px] px-6 text-[13px] text-white hover:cursor-pointer disabled:cursor-default sm:px-6 sm:text-[14px]',
        paddingClassName,
        className,
      )}
    >
      {!isLoading ? (
        children
      ) : (
        <div className="flex flex-row items-center justify-center">
          <FaCircleNotch className="mr-2 animate-spin" size={20} />
          Loading
        </div>
      )}
    </Link>
  );
};

export default LinkButton;
