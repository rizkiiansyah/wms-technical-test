'use client';

import {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useRef,
} from 'react';

import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | null;
  labelClassName?: string;
  iconLeft?: ReactNode | null;
  iconRight?: ReactNode | null;
  id?: string;
  containerClassName?: string;
  inputClassName?: string;
  validationMessage?: string | null;
}

const Input: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  {
    label,
    labelClassName,
    iconLeft,
    iconRight,
    id,
    containerClassName,
    inputClassName,
    validationMessage,
    required,
    disabled,
    type,
    className,
    readOnly,
    onChange,
    ...otherProps
  },
  ref,
) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInputHandler = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const input =
        (ref as RefObject<HTMLInputElement>)?.current ?? inputRef.current;

      if (!input) return;

      if (!input.contains(e.target as Node)) {
        if (type === 'file') {
          input.click();
        } else {
          input.focus();
        }
      }
    },
    [ref, type],
  );

  const mergeRefs =
    <T,>(...refs: (React.Ref<T> | undefined)[]) =>
    (value: T) => {
      refs.forEach((ref) => {
        if (!ref) return;

        if (typeof ref === 'function') {
          ref(value);
        } else {
          (ref as RefObject<T | null>).current = value;
        }
      });
    };

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);

    if (type === 'file') {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn('flex flex-col items-start', containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-black mb-1 text-[12px]',
            labelClassName,
          )}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        onClick={focusInputHandler}
        className={cn(
          'xs:px-[17px] xs:py-[11px] flex w-full flex-row items-center rounded-[10px] border px-[17px] py-[11px] hover:cursor-text sm:px-[17px] sm:py-[11px]',
          disabled || readOnly ? 'bg-gray-100' : '',
          type === 'file' ? 'hover:cursor-pointer' : '',
          inputClassName,
        )}
        style={{ '--input-background-color': 'white' }}
      >
        {iconLeft && (
          <div className="xs:text-[16px] xs:max-w-[33px] xs:min-w-[33px] flex h-full max-w-[33px] min-w-[33px] items-center text-[16px] sm:max-w-[33px] sm:min-w-[33px] sm:text-[16px]">
            {iconLeft}
          </div>
        )}
        <input
          ref={mergeRefs(ref, inputRef)}
          id={id}
          type={type}
          className={cn(
            'placeholder:text-black w-full bg-(--input-bg) text-[14px] placeholder:font-light focus:ring-0 focus:outline-none',
            'file:hidden',
            type === 'file' ? 'hover:cursor-pointer' : '',
            className,
          )}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChangeHandler}
          data-field={otherProps.name}
          tabIndex={0}
          {...otherProps}
        />
        {iconRight && (
          <div className="xs:text-[16px] xs:max-w-[33px] xs:min-w-[33px] flex h-full max-w-[33px] min-w-[33px] items-center justify-end text-[16px] sm:max-w-[33px] sm:min-w-[33px] sm:text-[16px]">
            {iconRight}
          </div>
        )}
      </div>
      {validationMessage && (
        <span className="mt-0.5 block text-[11px] font-light text-red-500">
          {validationMessage}
        </span>
      )}
    </div>
  );
};

export default forwardRef(Input);
