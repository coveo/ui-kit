import {fetchEventSource} from '@microsoft/fetch-event-source';
import {Logger} from 'pino';
import {SearchAppState} from '../..';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {GeneratedAnswerErrorPayload} from '../../features/generated-answer/generated-answer-actions';
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
  T extends Partial<SearchAppState>
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
  write: (data: GeneratedAnswerStreamEventData, streamId: string) => void;
  abort: (
    error: GeneratedAnswerErrorPayload,
    streamId: string,
    abortController?: AbortController
  ) => void;
  close: (streamId: string) => void;
  resetAnswer: (streamId: string) => void;
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
      resetAnswer(streamId);
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
            abort(
              {
                message: data.errorMessage,
                code: data.statusCode,
              },
              streamId,
              abortController ?? undefined
            );
            return;
          }
          write(data, streamId);
          retryCount = 0;
          if (data.finishReason === 'COMPLETED') {
            clearTimeout(timeout);
            close(streamId);
          } else {
            refreshTimeout();
          }
        },
        onerror: (err) => {
          clearTimeout(timeout);
          if (err instanceof FatalError) {
            abort(err, streamId, abortController ?? undefined);
            throw err;
          }
          if (++retryCount > MAX_RETRIES) {
            this.logger.info('Maximum retry exceeded.');
            const error = {
              message: 'Failed to complete stream.',
              code: RETRYABLE_STREAM_ERROR_CODE,
            };
            abort(error, streamId, abortController ?? undefined);
            throw new FatalError(error);
          }
          this.logger.info(`Retrying...(${retryCount}/${MAX_RETRIES})`);
          resetAnswer(streamId);
        },
      });

    stream();

    return abortController;
  }
}
