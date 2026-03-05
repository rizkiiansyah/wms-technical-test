import { cn } from '@/utils/cn';
import { ToastContentProps } from 'react-toastify';

interface BaseProps {
  title?: string | null;
  message?: string | null;
}

const Base = ({
  data: { title, message },
  toastProps: { theme },
}: ToastContentProps<BaseProps>) => {
  const textClassName = theme === 'colored' ? 'text-white' : 'text-black';

  return (
    <div className={cn('flex flex-col ps-0.5', textClassName)}>
      <h3 className="text-[16px] font-semibold">{title}</h3>
      <p className="text-[13px]">{message}</p>
    </div>
  );
};

export default Base;
