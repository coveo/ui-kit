import {fetchEventSource} from '@microsoft/fetch-event-source';
import {Logger} from 'pino';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {GeneratedAnswerErrorPayload} from '../../features/generated-answer/generated-answer-actions';
import {SearchAppState} from '../../state/search-app-state';
import {createAbortController} from '../../utils/abort-controller-polyfill';
import {URLPath} from '../../utils/url-utils';
import {resetTimeout} from '../../utils/utils';
import {SearchAPIClient} from '../search/search-api-client';
import {GeneratedAnswerStreamEventData} from './generated-answer-event-payload';
import {GeneratedAnswerStreamRequest} from './generated-answer-request';

export interface GeneratedAnswerAPIClientOptions {
  logger: Logger;
}

export interface AsyncThunkGeneratedAnswerOptions<
  T extends Partial<SearchAppState>,
> extends AsyncThunkOptions<
    T,
    ClientThunkExtraArguments<SearchAPIClient, GeneratedAnswerAPIClient>
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

  private abortController: AbortController | null = null;

  constructor(options: GeneratedAnswerAPIClientOptions) {
    this.logger = options.logger;
  }

  abortAnyOngoingStream() {
    this.abortController?.abort();
    this.abortController = null;
  }

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    callbacks: StreamCallbacks
  ) {
    this.abortAnyOngoingStream();
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
        this.abortAnyOngoingStream();
        resetAnswer();
        stream();
      }
    };

    const refreshTimeout = () => {
      timeoutStateManager.remove(timeout!);
      timeout = resetTimeout(retryStream, timeout, MAX_TIMEOUT);
      timeoutStateManager.add(timeout);
    };

    const stream = () => {
      this.abortAnyOngoingStream();
      this.abortController = createAbortController();

      fetchEventSource(buildStreamingUrl(url, organizationId, streamId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: '*/*',
        },
        signal: this.abortController?.signal,
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
          const data: GeneratedAnswerStreamEventData = JSON.parse(event.data);
          if (data.finishReason === 'ERROR') {
            timeoutStateManager.remove(timeout!);
            this.abortAnyOngoingStream();
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
          timeoutStateManager.remove(timeout!);
          if (err instanceof FatalError) {
            this.abortAnyOngoingStream();
            abort(err);
            throw err;
          }
          if (++retryCount > MAX_RETRIES) {
            this.logger.info('Maximum retry exceeded.');
            const error = {
              message: 'Failed to complete stream.',
              code: RETRYABLE_STREAM_ERROR_CODE,
            };
            this.abortAnyOngoingStream();
            abort(error);
            throw new FatalError(error);
          }
          this.logger.info(`Retrying...(${retryCount}/${MAX_RETRIES})`);
          resetAnswer();
        },
      });
    };

    stream();
  }
}
