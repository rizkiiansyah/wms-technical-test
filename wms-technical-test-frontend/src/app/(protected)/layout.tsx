import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import DashboardAuthLayout from '@/components/layouts/Auth/DashboardAuthLayout';

interface ProctectedLayoutProps {
  children: ReactNode;
}

const ProctectedLayout = ({ children }: Readonly<ProctectedLayoutProps>) => {
  return (
    <>
      <DashboardAuthLayout>
        <DashboardLayout>{children}</DashboardLayout>
      </DashboardAuthLayout>
      <ToastContainer autoClose={4000} closeOnClick newestOnTop />
    </>
  );
};

export default ProctectedLayout;
