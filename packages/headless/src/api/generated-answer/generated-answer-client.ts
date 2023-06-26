import {fetchEventSource} from '@microsoft/fetch-event-source';
import {Logger} from 'pino';
import {SearchAppState} from '../..';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {GeneratedAnswerErrorPayload} from '../../features/generated-answer/generated-answer-actions';
import {URLPath} from '../../utils/url-utils';
import {resetTimeout} from '../../utils/utils';
import {SearchAPIClient} from '../search/search-api-client';
import {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
  GeneratedAnswerPayloadType,
  GeneratedAnswerStreamEventData,
} from './generated-answer-event-payload';
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
  );

const MAX_RETRIES = 3;
const MAX_TIMEOUT = 5000;
const EVENT_STREAM_CONTENT_TYPE = 'text/event-stream';
export const RETRYABLE_STREAM_ERROR_CODE = 1;

class RetryableError extends Error {}
class FatalError extends Error {}

interface DispatchActions {
  updateMessage: (payload: GeneratedAnswerMessagePayload) => void;
  updateCitations: (payload: GeneratedAnswerCitationsPayload) => void;
  updateError: (payload: GeneratedAnswerErrorPayload) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetAnswer: () => void;
}

export class GeneratedAnswerAPIClient {
  private logger: Logger;

  constructor(options: GeneratedAnswerAPIClientOptions) {
    this.logger = options.logger;
  }

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    actions: DispatchActions
  ) {
    const {url, organizationId, streamId, accessToken} = params;

    if (!streamId) {
      this.logger.error('No stream ID found');
      return;
    }

    let retryCount = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const retryStream = () => {
      abortController?.abort();
      actions.resetAnswer();
      stream();
    };

    const refreshTimeout = () => {
      timeout = resetTimeout(retryStream, timeout, MAX_TIMEOUT);
    };

    const handleStreamPayload = (
      payloadType: GeneratedAnswerPayloadType,
      payload: string
    ) => {
      if (payloadType === 'genqa.messageType') {
        actions.updateMessage(
          JSON.parse(payload) as GeneratedAnswerMessagePayload
        );
      } else if (payloadType === 'genqa.citationsType') {
        actions.updateCitations(
          JSON.parse(payload) as GeneratedAnswerCitationsPayload
        );
      }
    };

    const abortController = new AbortController();

    const stream = () =>
      fetchEventSource(buildStreamingUrl(url, organizationId, streamId).href, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: abortController.signal,
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
            throw new FatalError();
          } else {
            throw new RetryableError();
          }
        },
        onmessage: (event) => {
          retryCount = 0;
          const data: GeneratedAnswerStreamEventData = JSON.parse(event.data);
          if (data.finishReason === 'ERROR') {
            clearTimeout(timeout);
            actions.updateError({
              message: data.errorMessage,
              code: data.errorCode,
            });
            abortController.abort();
            return;
          }
          if (data.payload && data.payloadType) {
            handleStreamPayload(data.payloadType, data.payload);
          }
          if (data.finishReason === 'COMPLETED') {
            clearTimeout(timeout);
            actions.setIsLoading(false);
            return;
          }
          refreshTimeout();
        },
        onclose() {
          throw new RetryableError();
        },
        onerror: (err) => {
          clearTimeout(timeout);
          if (err instanceof FatalError) {
            throw err;
          }
          if (++retryCount > MAX_RETRIES) {
            this.logger.info('Maximum retry exceeded.');
            actions.updateError({
              message: 'Failed to complete stream.',
              code: RETRYABLE_STREAM_ERROR_CODE,
            });
            throw new FatalError();
          }
          this.logger.info(`Retrying...(${retryCount}/${MAX_RETRIES})`);
          actions.resetAnswer();
        },
      });

    stream();

    return abortController;
  }
}
