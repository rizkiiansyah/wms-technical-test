import { RefObject } from 'react';

export const beforeEnter = (dialogRef: RefObject<HTMLElement | null>) => {
  const portal = dialogRef.current?.closest(
    'div[data-headlessui-portal]',
  ) as HTMLElement | null;

  if (!portal) return;

  const allPortals = Array.from(
    document.querySelectorAll('div[data-headlessui-portal]'),
  ) as HTMLElement[];

  allPortals.forEach((portal, index) => {
    portal.style.zIndex = `${100 + index}`;
    portal.style.position = 'fixed';
  });

  if (allPortals.length > 0) {
    const bodyEl = document.body;

    bodyEl.style.overflowY = 'auto';
    bodyEl.style.padding = '0';
  }
};

export const afterLeave = () => {
  const allPortals = Array.from(
    document.querySelectorAll('div[data-headlessui-portal]'),
  ) as HTMLElement[];
  const bodyEl = document.body;

  if (allPortals.length > 0) {
    bodyEl.style.overflowY = 'auto';
    bodyEl.style.padding = '0';
  } else {
    bodyEl.style.overflowY = '';
    bodyEl.style.padding = '';
  }
};
