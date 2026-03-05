import { Metadata } from 'next';
import { connection } from 'next/server';

import { getTitle } from '@/utils/metadata';
import ClientWrapper from '@/components/pages/(protected)/ClientWrapper';

export async function generateMetadata(): Promise<Metadata> {
  await connection();

  return {
    title: getTitle('Home'),
    description: 'Home.',
  };
}

const Home = () => {
  return (
    <>
      <ClientWrapper />
    </>
  );
};

export default Home;
