import { Metadata } from 'next';
import { connection } from 'next/server';

import { getTitle } from '@/utils/metadata';
import Form from '@/components/pages/(auth)/login/Form';

export async function generateMetadata(): Promise<Metadata> {
  await connection();

  return {
    title: getTitle('Login'),
    description: 'Login.',
  };
}

const Login = () => {
  return (
    <div className='mx-auto max-w-[calc(555px+24px)] px-5 py-12 md:px-6 md:py-14'>
      <div className='mb-4 text-center'>
        <span className='text-[32px] font-bold'>Warehouse Management System</span>
      </div>
      <div className='mb-4 text-center'>
        <span className='text-[26px] font-bold'>Login</span>
      </div>
      <div className='rounded-[10px] border bg-white px-8 py-9'>
        <Form />
      </div>
    </div>
  );
};

export default Login;
