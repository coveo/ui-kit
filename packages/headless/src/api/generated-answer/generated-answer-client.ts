import {EventSourcePolyfill} from 'event-source-polyfill';
import {Logger} from 'pino';
import {SearchAppState} from '../..';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {SSEErrorPayload} from '../../features/generated-answer/generated-answer-actions';
import {URLPath} from '../../utils/url-utils';
import {resetTimeout} from '../../utils/utils';
import {SearchAPIClient} from '../search/search-api-client';
import {
  GeneratedAnswerStreamEventData,
  GeneratedAnswerStreamFinishReason,
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

export class GeneratedAnswerAPIClient {
  private logger: Logger;

  constructor(private options: GeneratedAnswerAPIClientOptions) {
    this.logger = options.logger;
  }

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    onMessage: (payload: string) => void,
    onError: (payload: SSEErrorPayload) => void,
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
          code: 2,
        });
      }
    };

    const refreshTimeout = () => {
      timeout = resetTimeout(timeout, checkAndRetry, MAX_TIMEOUT);
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
          if (data.finishReason === GeneratedAnswerStreamFinishReason.Error) {
            clearTimeout(timeout);
            onError({
              message: data.errorMessage,
              code: data.errorCode,
            });
          } else if (
            data.finishReason === GeneratedAnswerStreamFinishReason.Completed
          ) {
            clearTimeout(timeout);
            if (data.payload) {
              onMessage(data.payload);
            }
            onCompleted();
          } else {
            refreshTimeout();
            onMessage(data.payload);
          }
        };

        source.onerror = () => {
          const errorMessage = 'Failed to complete stream.';
          this.options.logger.error(errorMessage);
          onError({
            message: errorMessage,
            code: 1,
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
