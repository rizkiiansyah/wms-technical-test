import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import NonAuthLayout from '@/components/layouts/Auth/NonAuthLayout';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: Readonly<AuthLayoutProps>) => {
  return (
    <>
      <NonAuthLayout>
        <main className='mx-auto min-h-[calc(100vh-76px-72px)] w-full max-w-[1450px]'>
          {children}
        </main>
      </NonAuthLayout>
      <ToastContainer
        autoClose={4000}
        closeOnClick
        newestOnTop
        position='top-center'
        hideProgressBar
        theme='colored'
      />
    </>
  );
};

export default AuthLayout;
