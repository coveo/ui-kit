import type {Logger} from 'pino';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import type {GeneratedAnswerErrorPayload} from '../../features/generated-answer/generated-answer-actions.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {fetchEventSource} from '../../utils/fetch-event-source/fetch.js';
import {URLPath} from '../../utils/url-utils.js';
import {resetTimeout} from '../../utils/utils.js';
import type {GeneratedAnswerStreamEventData} from './generated-answer-event-payload.js';
import type {GeneratedAnswerStreamRequest} from './generated-answer-request.js';

interface GeneratedAnswerAPIClientOptions {
  logger: Logger;
}

export interface AsyncThunkGeneratedAnswerOptions<
  T extends Partial<SearchAppState>,
> extends AsyncThunkOptions<
    T,
    ClientThunkExtraArguments<GeneratedAnswerAPIClient>
  > {}

const buildStreamingUrl = (url: string, orgId: string, streamId: string) =>
  new URLPath(
    `${url}/rest/organizations/${orgId}/machinelearning/streaming/${streamId}`
  ).href;

const MAX_RETRIES = 3;
const MAX_TIMEOUT = 5000;
const EVENT_STREAM_CONTENT_TYPE = 'text/event-stream';
export const RETRYABLE_STREAM_ERROR_CODE = 1;

class RetryableError extends Error {}
class FatalError extends Error {
  constructor(public payload: GeneratedAnswerErrorPayload) {
    super(payload.message);
  }
}

interface StreamCallbacks {
  write: (data: GeneratedAnswerStreamEventData) => void;
  abort: (error: GeneratedAnswerErrorPayload) => void;
  close: () => void;
  resetAnswer: () => void;
}

class TimeoutStateManager {
  private timeouts: Set<ReturnType<typeof setTimeout>> = new Set();

  public add(timeout: ReturnType<typeof setTimeout>) {
    this.timeouts.add(timeout);
  }

  public remove(timeout: ReturnType<typeof setTimeout>) {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  public isActive(timeout: ReturnType<typeof setTimeout>): boolean {
    return this.timeouts.has(timeout);
  }
}

export class GeneratedAnswerAPIClient {
  private logger: Logger;

  constructor(options: GeneratedAnswerAPIClientOptions) {
    this.logger = options.logger;
  }

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    callbacks: StreamCallbacks
  ) {
    const {url, organizationId, streamId, accessToken} = params;
    const {write, abort, close, resetAnswer} = callbacks;
    const timeoutStateManager = new TimeoutStateManager();

    if (!streamId) {
      this.logger.error('No stream ID found');
      return;
    }

    let retryCount = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const retryStream = () => {
      if (timeout && !timeoutStateManager.isActive(timeout)) {
        abortController?.abort();
        resetAnswer();
        stream();
      }
    };

    const refreshTimeout = () => {
      timeoutStateManager.remove(timeout!);
      timeout = resetTimeout(retryStream, timeout, MAX_TIMEOUT);
      timeoutStateManager.add(timeout);
    };

    const abortController = new AbortController();

    const stream = () =>
      fetchEventSource(buildStreamingUrl(url, organizationId, streamId), {
        method: 'GET',
        fetch,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: '*/*',
        },
        openWhenHidden: true,
        signal: abortController?.signal,
        async onopen(response) {
          if (
            response.ok &&
            response.headers.get('content-type') === EVENT_STREAM_CONTENT_TYPE
          ) {
            return;
          }
          const isClientSideError =
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429;
          if (isClientSideError) {
            throw new FatalError({
              message: 'Error opening stream',
              code: response.status,
            });
          } else {
            throw new RetryableError();
          }
        },
        onmessage: (event) => {
          if (abortController?.signal.aborted) {
            return;
          }
          const data: GeneratedAnswerStreamEventData = JSON.parse(event.data);
          if (data.finishReason === 'ERROR') {
            timeoutStateManager.remove(timeout!);
            abortController?.abort();
            abort({
              message: data.errorMessage,
              code: data.statusCode,
            });
            return;
          }
          write(data);
          retryCount = 0;
          if (data.finishReason === 'COMPLETED') {
            timeoutStateManager.remove(timeout!);
            close();
          } else {
            refreshTimeout();
          }
        },
        onerror: (err) => {
          if (abortController?.signal.aborted) {
            return;
          }
          timeoutStateManager.remove(timeout!);
          if (err instanceof FatalError) {
            abortController?.abort();
            abort(err);
            throw err;
          }
          if (++retryCount > MAX_RETRIES) {
            this.logger.info('Maximum retry exceeded.');
            const error = {
              message: 'Failed to complete stream.',
              code: RETRYABLE_STREAM_ERROR_CODE,
            };
            abortController?.abort();
            abort(error);
            throw new FatalError(error);
          }
          this.logger.info(`Retrying...(${retryCount}/${MAX_RETRIES})`);
          resetAnswer();
        },
      });

    stream();

    return abortController;
  }
}
