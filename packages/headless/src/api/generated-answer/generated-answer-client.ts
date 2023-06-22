import {EventSourcePolyfill} from 'event-source-polyfill';
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
export const RETRYABLE_STREAM_ERROR_CODE = 1;

export class GeneratedAnswerAPIClient {
  private logger: Logger;

  constructor(private options: GeneratedAnswerAPIClientOptions) {
    this.logger = options.logger;
  }

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    onMessage: (payload: GeneratedAnswerMessagePayload) => void,
    onCitations: (payload: GeneratedAnswerCitationsPayload) => void,
    onError: (payload: GeneratedAnswerErrorPayload) => void,
    onCompleted: () => void
  ) {
    const {url, organizationId, streamId, accessToken} = params;

    if (!streamId) {
      this.logger.error('No stream ID found');
      return;
    }

    let retryCount = 0;
    let timeout: ReturnType<typeof setTimeout>;
    let source: EventSourcePolyfill;

    const checkAndRetry = (e: unknown): EventSourcePolyfill | void => {
      const errorMessage = 'Failed to connect to stream.';
      this.logger.error(errorMessage, e);

      if (++retryCount <= MAX_RETRIES) {
        this.logger.info(`Retrying...(${retryCount}/${MAX_RETRIES})`);
        return stream();
      } else {
        this.logger.info('Maximum retry exceeded.');
        onError({
          message: errorMessage,
          code: RETRYABLE_STREAM_ERROR_CODE,
        });
      }
    };

    const refreshTimeout = () => {
      timeout = resetTimeout(timeout, checkAndRetry, MAX_TIMEOUT);
    };

    const handleStreamPayload = (
      payloadType: GeneratedAnswerPayloadType,
      payload: string
    ) => {
      if (payloadType === 'genqa.messageType') {
        onMessage(JSON.parse(payload) as GeneratedAnswerMessagePayload);
      } else if (payloadType === 'genqa.citationsType') {
        onCitations(JSON.parse(payload) as GeneratedAnswerCitationsPayload);
      }
    };

    const stream = (): EventSourcePolyfill | void => {
      try {
        source = new EventSourcePolyfill(
          buildStreamingUrl(url, organizationId, streamId).href,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        source.onopen = refreshTimeout;

        source.onmessage = (event) => {
          retryCount = 0;
          const data: GeneratedAnswerStreamEventData = JSON.parse(
            (event as MessageEvent).data
          );
          if (data.finishReason === 'ERROR') {
            clearTimeout(timeout);
            onError({
              message: data.errorMessage,
              code: data.errorCode,
            });
            return;
          }
          if (data.payload && data.payloadType) {
            handleStreamPayload(data.payloadType, data.payload);
          }

          if (data.finishReason === 'COMPLETED') {
            clearTimeout(timeout);
            onCompleted();
          } else {
            refreshTimeout();
          }
        };

        source.onerror = () => {
          const errorMessage = 'Failed to complete stream.';
          this.options.logger.error(errorMessage);
          onError({
            message: errorMessage,
            code: RETRYABLE_STREAM_ERROR_CODE,
          });
        };

        return source;
      } catch (e) {
        return checkAndRetry(e);
      }
    };

    return stream();
  }
}
