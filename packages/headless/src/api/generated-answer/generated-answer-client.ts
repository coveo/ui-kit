import {EventSourcePolyfill} from 'event-source-polyfill';
import {Logger} from 'pino';
import {SearchAppState} from '../..';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {URLPath} from '../../utils/url-utils';
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

const buildStreamingUrl = (url: string, orgId: string, model: string) =>
  new URLPath(
    `${url}/rest/internal/organizations/${orgId}/machinelearning/models/${model}/stream-sse`
  );

const MAX_RETRIES = 3;
const model = 'uiloop01';

export class GeneratedAnswerAPIClient {
  private logger: Logger;

  constructor(private options: GeneratedAnswerAPIClientOptions) {
    this.logger = options.logger;
  }

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    onMessage: (payload: string) => void,
    onError: () => void,
    onCompleted: () => void
  ) {
    const {url, organizationId, streamKey, accessToken} = params;

    if (!streamKey) {
      return;
    }

    let retryCount = 0;

    const stream = (): EventSourcePolyfill | undefined => {
      let source: EventSourcePolyfill;
      try {
        source = new EventSourcePolyfill(
          buildStreamingUrl(url, organizationId, model).href,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Stream-Key': streamKey,
            },
          }
        );

        source.addEventListener('QueryStreamMessage', (event) => {
          const data: GeneratedAnswerStreamEventData = JSON.parse(
            (event as MessageEvent).data
          );
          if (data.finishReason === StreamFinishReason.Completed) {
            source.close();
            onCompleted();
          } else if (data.finishReason === StreamFinishReason.Error) {
            source.close();
            this.logger.error(data.errorMessage);
            onError();
          } else {
            onMessage(data.payload);
          }
        });

        source.addEventListener('error', () => {
          this.options.logger.error('Failed to complete stream.');
          source.close();
        });

        return source;
      } catch (e) {
        const retrying = retryCount++ < MAX_RETRIES;
        this.logger.error('Failed to connect to stream.', e);
        if (retrying) {
          this.logger.info(`Retrying...(${retryCount})`);
          return stream();
        } else {
          onError();
        }
      }
      return;
    };

    return stream();
  }
}
