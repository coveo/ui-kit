import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {
  EventSourceMessage,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import {
  GeneratedAnswerStyle,
  GeneratedContentFormat,
} from '../../features/generated-answer/generated-response-format';
import {selectPipeline} from '../../features/pipeline/select-pipeline';
import {selectQuery} from '../../features/query/query-selectors';
import {QueryState} from '../../features/query/query-state';
import {selectSearchHub} from '../../features/search-hub/search-hub-selectors';
import {
  ConfigurationSection,
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections';
import {GeneratedAnswerCitation} from '../generated-answer/generated-answer-event-payload';
import {SearchRequest} from '../search/search/search-request';
import {answerSlice} from './answer-slice';

type StateNeededByAnswerApi = ConfigurationSection &
  GeneratedAnswerSection &
  SearchSection &
  DebugSection & {answer: ReturnType<typeof answerApi.reducer>};

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
  answerStyle: GeneratedAnswerStyle | undefined;
  contentFormat: GeneratedContentFormat | undefined;
  answer: string | undefined;
  citations: GeneratedAnswerCitation[] | undefined;
  generated: boolean;
  isStreaming: boolean;
  isLoading: boolean;
}
interface HeaderMessage {
  answerStyle: GeneratedAnswerStyle;
  contentFormat: GeneratedContentFormat;
}

type PayloadType =
  | 'genqa.headerMessageType'
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

const headerMessageSchema = new Schema<HeaderMessage>({
  answerStyle: new StringValue(),
  contentFormat: new StringValue(),
});

const messageSchema = new Schema({
  textDelta: new StringValue(),
});

const citationsSchema = new Schema({
  citations: new ArrayValue(
    new RecordValue({
      values: {
        clickUri: new StringValue(),
        id: new StringValue(),
        permanentid: new StringValue(),
        text: new StringValue(),
        title: new StringValue(),
        uri: new StringValue(),
      },
    })
  ),
});

const validateHeaderMessage = (headerMessage: HeaderMessage) => {
  headerMessageSchema.validate(headerMessage);
};

const validateMessage = (message: {textDelta: string}) => {
  messageSchema.validate(message);
};

const validateCitationsMessage = (citations: {
  citations: GeneratedAnswerCitation[];
}) => {
  citationsSchema.validate(citations);
};

const validateEndOfStream = (endOfStream: {answerGenerated: boolean}) => {
  new Schema({
    answerGenerated: new BooleanValue(),
  }).validate(endOfStream);
};

const handleHeaderMessage = (
  draft: GeneratedAnswerStream,
  payload: HeaderMessage
) => {
  validateHeaderMessage(payload);
  const {answerStyle, contentFormat} = payload;
  draft.answerStyle = answerStyle;
  draft.contentFormat = contentFormat;
  draft.isStreaming = true;
  draft.isLoading = false;
};

const handleMessage = (
  draft: GeneratedAnswerStream,
  payload: {textDelta: string}
) => {
  validateMessage(payload);
  if (draft.answer === undefined) {
    draft.answer = payload.textDelta;
  } else {
    draft.answer = draft.answer.concat(payload.textDelta);
  }
};

const handleCitations = (
  draft: GeneratedAnswerStream,
  payload: {citations: GeneratedAnswerCitation[]}
) => {
  validateCitationsMessage(payload);
  draft.citations = payload.citations;
};

const handleEndOfStream = (
  draft: GeneratedAnswerStream,
  payload: {answerGenerated: boolean}
) => {
  validateEndOfStream(payload);
  draft.generated = payload.answerGenerated;
  draft.isStreaming = false;
};

const updateCacheWithEvent = (
  event: EventSourceMessage,
  draft: GeneratedAnswerStream
) => {
  const message: {payloadType: PayloadType; payload: string} = JSON.parse(
    event.data
  );
  const parsedPayload = JSON.parse(message.payload);
  switch (message.payloadType) {
    case 'genqa.headerMessageType':
      handleHeaderMessage(draft, parsedPayload);
      break;
    case 'genqa.messageType':
      handleMessage(draft, parsedPayload);
      break;
    case 'genqa.citationsType':
      handleCitations(draft, parsedPayload);
      break;
    case 'genqa.endOfStreamType':
      handleEndOfStream(draft, parsedPayload);
      break;
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

export const answerApi = answerSlice.injectEndpoints({
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
        args,
        {getState, cacheDataLoaded, updateCachedData}
      ) {
        await cacheDataLoaded;
        /**
         * createApi has to be called prior to creating the redux store and is used as part of the store setup sequence.
         * It cannot use the inferred state used by Redux, thus the casting.
         * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-dispatch-and-getstate
         */
        const {configuration, generatedAnswer} =
          getState() as unknown as StateNeededByAnswerApi;
        const {platformUrl, organizationId, accessToken} = configuration;
        await fetchEventSource(
          `${platformUrl}/rest/organizations/${organizationId}/answer/v1/configs/${generatedAnswer.answerConfigurationId}/generate`,
          {
            method: 'POST',
            body: JSON.stringify(args),
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Accept-Encoding': '*',
            },
            fetch,
            onopen: onOpenStream,
            onmessage: (event) => {
              if (JSON.parse(event.data).errorMessage) {
                throw new Error(JSON.parse(event.data).errorMessage);
              } else {
                updateCachedData((draft) => {
                  updateCacheWithEvent(event, draft);
                });
              }
            },
            onerror: (error) => {
              throw error;
            },
          }
        );
      },
    }),
  }),
});

export const fetchAnswer = (
  state: StateNeededByAnswerApi & {
    answer: ReturnType<typeof answerApi.reducer>;
    query?: QueryState;
    searchHub?: string;
    pipeline?: string;
  }
) => {
  const query = selectQuery(state)?.q;
  const searchHub = selectSearchHub(state);
  const pipeline = selectPipeline(state);

  return answerApi.endpoints.getAnswer.initiate({
    q: query,
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: {
          answerStyle: state.generatedAnswer.responseFormat.answerStyle,
        },
        citationsFieldToInclude: [],
      },
    },
    ...(searchHub?.length && {searchHub}),
    ...(pipeline?.length && {pipeline}),
  });
};

export const selectAnswer = (
  state: StateNeededByAnswerApi & {
    answer: ReturnType<typeof answerApi.reducer>;
    query?: QueryState;
    searchHub?: string;
    pipeline?: string;
  }
) =>
  answerApi.endpoints.getAnswer.select({
    q: selectQuery(state)?.q,
    pipelineRuleParameters: {
      mlGenerativeQuestionAnswering: {
        responseFormat: {
          answerStyle: state.generatedAnswer.responseFormat.answerStyle,
        },
        citationsFieldToInclude: [],
      },
    },
    ...(selectSearchHub(state)?.length && {searchHub: selectSearchHub(state)}),
    ...(selectPipeline(state)?.length && {pipeline: selectPipeline(state)}),
  })(state);
