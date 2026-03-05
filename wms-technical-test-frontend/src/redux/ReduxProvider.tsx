'use client';

import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

import { store } from './store';

type ReduxProvider = {
  children: ReactNode;
};

const ReduxProvider: FC<ReduxProvider> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
