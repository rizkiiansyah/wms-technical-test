/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ReactNode, Fragment, MouseEvent, Key, CSSProperties } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa6';
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';
import { IoClose } from 'react-icons/io5';
import {
  size as floatingUiSize,
  useFloating,
  ReferenceType,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

import { Select as TSelect } from '@/types/select';
import { cn } from '@/utils/cn';

export interface SelectProps<
  T extends FieldValues | any = any,
  V extends Key | null | undefined = any
> {
  name?: T extends FieldValues ? Path<T> : never;
  control?: T extends FieldValues ? Control<T> : never;
  id?: string;
  label?: string | null;
  placeholder?: string;
  selected?: TSelect<V, any> | null;
  options?: TSelect<V, any>[];
  containerClassName?: string;
  inputClassName?: string;
  required?: boolean;
  iconLeft?: React.ReactNode | null;
  validationMessage?: string | null;
  onChange?: (value: TSelect<V, any> | null) => void | null;
  unselectValue?: () => void | null;
  showUnselectValue?: boolean;
  size?: 'small' | 'normal';
  value?: T;
  isOptionsLoading?: boolean;
}

const Select = <T extends FieldValues | any, V extends Key | null | undefined>({
  name,
  control,
  id,
  label,
  options = [],
  selected,
  containerClassName,
  inputClassName,
  required = false,
  iconLeft,
  placeholder,
  // iconRight,
  validationMessage,
  onChange,
  unselectValue,
  showUnselectValue = false,
  size = 'normal',
  isOptionsLoading = false,
}: SelectProps<T, V>) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      offset(0),
      flip(),
      shift(),
      floatingUiSize({
        apply({ rects, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  let listboxButtonClassName = 'px-[17px] py-[11px]';
  listboxButtonClassName =
    size === 'small'
      ? 'xs:px-[15px] xs:py-[9px] px-[15px] py-[9px] sm:px-[15px] sm:py-[10px]'
      : listboxButtonClassName;

  return (
    <>
      <div className={cn('flex flex-col items-start', containerClassName)}>
        {label && (
          <label htmlFor={id} className='mb-1 text-[12px]'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        )}
        <div
          className={cn(
            'flex w-full flex-row items-center rounded-[10px] border hover:cursor-pointer',
            inputClassName
          )}
        >
          {name && control ? (
            <UseReactHookForm
              name={name}
              control={control}
              iconLeft={iconLeft}
              placeholder={placeholder}
              options={options}
              onChange={onChange}
              unselectValue={unselectValue}
              listboxButtonClassName={listboxButtonClassName}
              setReference={refs.setReference}
              setFloating={refs.setFloating}
              floatingStyles={floatingStyles}
              isOptionsLoading={isOptionsLoading}
            />
          ) : (
            <Base
              name={name}
              iconLeft={iconLeft}
              placeholder={placeholder}
              selected={selected}
              options={options}
              onChange={onChange}
              unselectValue={unselectValue}
              showUnselectValue={showUnselectValue}
              listboxButtonClassName={listboxButtonClassName}
              setReference={refs.setReference}
              setFloating={refs.setFloating}
              floatingStyles={floatingStyles}
              isOptionsLoading={isOptionsLoading}
            />
          )}
        </div>
        {validationMessage && (
          <span className='mt-0.5 block text-[11px] font-light text-red-500'>
            {validationMessage}
          </span>
        )}
      </div>
    </>
  );
};

export default Select;

interface UseReactHookFormProps<
  T extends FieldValues,
  V extends Key | null | undefined
> {
  name: Path<T>;
  control?: Control<T>;
  placeholder?: string;
  options?: TSelect<V, any>[];
  inputClassName?: string;
  iconLeft?: ReactNode | null;
  listboxButtonClassName?: string;
  setReference: ((node: ReferenceType | null) => void) &
    ((node: ReferenceType | null) => void);
  setFloating: ((node: HTMLElement | null) => void) &
    ((node: HTMLElement | null) => void);
  onChange?: (opt: TSelect<V, any> | null) => void | null;
  unselectValue?: () => void | null;
  floatingStyles: CSSProperties;
  isOptionsLoading?: boolean;
}

const UseReactHookForm = <
  T extends FieldValues,
  V extends Key | null | undefined
>({
  name,
  control,
  options = [],
  iconLeft,
  placeholder,
  listboxButtonClassName,
  setReference,
  setFloating,
  onChange,
  unselectValue,
  floatingStyles,
  isOptionsLoading,
}: UseReactHookFormProps<T, V>) => {
  const unselectValueHandler = (
    e: MouseEvent<HTMLDivElement>,
    field: ControllerRenderProps<T, Path<T>>
  ) => {
    e.stopPropagation();

    if (unselectValue) {
      unselectValue();
    }

    field.onChange(null);
  };

  const onChangeHandler = (
    field: ControllerRenderProps<T, Path<T>>,
    value: TSelect<V, any> | null
  ) => {
    if (onChange) {
      onChange(value);
    } else {
      field.onChange(value);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selected =
          options.find((opt) => opt.value === field.value?.value) ?? null;
        const newPlaceholder = selected?.label
          ? selected?.label
          : placeholder !== undefined
          ? placeholder !== ''
            ? placeholder
            : ''
          : '';

        return (
          <Listbox
            value={selected}
            onChange={(opt) => onChangeHandler(field, opt)}
          >
            <div className='relative w-full'>
              <ListboxButton
                ref={(el) => {
                  field.ref(el);
                  setReference(el);
                }}
                data-field={name}
                tabIndex={0}
                className={cn(
                  'flex w-full appearance-none flex-row items-center text-left hover:cursor-pointer focus:outline-none',
                  listboxButtonClassName
                )}
              >
                {iconLeft && (
                  <div className='xs:max-w-[22px] xs:min-w-[22px] me-2.5 flex h-full max-h-[21px] max-w-[22px] min-w-[22px] items-center text-[18px] sm:max-w-[22px] sm:min-w-[22px]'>
                    {iconLeft}
                  </div>
                )}
                <div
                  className={cn(
                    'min-h-[21px] truncate pe-6 text-[14px]',
                  )}
                >
                  {newPlaceholder}
                </div>
                <div className='absolute top-1/2 right-4 flex h-full -translate-y-1/2 items-center bg-white ps-1'>
                  {selected && (
                    <div className='me-2 flex h-full items-center bg-white'>
                      <div
                        className='px-1.5 py-1.5'
                        onClick={(e) => unselectValueHandler(e, field)}
                      >
                        <IoClose className='size-[19px] text-gray-500' />
                      </div>
                    </div>
                  )}
                  <FaChevronDown className='size-3.5 text-gray-500 sm:text-[15px]' />
                </div>
              </ListboxButton>
              <FloatingPortal>
                <div
                  ref={setFloating}
                  style={floatingStyles}
                  className='absolute z-999'
                >
                  <Transition
                    as={Fragment}
                    enter='transition-all ease-out duration-200'
                    enterFrom='opacity-0 -translate-y-2'
                    enterTo='opacity-100 translate-y-0'
                    leave='transition-all ease-in duration-150'
                    leaveFrom='opacity-100 translate-y-0'
                    leaveTo='opacity-0 -translate-y-2'
                  >
                    <ListboxOptions
                      static
                      className='z-10 mt-2 max-h-[315px] overflow-hidden overflow-y-auto rounded-[10px] bg-white shadow-lg focus:outline-none'
                    >
                      {isOptionsLoading && (
                        <div className='px-4 py-3'>Loading</div>
                      )}
                      {!isOptionsLoading && options.length < 1 && (
                        <div className='px-4 py-3 text-center text-[14px] hover:cursor-default'>
                          No data found
                        </div>
                      )}
                      {!isOptionsLoading &&
                        options.map((opt) => (
                          <ListboxOption
                            key={opt.value}
                            value={opt}
                            as={Fragment}
                          >
                            {({ selected }) => (
                              <div
                                className={cn(
                                  'hover:bg-gray-100 cursor-pointer px-4 py-3 text-[14px] select-none hover:text-black',
                                  selected
                                    ? 'bg-gray-100 text-black'
                                    : ''
                                )}
                              >
                                {opt.label}
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                    </ListboxOptions>
                  </Transition>
                </div>
              </FloatingPortal>
            </div>
          </Listbox>
        );
      }}
    />
  );
};

interface BaseProps<T extends Key | null | undefined> {
  name?: string;
  placeholder?: string;
  options?: TSelect<T, any>[];
  selected?: TSelect<T, any> | null;
  inputClassName?: string;
  iconLeft?: ReactNode | null;
  onChange?: (value: TSelect<T, any> | null) => void | null;
  unselectValue?: () => void | null;
  showUnselectValue?: boolean;
  listboxButtonClassName?: string;
  setReference: ((node: ReferenceType | null) => void) &
    ((node: ReferenceType | null) => void);
  setFloating: ((node: HTMLElement | null) => void) &
    ((node: HTMLElement | null) => void);
  floatingStyles: CSSProperties;
  isOptionsLoading?: boolean;
}

const Base = <T extends Key | null | undefined>({
  name,
  options = [],
  selected,
  iconLeft,
  placeholder,
  onChange,
  unselectValue,
  showUnselectValue = true,
  listboxButtonClassName,
  setReference,
  setFloating,
  floatingStyles,
  isOptionsLoading,
}: BaseProps<T>) => {
  const newPlaceholder = selected?.label
    ? selected?.label
    : placeholder !== undefined
    ? placeholder !== ''
      ? placeholder
      : ''
    : '';

  const onChangeHandler = (value: TSelect<T, any> | null) => {
    if (onChange) {
      onChange(value);
    }
  };

  const unselectValueHandler = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (unselectValue) {
      unselectValue();
    } else {
      if (onChange) {
        onChange(null);
      }
    }
  };

  return (
    <Listbox value={selected} onChange={onChangeHandler}>
      <div className='relative w-full'>
        <ListboxButton
          ref={setReference}
          data-field={name}
          tabIndex={0}
          className={cn(
            'flex w-full appearance-none flex-row items-center text-left hover:cursor-pointer focus:outline-none',
            listboxButtonClassName
          )}
        >
          {iconLeft && (
            <div className='xs:max-w-[22px] xs:min-w-[22px] me-2.5 flex h-full max-h-[21px] max-w-[22px] min-w-[22px] items-center text-[18px] sm:max-w-[22px] sm:min-w-[22px]'>
              {iconLeft}
            </div>
          )}
          <div
            className={cn(
              'min-h-[21px] truncate pe-6 text-[14px]',
              !selected ? 'text-black' : ''
            )}
          >
            {newPlaceholder}
          </div>
          <div className='absolute top-1/2 right-4 flex h-full -translate-y-1/2 items-center bg-white ps-1'>
            {showUnselectValue && selected && (
              <div className='me-2 flex h-full items-center bg-white'>
                <div
                  className='px-1.5 py-1.5'
                  onClick={(e) => unselectValueHandler(e)}
                >
                  <IoClose className='size-[19px] text-gray-500' />
                </div>
              </div>
            )}
            <FaChevronDown className='size-3.5 text-gray-500 sm:text-[15px]' />
          </div>
        </ListboxButton>
        <FloatingPortal>
          <div
            ref={setFloating}
            style={floatingStyles}
            className='absolute z-999'
          >
            <Transition
              as={Fragment}
              enter='transition-all ease-out duration-200'
              enterFrom='opacity-0 -translate-y-2'
              enterTo='opacity-100 translate-y-0'
              leave='transition-all ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 -translate-y-2'
            >
              <ListboxOptions
                static
                className='z-10 mt-2 max-h-[315px] w-full overflow-hidden overflow-y-auto rounded-[10px] bg-white shadow-lg focus:outline-none'
              >
                {isOptionsLoading && <div className='px-4 py-3'>Loading</div>}
                {!isOptionsLoading && options.length < 1 && (
                  <div className='px-4 py-3 text-center text-[14px] hover:cursor-default'>
                    No data found
                  </div>
                )}
                {!isOptionsLoading &&
                  options.map((opt) => (
                    <ListboxOption key={opt.value} value={opt} as={Fragment}>
                      {({ selected }) => (
                        <div
                          className={cn(
                            'text-md hover:bg-gray-100 cursor-pointer px-4 py-3 text-[14px] select-none hover:text-black',
                            selected
                              ? 'bg-gray-100 text-black'
                              : 'text-gray-700'
                          )}
                        >
                          {opt.label}
                        </div>
                      )}
                    </ListboxOption>
                  ))}
              </ListboxOptions>
            </Transition>
          </div>
        </FloatingPortal>
      </div>
    </Listbox>
  );
};
