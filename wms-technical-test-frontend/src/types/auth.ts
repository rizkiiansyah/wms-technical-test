import { RoleAccess } from './roleAccess';
import { User } from './user';

export type PostAuthLoginRequest = {
  email: string;
  password: string;
};

export type PostAuthLoginResponseData = {
  access_token?: string | null;
  refresh_token?: string | null;
  user?: User | null;
};

export type GetAuthProfileResponseData = {
  user?: User | null;
  role_accesses?: RoleAccess[] | null;
};

export type PostAuthRefreshTokenRequest = {
  access_token?: string | null;
  refresh_token?: string | null;
};

export type PostAuthRefreshTokenResponseData = {
  access_token?: string | null;
  refresh_token?: string | null;
};
