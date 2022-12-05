import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import {
  ApiResponse,
  AttemptsNumber,
  Methods,
  RequestParams,
} from './interfaces';
import { retry, RetryError } from './retry';

/**
 * Wrapper around the request library that allows making requests and repeating them in case
 * they fail.
 * Will automatically json parse the response if the request wasn't json-encoded.
 * @param method HTTP method
 * @param baseUrl the base url - usually determined by the target environment.
 * @param endpoint the endpoint target to hit.
 * @param requestParams paramter bag for the actual request and for the request lib
 * @param retryStatusCodes array of status codes that enable retrying
 * @param attempts number of times to attempt the request if it fails
 * @param sleepTime number of ms to wait between retries
 */
export async function makeRequest({
  method,
  baseUrl,
  endpoint,
  requestParams,
  retryStatusCodes,
  attempts,
  sleepTime,
}: {
  method: Methods;
  baseUrl: string;
  endpoint?: string;
  requestParams: RequestParams;
  retryStatusCodes: number[];
  attempts: AttemptsNumber;
  sleepTime: number;
}) {
  const payload: AxiosRequestConfig = {
    ...requestParams,
    method,
  };

  // Set an identifiable user agent for tracing requests from these tests.
  if (payload.headers === undefined) {
    payload.headers = {};
  }
  payload.headers['User-Agent'] = 'bl/sarisari-api-e2e';

  if (requestParams.formData !== undefined) {
    const form = new FormData();
    Object.entries(requestParams.formData).forEach(([k, v]) => {
      form.append(k, v);
    });
    payload.data = form;
    payload.headers['Content-Type'] =
      'multipart/form-data; boundary=' + form.getBoundary();
  } else if (requestParams.data !== undefined) {
    payload.data = JSON.stringify(requestParams.data);
    payload.headers['Content-Type'] = 'application/json';
  }

  // Construct url from the domain and endpoint.
  const url = new URL(`${baseUrl}/${endpoint}`);
  const response = await getResponse(
    () => axios(url.toString(), payload),
    retryStatusCodes,
    attempts,
    sleepTime,
  );

  return response;
}

/**
 * Retrying requests is implemented mostly to avoid the slave drift,
 * and retry the request when i.e. the expected resource is not found etc.
 */
export async function getResponse(
  callback: () => AxiosPromise,
  allowedRetryStatusCodes: number[],
  attempts: AttemptsNumber,
  sleepTimeout: number = 500,
): Promise<ApiResponse> {
  // Retry the request until the response status code is not on the retry list,
  // or until it has been attempted the specified number of times.
  let rawResponse: any;
  try {
    await retry(
      async () => {
        try {
          rawResponse = await callback();
        } catch (e: any) {
          if (e.response) {
            rawResponse = e.response;
          } else {
            throw e;
          }
        }
        // If allowed to retry on this status code, raise an error to force the retry.
        if (allowedRetryStatusCodes.includes(rawResponse.status)) {
          throw new RetryError();
        }
      },
      attempts,
      sleepTimeout,
    );
    return rawResponse;
  } catch (e) {
    // If attempts were exhausted, return the last response.
    if (e instanceof RetryError) {
      return rawResponse;
    }
    throw e;
  }
}
