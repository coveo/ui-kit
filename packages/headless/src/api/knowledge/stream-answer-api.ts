import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {selectAnswerApiQueryParams} from '../../features/generated-answer/answer-api-selectors.js';
import {
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  updateCitations,
  updateMessage,
} from '../../features/generated-answer/generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import type {AnswerApiQueryParams} from '../../features/generated-answer/generated-answer-request.js';
import {fetchEventSource} from '../../utils/fetch-event-source/fetch.js';
import type {EventSourceMessage} from '../../utils/fetch-event-source/parse.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import {answerSlice} from './answer-slice.js';
import type {GeneratedAnswerStream} from './generated-answer-stream.js';
import type {StreamAnswerAPIState} from './stream-answer-api-state.js';

interface StreamPayload
  extends Pick<GeneratedAnswerStream, 'contentFormat' | 'citations'> {
  textDelta?: string;
  padding?: string;
  answerGenerated?: boolean;
}

type PayloadType =
  | 'genqa.headerMessageType'
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

const handleHeaderMessage = (
  draft: GeneratedAnswerStream,
  payload: Pick<GeneratedAnswerStream, 'contentFormat'>
) => {
  const {contentFormat} = payload;
  draft.contentFormat = contentFormat;
  draft.isStreaming = true;
  draft.isLoading = false;
};

const handleMessage = (
  draft: GeneratedAnswerStream,
  payload: Pick<StreamPayload, 'textDelta'>
) => {
  if (draft.answer === undefined) {
    draft.answer = payload.textDelta;
  } else if (typeof payload.textDelta === 'string') {
    draft.answer = draft.answer.concat(payload.textDelta);
  }
};

const handleCitations = (
  draft: GeneratedAnswerStream,
  payload: Pick<StreamPayload, 'citations'>
) => {
  draft.citations = payload.citations;
};

const handleEndOfStream = (
  draft: GeneratedAnswerStream,
  payload: Pick<StreamPayload, 'answerGenerated'>
) => {
  draft.generated = payload.answerGenerated;
  draft.isStreaming = false;
};

interface MessageType {
  payloadType: PayloadType;
  payload: string;
  finishReason?: string;
  errorMessage?: string;
  code?: number;
}

const handleError = (
  draft: GeneratedAnswerStream,
  message: Required<MessageType>
) => {
  const errorMessage = message.errorMessage || 'Unknown error occurred';

  draft.error = {
    message: errorMessage,
    code: message.code!,
  };
  draft.isStreaming = false;
  draft.isLoading = false;
  // Throwing an error here breaks the client and prevents the error from reaching the state.
  console.error(
    `Generated answer error: ${errorMessage} (code: ${message.code})`
  );
};

export const updateCacheWithEvent = (
  event: EventSourceMessage,
  draft: GeneratedAnswerStream,
  dispatch: ThunkDispatch<StreamAnswerAPIState, unknown, UnknownAction>
) => {
  const message: Required<MessageType> = JSON.parse(event.data);
  if (message.finishReason === 'ERROR' && message.errorMessage) {
    handleError(draft, message);
  }

  const parsedPayload: StreamPayload = message.payload.length
    ? JSON.parse(message.payload)
    : {};

  switch (message.payloadType) {
    case 'genqa.headerMessageType':
      if (parsedPayload.contentFormat) {
        handleHeaderMessage(draft, parsedPayload);
        dispatch(setAnswerContentFormat(parsedPayload.contentFormat));
      }
      break;
    case 'genqa.messageType':
      if (parsedPayload.textDelta) {
        handleMessage(draft, parsedPayload);
        dispatch(updateMessage({textDelta: parsedPayload.textDelta}));
      }
      break;
    case 'genqa.citationsType':
      if (parsedPayload.citations) {
        handleCitations(draft, parsedPayload);
        dispatch(updateCitations({citations: parsedPayload.citations}));
      }
      break;
    case 'genqa.endOfStreamType':
      handleEndOfStream(draft, parsedPayload);
      dispatch(
        logGeneratedAnswerStreamEnd(parsedPayload.answerGenerated ?? false)
      );
      dispatch(logGeneratedAnswerResponseLinked());
      break;
  }
};

export const buildAnswerEndpoint = (
  platformEndpoint: string,
  organizationId: string,
  answerConfigurationId: string,
  insightId?: string
): string => {
  if (!platformEndpoint || !organizationId || !answerConfigurationId) {
    throw new Error('Missing required parameters for answer endpoint');
  }
  const basePath = `/rest/organizations/${organizationId}`;
  const prefix = insightId
    ? `insight/v1/configs/${insightId}/answer`
    : `answer/v1/configs`;
  return `${platformEndpoint}${basePath}/${prefix}/${answerConfigurationId}/generate`;
};

export const answerApi = answerSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnswer: builder.query<GeneratedAnswerStream, AnswerApiQueryParams>({
      queryFn: () => ({
        data: {
          contentFormat: undefined,
          answer: undefined,
          citations: undefined,
          error: undefined,
          generated: false,
          isStreaming: true,
          isLoading: true,
        },
      }),
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        // RTK Query serialize our endpoints and they're serialized state arguments as the key in the store.
        // Keys must match, because if anything in the query changes, it's not the same query anymore.
        // Analytics data is excluded entirely as it contains volatile fields that change during streaming.
        const {analytics: _analytics, ...queryArgsWithoutAnalytics} = queryArgs;

        // Standard RTK key, with analytics excluded
        return `${endpointName}(${JSON.stringify(queryArgsWithoutAnalytics)})`;
      },
      async onCacheEntryAdded(
        args,
        {getState, cacheDataLoaded, updateCachedData, dispatch}
      ) {
        await cacheDataLoaded;
        /**
         * createApi has to be called prior to creating the redux store and is used as part of the store setup sequence.
         * It cannot use the inferred state used by Redux, thus the casting.
         * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-dispatch-and-getstate
         */
        const {configuration, generatedAnswer, insightConfiguration} =
          getState() as unknown as StreamAnswerAPIState;
        const {organizationId, environment, accessToken} = configuration;
        const platformEndpoint = getOrganizationEndpoint(
          organizationId,
          environment
        );
        const answerEndpoint = buildAnswerEndpoint(
          platformEndpoint,
          organizationId,
          generatedAnswer.answerConfigurationId!,
          insightConfiguration?.insightId
        );

        await fetchEventSource(answerEndpoint, {
          method: 'POST',
          body: JSON.stringify(args),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Accept-Encoding': '*',
          },
          fetch,
          onopen: async (res) => {
            const answerId = res.headers.get('x-answer-id');
            if (answerId) {
              updateCachedData((draft) => {
                draft.answerId = answerId;
                dispatch(setAnswerId(answerId));
              });
            }
          },
          onmessage: (event) => {
            updateCachedData((draft) => {
              updateCacheWithEvent(event, draft, dispatch);
            });
          },
          onerror: (error) => {
            throw error;
          },
          onclose: () => {
            updateCachedData((draft) => {
              dispatch(setCannotAnswer(!draft.generated));
            });
          },
        });
      },
    }),
  }),
});

export const fetchAnswer = (fetchAnswerParams: AnswerApiQueryParams) => {
  return answerApi.endpoints.getAnswer.initiate(fetchAnswerParams);
};

// Select answer state from RTK endpoint state
export const selectAnswer = (state: StreamAnswerAPIState) => {
  const params = selectAnswerApiQueryParams(state);
  return answerApi.endpoints.getAnswer.select(params)(state);
};
