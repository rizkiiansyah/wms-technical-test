import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    requireAccessToken?: boolean;
    isFormData?: boolean;
    _retry?: boolean;
  }
}
