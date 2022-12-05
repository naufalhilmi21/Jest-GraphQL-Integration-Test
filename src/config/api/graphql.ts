import { AttemptsNumber, RequestParams } from './interfaces';
import { makeRequest } from './requests';
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Wrapper for making API calls to the graphql server.
 */
export async function graphql(
  {
    requestParams = {},
    retryStatusCodes = [],
    attempts = 1,
    sleepTime = 500,
  }: {
    requestParams?: RequestParams;
    retryStatusCodes?: number[];
    attempts?: AttemptsNumber;
    sleepTime?: number;
  } = {},
) {
  return makeRequest({
    method: 'POST',
    baseUrl: process.env.CONFIG_BASEURL || '',
    endpoint: '/graphql',
    requestParams,
    retryStatusCodes,
    attempts,
    sleepTime,
  });
}
