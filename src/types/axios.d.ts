// src/types/axios.d.ts

declare module 'axios' {
    export interface AxiosRequestConfig {
      url?: string;
      method?: string;
      baseURL?: string;
      headers?: any;
      params?: any;
      data?: any;
      timeout?: number;
      withCredentials?: boolean;
      responseType?: string;
      xsrfCookieName?: string;
      xsrfHeaderName?: string;
      onUploadProgress?: (progressEvent: any) => void;
      onDownloadProgress?: (progressEvent: any) => void;
      maxContentLength?: number;
      validateStatus?: (status: number) => boolean;
      maxRedirects?: number;
      httpAgent?: any;
      httpsAgent?: any;
    }
  
    export interface AxiosResponse<T = any> {
      data: T;
      status: number;
      statusText: string;
      headers: any;
      config: AxiosRequestConfig;
      request?: any;
    }
  
    export interface AxiosError<T = any> extends Error {
      config: AxiosRequestConfig;
      code?: string;
      request?: any;
      response?: AxiosResponse<T>;
      isAxiosError: boolean;
      toJSON: () => object;
    }
  
    export interface AxiosInstance {
      (config: AxiosRequestConfig): Promise<AxiosResponse>;
      (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
      defaults: AxiosRequestConfig;
      get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
      post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
      put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
      delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
      head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
      options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
      patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    }
  
    export function create(config?: AxiosRequestConfig): AxiosInstance;
    export function isCancel(value: any): boolean;
    export function isAxiosError(payload: any): payload is AxiosError;
    
    const axios: AxiosInstance & {
      isAxiosError: (payload: any) => payload is AxiosError;
    };
    export default axios;
  }