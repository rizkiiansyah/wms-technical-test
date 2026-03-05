import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getErrorMessage, getRejectWithValue } from '@/helpers/api';
import {
  postAuthLogin as postAuthLoginService,
  getAuthProfile as getAuthProfileService,
  postAuthLogout as postAuthLogoutService,
} from '@/services/auth';
import {
  GetAuthProfileResponseData,
  PostAuthLoginRequest,
  PostAuthLoginResponseData,
} from '@/types/auth';
import { BaseResponse, RejectWithValue } from '@/types/response';
import { User } from '@/types/user';
import { RoleAccess } from '@/types/roleAccess';

type InitialState = {
  user?: User | null;
  roleAccesses: RoleAccess[];
  postAuthLoginLoading: boolean;
  postAuthLoginErrorMessage?: string | null;
  postAuthLoginData?: BaseResponse<PostAuthLoginResponseData> | null;
  postAuthRegisterLoading: boolean;
  postAuthRegisterErrorMessage?: string | null;
  postAuthRegisterData?: BaseResponse | null;
  getAuthProfileLoading: boolean;
  getAuthProfileErrorMessage?: string | null;
  getAuthProfileStatus:
    | 'idle'
    | 'loading'
    | 'authenticated'
    | 'unauthenticated'
    | 'error';
  getAuthProfileData?: BaseResponse<GetAuthProfileResponseData> | null;
  postAuthLogoutLoading: boolean;
  postAuthLogoutErrorMessage?: string | null;
  postAuthLogoutData?: BaseResponse | null;
};

const initialState: InitialState = {
  user: null,
  roleAccesses: [],
  postAuthLoginLoading: false,
  postAuthLoginErrorMessage: null,
  postAuthLoginData: null,
  postAuthRegisterLoading: false,
  postAuthRegisterErrorMessage: null,
  postAuthRegisterData: null,
  getAuthProfileLoading: false,
  getAuthProfileErrorMessage: null,
  getAuthProfileData: null,
  getAuthProfileStatus: 'idle',
  postAuthLogoutLoading: false,
  postAuthLogoutErrorMessage: null,
  postAuthLogoutData: null,
};

const postAuthLogin = createAsyncThunk(
  'auth/postAuthLogin',
  async (payload: PostAuthLoginRequest, { rejectWithValue }) => {
    try {
      return await postAuthLoginService(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const postAuthLogout = createAsyncThunk(
  'auth/postAuthLogout',
  async (_, { rejectWithValue }) => {
    try {
      return await postAuthLogoutService();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const getAuthProfile = createAsyncThunk<
  BaseResponse<GetAuthProfileResponseData>,
  void,
  { rejectValue: RejectWithValue }
>('auth/getAuthProfile', async (_, { rejectWithValue }) => {
  try {
    return await getAuthProfileService();
  } catch (error) {
    return rejectWithValue(getRejectWithValue(error));
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null | undefined>) => {
      state.user = action.payload;
    },
    setRoleAccesses: (state, action: PayloadAction<RoleAccess[]>) => {
      state.roleAccesses = action.payload;
    },
    postAuthLoginReset: (state) => {
      state.postAuthLoginData = null;
      state.postAuthLoginErrorMessage = null;
      state.postAuthLoginLoading = false;
    },
    getAuthProfileReset: (state) => {
      state.getAuthProfileData = null;
      state.getAuthProfileErrorMessage = null;
      state.getAuthProfileLoading = false;
      state.getAuthProfileStatus = 'idle';
    },
    postAuthLogoutReset: (state) => {
      state.postAuthLogoutData = null;
      state.postAuthLogoutErrorMessage = null;
      state.postAuthLogoutLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postAuthLogin.pending, (state) => {
        state.postAuthLoginLoading = true;
        state.postAuthLoginErrorMessage = null;
      })
      .addCase(postAuthLogin.fulfilled, (state, action) => {
        state.postAuthLoginLoading = false;
        state.postAuthLoginData = action.payload;
      })
      .addCase(postAuthLogin.rejected, (state, action) => {
        state.postAuthLoginLoading = false;
        state.postAuthLoginErrorMessage = getErrorMessage(action.payload);
      });
    builder
      .addCase(getAuthProfile.pending, (state) => {
        state.getAuthProfileLoading = true;
        state.getAuthProfileErrorMessage = null;
        state.getAuthProfileStatus = 'loading';
      })
      .addCase(getAuthProfile.fulfilled, (state, action) => {
        state.getAuthProfileLoading = false;
        state.getAuthProfileData = action.payload;
        state.getAuthProfileStatus = 'authenticated';
      })
      .addCase(getAuthProfile.rejected, (state, action) => {
        state.getAuthProfileLoading = false;
        state.getAuthProfileErrorMessage = getErrorMessage(
          action.payload?.response
        );
        state.getAuthProfileData = null;

        if (action.payload?.statusCode === 401) {
          state.getAuthProfileStatus = 'unauthenticated';
        } else {
          state.getAuthProfileStatus = 'error';
        }
      });
    builder
      .addCase(postAuthLogout.pending, (state) => {
        state.postAuthLogoutLoading = true;
        state.postAuthLogoutErrorMessage = null;
      })
      .addCase(postAuthLogout.fulfilled, (state, action) => {
        state.postAuthLogoutLoading = false;
        state.postAuthLogoutData = action.payload;
      })
      .addCase(postAuthLogout.rejected, (state, action) => {
        state.postAuthLogoutLoading = false;
        state.postAuthLogoutErrorMessage = getErrorMessage(action.payload);
      });
  },
});

export const {
  setUser,
  setRoleAccesses,
  postAuthLoginReset,
  getAuthProfileReset,
  postAuthLogoutReset,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

export { postAuthLogin, getAuthProfile, postAuthLogout };
