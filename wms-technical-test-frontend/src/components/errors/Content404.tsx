import { FC } from 'react';

import { cn } from '@/utils/cn';
import LinkButton from '../commons/Button/LinkButton';

interface Content404Props {
  containerClassName?: string | null;
  message?: string;
  buttonMessage?: string;
  buttonHref?: string;
}

const Content404: FC<Content404Props> = ({
  containerClassName,
  message = 'Error 404: Robot can’t find this page.',
  buttonMessage = 'Back to Home',
  buttonHref = '/',
}) => {
  return (
    <div
      className={cn(
        'flex min-h-[calc(100vh-76px-53px-72px)] w-full items-center',
        containerClassName,
      )}
    >
      <div className="mx-auto flex flex-col gap-6 px-5 py-8 sm:px-6">
        <div className="mx-auto max-w-[500px]">
          Error 404
        </div>
        <span className="xss:text-[23px] xs:text-[26px] text-center text-[20px] md:text-[28px]">
          {message}
        </span>
        <div className="flex justify-center">
          <LinkButton href={buttonHref}>
            {buttonMessage}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default Content404;
