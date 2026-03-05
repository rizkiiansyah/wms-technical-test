/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  memo,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import Input from './';

type DebounceInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string | null;
  iconLeft?: ReactNode | null;
  iconRight?: ReactNode | null;
  id?: string;
  containerClassName?: string;
  inputClassName?: string;
  validationMessage?: string | null;
  debounce?: number;
  initialValue?: string | null;
};

const DebounceInput: ForwardRefRenderFunction<
  HTMLInputElement,
  DebounceInputProps
> = ({ initialValue, onChange, debounce = 800, ...props }, ref) => {
  const [value, setValue] = useState(initialValue ?? '');
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;

      return;
    }

    const handler = setTimeout(() => {
      if (onChange) {
        const event = {
          target: { value },
        } as any as ChangeEvent<HTMLInputElement>;

        onChange(event);
      }
    }, debounce);

    return () => clearTimeout(handler);
  }, [value, debounce, onChange]);

  return (
    <>
      <Input
        ref={ref}
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  );
};

export default memo(forwardRef(DebounceInput));
