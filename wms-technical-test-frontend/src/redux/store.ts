import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/auth';
import { orderReducer } from './slices/order';
import { logisticChannelReducer } from './slices/logisticChannel';

const rootReducer = combineReducers({
  auth: authReducer,
  order: orderReducer,
  logisticChannel: logisticChannelReducer,
});

export const store = configureStore({
  devTools: true,
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
