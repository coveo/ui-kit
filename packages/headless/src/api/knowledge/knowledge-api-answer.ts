import {
  EventSourceMessage,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import {GeneratedContentFormat} from '../../features/generated-answer/generated-response-format';
import {selectQuery} from '../../features/query/query-selectors';
import {QueryState} from '../../features/query/query-state';
import {selectSearchHub} from '../../features/search-hub/search-hub-selectors';
import {ConfigurationSection} from '../../state/state-sections';
import {GeneratedAnswerCitation} from '../generated-answer/generated-answer-event-payload';
import {SearchRequest} from '../search/search/search-request';
import {knowledgeApi} from './knowledge-api';

type StateNeededByKnowledgeAPI = ConfigurationSection;

interface ErrorPayload {
  message?: string;
  code?: number;
}

class FatalError extends Error {
  constructor(public payload: ErrorPayload) {
    super(payload.message);
  }
}

interface GeneratedAnswerStream {
  answerStyle: string | undefined;
  contentFormat: GeneratedContentFormat | undefined;
  answer: string | undefined;
  citations: GeneratedAnswerCitation[] | undefined;
  generated: boolean;
  isStreaming: boolean;
  isLoading: boolean;
}

interface Data {
  answerStyle: string | undefined;
  contentFormat: GeneratedContentFormat | undefined;
  answer: string | undefined;
  citations: GeneratedAnswerCitation[] | undefined;
  generated: boolean;
  isStreaming: boolean;
  isLoading: boolean;
}

const updateCacheWithEvent = (event: EventSourceMessage, draft: Data) => {
  const message = JSON.parse(event.data);
  const payload = JSON.parse(message.payload);
  if (message.payloadType === 'genqa.headerMessageType') {
    draft.answerStyle = payload.answerStyle;
    draft.contentFormat = payload.contentFormat;
    draft.isStreaming = true;
    draft.isLoading = false;
  }

  if (message.payloadType === 'genqa.messageType') {
    if (draft.answer === undefined) {
      draft.answer = payload.textDelta;
    } else {
      draft.answer = draft.answer?.concat(payload.textDelta);
    }
  }

  if (message.payloadType === 'genqa.citationsType') {
    draft.citations = payload.citations;
  }

  if (message.payloadType === 'genqa.endOfStreamType') {
    draft.generated = Boolean(payload.answerGenerated);
    draft.isStreaming = false;
  }
};

const onOpenStream = async (response: Response) => {
  if (
    response.ok &&
    response.headers.get('content-type')?.includes('text/event-stream')
  ) {
    return;
  }

  const isClientSideError =
    response.status >= 400 && response.status < 500 && response.status !== 429;

  if (isClientSideError) {
    throw new FatalError({
      message: 'Error opening stream',
      code: response.status,
    });
  } else {
    throw new Error();
  }
};

const onError = (err: Error) => {
  let retryCount = 0;

  if (err instanceof FatalError) {
    throw err;
  }

  if (++retryCount > 3) {
    const error = {
      message: 'Failed to complete stream.',
      code: 1,
    };
    throw new FatalError(error);
  }
};

export const answerAPI = knowledgeApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnswer: builder.query<GeneratedAnswerStream, Partial<SearchRequest>>({
      queryFn: () => ({
        data: {
          answerStyle: undefined,
          contentFormat: undefined,
          answer: undefined,
          citations: undefined,
          generated: false,
          isStreaming: true,
          isLoading: true,
        },
      }),
      async onCacheEntryAdded(
        arg,
        {getState, cacheDataLoaded, updateCachedData}
      ) {
        await cacheDataLoaded;
        /**
         * createApi has to be called prior to create the redux store and is used as part of the store setup sequence.
         * It cannot use the inferred state used by Redux, thus the casting.
         * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-dispatch-and-getstate
         */
        const {configuration} =
          getState() as unknown as StateNeededByKnowledgeAPI;

        await fetchEventSource(
          `${configuration.platformUrl}/rest/organizations/${configuration.organizationId}/answer/v1/configs/${configuration.knowledge.configurationId}/generate`,
          {
            method: 'POST',
            body: JSON.stringify(arg),
            headers: {
              Authorization: `Bearer ${configuration.accessToken}`,
              Accept: '*/*',
              'Accept-Encoding': '*',
              'Content-Type': 'application/json',
            },
            fetch,
            onopen: onOpenStream,
            onmessage: (event) => {
              updateCachedData((draft) => {
                updateCacheWithEvent(event, draft);
              });
            },
            onerror: onError,
          }
        );
      },
    }),
  }),
});

export const fetchAnswer = answerAPI.endpoints.getAnswer.initiate;
export const selectAnswer = async (
  state: StateNeededByKnowledgeAPI & {
    knowledgeApi: ReturnType<typeof answerAPI.reducer>;
    query: QueryState;
    searchHub: string;
  }
) =>
  answerAPI.endpoints.getAnswer.select({
    q: selectQuery(state).q,
    searchHub: selectSearchHub(state),
  })(state);
