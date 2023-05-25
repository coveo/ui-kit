import {EventSourcePolyfill} from 'event-source-polyfill';
import {Logger} from 'pino';
import {SearchAppState} from '../../..';
import {AsyncThunkOptions} from '../../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {URLPath} from '../../../utils/url-utils';
import {GeneratedAnswerStreamEventData} from './generated-answer-event-payload';
import {GeneratedAnswerStreamRequest} from './generated-answer-request';

export interface GeneratedAnswerAPIClientOptions {
  logger: Logger;
}

export interface AsyncThunkGeneratedAnswerOptions<
  T extends Partial<SearchAppState>
> extends AsyncThunkOptions<
    T,
    ClientThunkExtraArguments<GeneratedAnswerAPIClient>
  > {}

const buildStreamingUrl = (url: string, orgId: string, model: string) =>
  new URLPath(
    `${url}/rest/internal/organizations/${orgId}/machinelearning/models/${model}/stream-sse`
  );

const MAX_RETRIES = 3;
const model = 'uiloop01';

export class GeneratedAnswerAPIClient {
  constructor(private options: GeneratedAnswerAPIClientOptions) {}

  streamGeneratedAnswer(
    params: GeneratedAnswerStreamRequest,
    onMessage: (payload: string) => void,
    onError: (message?: string) => void,
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
          if (data.finishReason === 'COMPLETED') {
            source.close();
            onCompleted();
          } else if (data.finishReason === 'ERROR') {
            source.close();
            onError(data.errorMessage);
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
        this.options.logger.error(
          `Failed to connect to event stream. ${
            retrying ? `Retrying...(${retryCount})` : 'Terminating.'
          }`,
          e
        );
        if (retrying) {
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
