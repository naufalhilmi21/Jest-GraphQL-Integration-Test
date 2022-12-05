import { AttemptsNumber } from './interfaces';
import { sleep } from './sleep';

/**
 * Retries the `callback` `attempts` number of times, with `sleepTime` between each retry.
 */
export async function retry(
  callback: () => void,
  attempts: AttemptsNumber = 5,
  sleepTime: number = 500,
) {
  while (attempts >= 1) {
    try {
      await callback();
      return;
    } catch (e) {
      if (attempts === 1) {
        throw e;
      }
    }
    attempts -= 1;
    await sleep(sleepTime);
  }
}

/**
 * Create a custom error to throw to trigger the retry() helper.
 * retry() will retry a given callback if it encounters an error (usually from an expect failing).
 * This allows us to force the callback to retry even if it executes successfully.
 */
export class RetryError extends Error {
  /**
   * Create the error
   */
  constructor() {
    super();
    Object.setPrototypeOf(this, RetryError.prototype);
  }
}
