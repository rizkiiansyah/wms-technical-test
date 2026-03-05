import { FC } from 'react';

import { cn } from '@/utils/cn';
import LinkButton from '../commons/Button/LinkButton';

interface ContentErrorProps {
  containerClassName?: string | null;
  message?: string;
  buttonMessage?: string;
  buttonHref?: string;
}

const ContentError: FC<ContentErrorProps> = ({
  containerClassName,
  message = 'Look like you are lost in space',
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
          Error
        </div>
        <span className="xss:text-[23px] xs:text-[26px] text-center text-[20px] text-white md:text-[28px]">
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

export default ContentError;
