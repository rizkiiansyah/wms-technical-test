import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getOrder as getOrderService,
  postOrderPick as postOrderPickService,
  postOrderPack as postOrderPackService,
  postOrderShip as postOrderShipService,
} from '@/services/order';
import { getErrorMessage } from '@/helpers/api';
import { BaseResponse } from '@/types/response';
import { Order } from '@/types/order';

type InitialState = {
  getOrderLoading: boolean;
  getOrderErrorMessage?: string | null;
  getOrderData?: BaseResponse<Order> | null;
  postOrderPickLoading: boolean;
  postOrderPickErrorMessage?: string | null;
  postOrderPickData?: BaseResponse<Order> | null;
  postOrderPackLoading: boolean;
  postOrderPackErrorMessage?: string | null;
  postOrderPackData?: BaseResponse<Order> | null;
  postOrderShipLoading: boolean;
  postOrderShipErrorMessage?: string | null;
  postOrderShipData?: BaseResponse<Order> | null;
};

const initialState: InitialState = {
  getOrderLoading: false,
  getOrderErrorMessage: null,
  getOrderData: null,
  postOrderPickLoading: false,
  postOrderPickErrorMessage: null,
  postOrderPickData: null,
  postOrderPackLoading: false,
  postOrderPackErrorMessage: null,
  postOrderPackData: null,
  postOrderShipLoading: false,
  postOrderShipErrorMessage: null,
  postOrderShipData: null,
};

const getOrder = createAsyncThunk(
  'order/getOrder',
  async (orderSN: string, { rejectWithValue }) => {
    try {
      return await getOrderService(orderSN);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const postOrderPick = createAsyncThunk(
  'order/postOrderPick',
  async (orderSN: string, { rejectWithValue }) => {
    try {
      return await postOrderPickService(orderSN);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const postOrderPack = createAsyncThunk(
  'order/postOrderPack',
  async (orderSN: string, { rejectWithValue }) => {
    try {
      return await postOrderPackService(orderSN);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const postOrderShip = createAsyncThunk(
  'order/postOrderShip',
  async (
    { orderSN, data }: { orderSN: string; data: { channel_id: string } },
    { rejectWithValue },
  ) => {
    try {
      return await postOrderShipService(orderSN, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    getOrderReset: (state) => {
      state.getOrderData = null;
      state.getOrderErrorMessage = null;
      state.getOrderLoading = false;
    },
    postOrderPickReset: (state) => {
      state.postOrderPickData = null;
      state.postOrderPickErrorMessage = null;
      state.postOrderPickLoading = false;
    },
    postOrderPackReset: (state) => {
      state.postOrderPackData = null;
      state.postOrderPackErrorMessage = null;
      state.postOrderPackLoading = false;
    },
    postOrderShipReset: (state) => {
      state.postOrderShipData = null;
      state.postOrderShipErrorMessage = null;
      state.postOrderShipLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrder.pending, (state) => {
        state.getOrderLoading = true;
        state.getOrderErrorMessage = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.getOrderLoading = false;
        state.getOrderData = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.getOrderLoading = false;
        state.getOrderErrorMessage = getErrorMessage(action.payload);
      });
    builder
      .addCase(postOrderPick.pending, (state) => {
        state.postOrderPickLoading = true;
        state.postOrderPickErrorMessage = null;
      })
      .addCase(postOrderPick.fulfilled, (state, action) => {
        state.postOrderPickLoading = false;
        state.postOrderPickData = action.payload;
      })
      .addCase(postOrderPick.rejected, (state, action) => {
        state.postOrderPickLoading = false;
        state.postOrderPickErrorMessage = getErrorMessage(action.payload);
      });
    builder
      .addCase(postOrderPack.pending, (state) => {
        state.postOrderPackLoading = true;
        state.postOrderPackErrorMessage = null;
      })
      .addCase(postOrderPack.fulfilled, (state, action) => {
        state.postOrderPackLoading = false;
        state.postOrderPackData = action.payload;
      })
      .addCase(postOrderPack.rejected, (state, action) => {
        state.postOrderPackLoading = false;
        state.postOrderPackErrorMessage = getErrorMessage(action.payload);
      });
    builder
      .addCase(postOrderShip.pending, (state) => {
        state.postOrderShipLoading = true;
        state.postOrderShipErrorMessage = null;
      })
      .addCase(postOrderShip.fulfilled, (state, action) => {
        state.postOrderShipLoading = false;
        state.postOrderShipData = action.payload;
      })
      .addCase(postOrderShip.rejected, (state, action) => {
        state.postOrderShipLoading = false;
        state.postOrderShipErrorMessage = getErrorMessage(action.payload);
      });
  },
});

export const { getOrderReset, postOrderPickReset, postOrderPackReset, postOrderShipReset } = orderSlice.actions;

export const orderReducer = orderSlice.reducer;

export { getOrder, postOrderPick, postOrderPack, postOrderShip };
