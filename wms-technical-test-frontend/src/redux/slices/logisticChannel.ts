import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getLogisticChannelDropdown as getLogisticChannelDropdownService } from '@/services/logisticChannel';
import { getErrorMessage } from '@/helpers/api';
import { BaseResponse } from '@/types/response';
import { LogisticChannel } from '@/types/logisticChannel';

type InitialState = {
  getLogisticChannelDropdownLoading: boolean;
  getLogisticChannelDropdownErrorMessage?: string | null;
  getLogisticChannelDropdownData?: BaseResponse<LogisticChannel[]> | null;
};

const initialState: InitialState = {
  getLogisticChannelDropdownLoading: false,
  getLogisticChannelDropdownErrorMessage: null,
  getLogisticChannelDropdownData: null,
};

const getLogisticChannelDropdown = createAsyncThunk(
  'logisticChannel/getLogisticChannelDropdown',
  async (_, { rejectWithValue }) => {
    try {
      return await getLogisticChannelDropdownService();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logisticChannelSlice = createSlice({
  name: 'logisticChannel',
  initialState,
  reducers: {
    getLogisticChannelDropdownReset: (state) => {
      state.getLogisticChannelDropdownData = null;
      state.getLogisticChannelDropdownErrorMessage = null;
      state.getLogisticChannelDropdownLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLogisticChannelDropdown.pending, (state) => {
        state.getLogisticChannelDropdownLoading = true;
        state.getLogisticChannelDropdownErrorMessage = null;
      })
      .addCase(getLogisticChannelDropdown.fulfilled, (state, action) => {
        state.getLogisticChannelDropdownLoading = false;
        state.getLogisticChannelDropdownData = action.payload;
      })
      .addCase(getLogisticChannelDropdown.rejected, (state, action) => {
        state.getLogisticChannelDropdownLoading = false;
        state.getLogisticChannelDropdownErrorMessage = getErrorMessage(
          action.payload
        );
      });
  },
});

export const { getLogisticChannelDropdownReset } = logisticChannelSlice.actions;

export const logisticChannelReducer = logisticChannelSlice.reducer;

export { getLogisticChannelDropdown };
