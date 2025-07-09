import type {Logger} from 'pino';

export class APICallsQueue {
  private currentAbortController: AbortController | null = null;

  /**
   * Enqueue an API call so that it can get cancelled if another call is enqueued before it finishes.
   */
  public async enqueue<T>(
    call: (signal: AbortSignal | null) => Promise<T>,
    options: {logger: Logger; warnOnAbort: boolean}
  ) {
    const lastAbortController = this.currentAbortController;
    this.currentAbortController = new AbortController();
    const abortController = this.currentAbortController;
    if (lastAbortController) {
      if (options.warnOnAbort) {
        options.logger.warn('Cancelling current pending search query');
      }
      lastAbortController.abort();
    }
    try {
      return await call(abortController?.signal ?? null);
    } finally {
      if (this.currentAbortController === abortController) {
        this.currentAbortController = null;
      }
    }
  }
}
