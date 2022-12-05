import { AxiosResponse } from 'axios';

export type Methods =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH';
export type AttemptsNumber = 1 | 2 | 3 | 4 | 5;

export interface UrlParams {
  [key: string]: urlparam;
}

export interface RequestParams {
  params?: UrlParams;
  // Will be sent with application/json content type
  data?: object;
  // Will be sent with multipart/form-data content type
  formData?: object;
  headers?: Headers;
}

type urlparam = string | number | boolean | Array<number | string>;

export interface Headers {
  [key: string]: string;
}

export type ApiResponse = AxiosResponse;
