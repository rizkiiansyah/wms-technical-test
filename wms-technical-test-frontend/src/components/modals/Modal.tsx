'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { FC, Fragment, ReactNode, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';

import { cn } from '@/utils/cn';
import { beforeEnter, afterLeave } from '@/utils/modal';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onClose?: (() => void) | null;
  autoClose?: number | boolean | null;
  onClosed?: (() => void) | null;
  dialogPanelClassName?: string;
  contentClassName?: string;
  showXCloseButton?: boolean;
  children?: ReactNode;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  setIsOpen,
  onClose,
  autoClose = null,
  onClosed,
  dialogPanelClassName,
  contentClassName,
  showXCloseButton = false,
  children,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const panelWrapperRef = useRef<HTMLElement | null>(null);

  const afterLeaveHandler = () => {
    afterLeave();

    if (onClosed) {
      onClosed();
    }
  };

  const beforeEnterHandler = () => {
    fixPanelWrapper();
    beforeEnter(dialogRef);
  };

  const fixPanelWrapper = () => {
    if (panelRef.current) {
      const panelHeight = panelRef.current.getBoundingClientRect().height;

      if (panelHeight > window.innerHeight) {
        if (panelWrapperRef.current) {
          panelWrapperRef.current.classList.remove('md:items-center');
        }
      }
    }
  };

  const afterEnterHandler = () => {
    //
  };

  useEffect(() => {
    if (!isOpen) {
      if (onClose) {
        onClose();
      }
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && autoClose && typeof autoClose === 'number') {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);

        timeoutRef.current = null;
      }, autoClose);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = null;
      }
    };
  }, [autoClose, isOpen, setIsOpen]);

  // useEffect(() => {
  //   if (!panelWrapperRef.current) return;

  //   const observer = new ResizeObserver((entries) => {
  //     for (const entry of entries) {
  //       const panelHeight = entry.contentRect.height;

  //       if (panelHeight > window.innerHeight) {
  //         if (panelWrapperRef.current) {
  //           panelWrapperRef.current.classList.remove('md:items-center');
  //         }
  //       }
  //     }
  //   });

  //   observer.observe(panelWrapperRef.current);

  //   return () => observer.disconnect();
  // }, [isOpen]);

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      afterLeave={afterLeaveHandler}
      beforeEnter={beforeEnterHandler}
    >
      <Dialog
        ref={dialogRef}
        static
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="duration-[150ms] ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-[150ms] ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterEnter={afterEnterHandler}
        >
          <DialogBackdrop className="fixed inset-0 z-100 bg-black/75" />
        </TransitionChild>
        <div
          ref={(node) => {
            panelWrapperRef.current = node;
          }}
          className="fixed inset-0 z-101 min-h-[calc(100vh)] w-full overflow-y-auto"
        >
          <TransitionChild
            as={Fragment}
            enter="duration-[150ms] ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-[150ms] ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogPanel
              ref={(node) => {
                panelRef.current = node;
              }}
              className={cn(
                'relative m-4 mx-auto flex min-h-[calc(100vh-32px)] w-[calc(100%-2rem)] max-w-2xl flex-col items-center justify-center overflow-hidden',
                dialogPanelClassName,
              )}
              onClick={() => setIsOpen(false)}
            >
              <div
                className={cn(
                  'relative w-full rounded-[10px] bg-white px-6 py-7 sm:px-7 sm:py-8 md:px-8 md:py-9',
                  contentClassName,
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {showXCloseButton && (
                  <div
                    className="absolute top-[15] right-[15] hover:cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <IoClose className="text-[28px]" />
                  </div>
                )}
                {children}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
