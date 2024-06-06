import {
  answerAPI,
  fetchAnswer,
  selectAnswer,
} from '../../../api/knowledge/knowledge-answer-api';
import {CoreEngine} from '../../../app/engine';
import {resetAnswer} from '../../../features/generated-answer/generated-answer-actions';
// import {
//   setAnswerContentFormat,
//   updateMessage,
//   updateCitations,
//   setIsStreaming,
//   setIsLoading,
//   resetAnswer,
// } from '../../../features/generated-answer/generated-answer-actions';
import {
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildCoreGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerAnalyticsClient,
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../core/generated-answer/headless-core-generated-answer';

export interface KnowledgeGeneratedAnswer extends GeneratedAnswer {
  /**
   * use the last query to request the generation of an answer.
   */
  requestGeneratedAnswer(): void;
  /**
   * resets the last answer.
   */
  reset(): void;
}
export interface KnowledgeGeneratedAnswerProps extends GeneratedAnswerProps {}

export interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

export type KnowledgeEngine = CoreEngine<
  GeneratedAnswerSection &
    SearchSection &
    DebugSection & {knowledge: ReturnType<typeof answerAPI.reducer>}
>;

// const getStreamId = (engine: KnowledgeEngine) =>
//   engine.state.search.extendedResults.generativeQuestionAnsweringId;

// const callQueryStream = async (engine: KnowledgeEngine) => {
//   // const streamId = getStreamId(engine);
//   const answerQuery = selectAnswer(engine.state);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   // const test = answerAPI.endpoints.getAnswer.select(
//   //   (await buildSearchRequest(engine.state)).request
//   // )(engine.state);
//   // console.log(test);
//   // const hasRequestedStream =
//   //   answerQuery?.originalArgs?.q === engine.state.query?.q;
//   // const shouldQueryStream = !hasRequestedStream && !!streamId;
//   console.log('before condition', answerQuery);

//   if (
//     engine.state.query?.q.length &&
//     engine.state.query?.q !== answerQuery?.originalArgs?.q
//   ) {
//     console.log('query changed', answerQuery);
//     // const {request} = await buildSearchRequest(engine.state);
//     engine.dispatch(fetchAnswer(engine.state));
//   }
// };

// const dispatchResetAnswer = async (engine: KnowledgeEngine) => {
//   const answerQuery = selectAnswer(engine.state);
//   if (
//     answerQuery?.status === 'pending' &&
//     engine.state.generatedAnswer.answer
//   ) {
//     engine.dispatch(resetAnswer());
//   }
// };

// const dispatchIsStreaming = async (engine: KnowledgeEngine) => {
//   const answerQuery = selectAnswer(engine.state);
//   if (
//     answerQuery?.data?.isStreaming !== undefined &&
//     answerQuery?.data?.isStreaming !== engine.state.generatedAnswer.isStreaming
//   ) {
//     engine.dispatch(setIsStreaming(answerQuery?.data?.isStreaming));
//   }
// };

// const dispatchIsLoading = async (engine: KnowledgeEngine) => {
//   const answerQuery = selectAnswer(engine.state);
//   if (
//     answerQuery?.data?.isLoading !== undefined &&
//     answerQuery?.data?.isLoading !== engine.state.generatedAnswer.isLoading
//   ) {
//     engine.dispatch(setIsLoading(answerQuery?.data?.isLoading));
//   }
// };

// const dispatchContentFormat = async (engine: KnowledgeEngine) => {
//   const answerQuery = selectAnswer(engine.state);
//   if (
//     !!answerQuery?.data?.contentFormat &&
//     engine.state.generatedAnswer.answerContentFormat !==
//       answerQuery?.data?.contentFormat
//   ) {
//     engine.dispatch(setAnswerContentFormat(answerQuery?.data?.contentFormat));
//   }
// };

// const dispatchAnswer = async (engine: KnowledgeEngine) => {
//   const answerQuery = selectAnswer(engine.state);
//   console.log('answerQuery', answerQuery);
//   if (
//     !!answerQuery?.data?.answer &&
//     answerQuery?.data?.answer !== engine.state.generatedAnswer.answer
//   ) {
//     console.log('dispatching answer');
//     engine.dispatch(
//       updateMessage({
//         textDelta: answerQuery?.data?.answer,
//         replaceCurrent: true,
//       })
//     );
//   }
// };

// const dispatchCitations = async (engine: KnowledgeEngine) => {
//   const answerQuery = selectAnswer(engine.state);
//   if (
//     !!answerQuery?.data?.citations &&
//     JSON.stringify(answerQuery?.data?.citations) !==
//       JSON.stringify(engine.state.generatedAnswer.citations)
//   ) {
//     engine.dispatch(updateCitations({citations: answerQuery?.data?.citations}));
//   }
// };

const subscribeStateManager = (engine: KnowledgeEngine) => {
  const strictListener = () => {
    // callQueryStream(engine);
    // dispatchResetAnswer(engine);
    // dispatchIsStreaming(engine);
    // dispatchIsLoading(engine);
    // dispatchContentFormat(engine);
    // dispatchAnswer(engine);
    // dispatchCitations(engine);
  };
  engine.subscribe(strictListener);
};

/**
 * Creates a `GeneratedAnswer` controller instance using the search api stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildKnowledgeGeneratedAnswer(
  engine: KnowledgeEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: GeneratedAnswerProps = {}
): KnowledgeGeneratedAnswer {
  if (!loadAnswerApiReducer(engine)) {
    throw loadReducerError;
  }

  const {rephrase: coreRephrase, ...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;

  subscribeStateManager(engine);

  return {
    ...controller,

    get state() {
      return {
        ...getState().generatedAnswer,
        answer: selectAnswer(engine.state).data?.answer,
        citations: selectAnswer(engine.state).data?.citations ?? [],
        error: {message: selectAnswer(engine.state).error as string}, // Todo: making sure the error is a string
        isLoading: selectAnswer(engine.state).data?.isLoading ?? false,
        isStreaming: selectAnswer(engine.state).data?.isStreaming ?? false,
        answerContentFormat:
          selectAnswer(engine.state).data?.contentFormat || 'text/plain',
        // isVisible: false,
        // responseFormat: {
        //   answerStyle:
        //     selectAnswer(engine.state).data?.answerStyle || 'default',
        //   contentFormat:
        //     selectAnswer(engine.state).data?.contentFormat || 'text/plain',
        // },
        isAnswerGenerated: selectAnswer(engine.state).data?.generated || false,
      };
    },
    requestGeneratedAnswer() {
      engine.dispatch(fetchAnswer(getState()));
    },
    rephrase(responseFormat: GeneratedResponseFormat) {
      coreRephrase(responseFormat);
      engine.dispatch(fetchAnswer(getState()));
    },
    retry() {
      engine.dispatch(fetchAnswer(getState()));
    },
    reset() {
      engine.dispatch(resetAnswer());
    },
  };
}

function loadAnswerApiReducer(
  engine: CoreEngine
): engine is CoreEngine<GeneratedAnswerSection & SearchSection & DebugSection> {
  engine.addReducers({[answerAPI.reducerPath]: answerAPI.reducer});
  return true;
}
