import {EventSourcePolyfill} from 'event-source-polyfill';
import {Logger} from 'pino';
import {SearchAppState} from '../..';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {URLPath} from '../../utils/url-utils';
import {resetTimeout} from '../../utils/utils';
import {SearchAPIClient} from '../search/search-api-client';
import {
  GeneratedAnswerStreamEventData,
  StreamFinishReason,
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
    `${url}/rest/internal/organizations/${orgId}/machinelearning/models/stream-sse/${streamId}`
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
    onError: (errorMessage?: string) => void,
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
      this.logger.error('Failed to connect to stream.', e);

      if (++retryCount <= MAX_RETRIES) {
        this.logger.info(`Retrying...(${retryCount}/${MAX_RETRIES})`);
        return stream();
      } else {
        this.logger.info('Maximum retry exceeded');
        onError();
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
          if (data.finishReason === StreamFinishReason.Completed) {
            clearTimeout(timeout);
            onCompleted();
          } else if (data.finishReason === StreamFinishReason.Error) {
            clearTimeout(timeout);
            onError(data.errorMessage);
          } else {
            refreshTimeout();
            onMessage(data.payload);
          }
        };

        source.onerror = () => {
          this.options.logger.error('Failed to complete stream.');
          onError();
        };

        return source;
      } catch (e) {
        return checkAndRetry(e);
      }
    };

    return stream();
  }
}
