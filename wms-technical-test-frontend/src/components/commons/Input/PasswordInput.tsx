'use client';

import {
  forwardRef,
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
  useState,
} from 'react';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6';

import Input from '.';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  iconLeft?: ReactNode | null;
  id?: string;
  containerClassName?: string;
  validationMessage?: string | null;
  useDefaultLeftIcon?: boolean;
}

const PasswordInput: ForwardRefRenderFunction<
  HTMLInputElement,
  PasswordInputProps
> = (
  {
    label,
    iconLeft,
    containerClassName,
    validationMessage,
    useDefaultLeftIcon = false,
    ...otherProps
  },
  ref,
) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = (e: MouseEvent<SVGElement>) => {
    e.stopPropagation();

    setShowPassword((oldValue) => !oldValue);
  };

  return (
    <Input
      ref={ref}
      containerClassName={containerClassName}
      label={label}
      type={!showPassword ? 'password' : 'text'}
      iconLeft={
        useDefaultLeftIcon ? (
          iconLeft ? (
            iconLeft
          ) : (
            <FaLock />
          )
        ) : null
      }
      iconRight={
        !showPassword ? (
          <FaEye
            className="cursor-pointer text-gray-400"
            onClick={toggleShowPassword}
          />
        ) : (
          <FaEyeSlash
            className="cursor-pointer text-gray-400"
            onClick={toggleShowPassword}
          />
        )
      }
      validationMessage={validationMessage}
      {...otherProps}
    />
  );
};

export default forwardRef(PasswordInput);
