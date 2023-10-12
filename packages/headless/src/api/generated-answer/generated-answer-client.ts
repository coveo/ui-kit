import {fetchEventSource} from '@microsoft/fetch-event-source';
import {Logger} from 'pino';
import {SearchAppState} from '../../index.js';
import {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {GeneratedAnswerErrorPayload} from '../../features/generated-answer/generated-answer-actions.js';
import {createAbortController} from '../../utils/abort-controller-polyfill.js';
import {URLPath} from '../../utils/url-utils.js';
import {resetTimeout} from '../../utils/utils.js';
import {SearchAPIClient} from '../search/search-api-client.js';
import {GeneratedAnswerStreamEventData} from './generated-answer-event-payload.js';
import {GeneratedAnswerStreamRequest} from './generated-answer-request.js';

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

    if (!streamId) {
      this.logger.error('No stream ID found');
      return;
    }

    let retryCount = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const retryStream = () => {
      abortController?.abort();
      resetAnswer();
      stream();
    };

    const refreshTimeout = () => {
      timeout = resetTimeout(retryStream, timeout, MAX_TIMEOUT);
    };

    const abortController = createAbortController();

    const stream = () =>
      fetchEventSource(buildStreamingUrl(url, organizationId, streamId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: '*/*',
        },
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
          const data: GeneratedAnswerStreamEventData = JSON.parse(event.data);
          if (data.finishReason === 'ERROR') {
            clearTimeout(timeout);
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
            clearTimeout(timeout);
            close();
          } else {
            refreshTimeout();
          }
        },
        onerror: (err) => {
          clearTimeout(timeout);
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
