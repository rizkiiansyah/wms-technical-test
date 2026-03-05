'use client';

import { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from '@/utils/cn';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color?:
    | 'white'
    | null;
  isLoading?: boolean;
  children?: ReactNode | null;
  paddingVersion?: 'v1' | 'v2' | null;
  isOutline?: boolean;
}

const Button: FC<ButtonProps> = ({
  className,
  color = '',
  isLoading = false,
  paddingVersion = 'v1',
  children,
  isOutline = false,
  disabled,
  ...otherProps
}) => {
  let colorClassName =
    '';
  colorClassName = isOutline
    ? colorClassName +
      ''
    : colorClassName;
  let paddingClassName = 'xs:py-3.5 py-3.5 sm:py-3.5';

  if (color === 'white') {
    colorClassName =
      'bg-white hover:bg-gray-100 text-black disabled:bg-white disabled:text-gray-400 disabled:bg-gray-100';
    colorClassName = isOutline
      ? colorClassName +
        ' bg-white border border-black hover:bg-gray-100 text-black'
      : colorClassName;
  }

  if (paddingVersion === 'v2') {
    paddingClassName = 'xs:py-2.5 py-2.5 sm:py-2.5 min-h-[49px]';
  }

  return (
    <button
      className={cn(
        'xs:px-6 rounded-[10px] px-6 text-[13px] text-white hover:cursor-pointer disabled:cursor-default sm:px-6 sm:text-[14px]',
        colorClassName,
        paddingClassName,
        className
      )}
      disabled={disabled || isLoading}
      {...otherProps}
    >
      {!isLoading ? (
        children
      ) : (
        <div className='flex flex-row items-center justify-center'>Loading</div>
      )}
    </button>
  );
};

export default Button;
