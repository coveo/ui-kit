import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import {selectHeadAnswer} from '../../../api/knowledge/answer-generation/endpoints/head-answer-endpoint.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {generateFollowUpAnswer} from '../../../features/follow-up-answers/follow-up-answers-actions.js';
import {followUpAnswersReducer as followUpAnswers} from '../../../features/follow-up-answers/follow-up-answers-slice.js';
import type {FollowUpAnswersState} from '../../../features/follow-up-answers/follow-up-answers-state.js';
import {
  generateHeadAnswer,
  updateAnswerConfigurationId,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import type {GeneratedAnswerState} from '../../../index.js';
import type {
  FollowUpAnswersSection,
  GeneratedAnswerSection,
  QuerySection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildCoreGeneratedAnswer,
  type GeneratedAnswer,
  type GeneratedAnswerAnalyticsClient,
  type GeneratedAnswerProps,
} from '../../core/generated-answer/headless-core-generated-answer.js';

interface GeneratedAnswerWithFollowUpsState extends GeneratedAnswerState {
  followUpAnswers: FollowUpAnswersState;
}

interface GeneratedAnswerWithFollowUps extends GeneratedAnswer {
  /**
   * The state of the GeneratedAnswer controller.
   */
  state: GeneratedAnswerWithFollowUpsState;
  /**
   * Asks a follow-up question.
   * @param question - The follow-up question to ask.
   */
  askFollowUp(question: string): void;
}

/**
 *
 * @internal
 *
 * Creates a `GeneratedAnswerWithFollowUps` controller instance using the Answer API stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswerWithFollowUps` properties.
 * @returns A `GeneratedAnswerWithFollowUps` controller instance.
 */
export function buildGeneratedAnswerWithFollowUps(
  engine: SearchEngine | InsightEngine,
  analyticsClient: GeneratedAnswerAnalyticsClient,
  props: GeneratedAnswerProps = {}
): GeneratedAnswerWithFollowUps {
  if (!loadReducers(engine)) {
    throw loadReducerError;
  }

  const {...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;
  engine.dispatch(updateAnswerConfigurationId(props.agentId!));

  return {
    ...controller,
    get state() {
      const clientState = getState().generatedAnswer;
      const serverState = selectHeadAnswer(engine.state)?.data;
      const followUpAnswersState = getState().followUpAnswers;

      return {
        /** Server-owned (RTK Query) */
        answer: serverState?.answer,
        answerContentFormat: serverState?.contentFormat,
        citations: serverState?.citations ?? [],
        isLoading: serverState?.isLoading ?? false,
        isStreaming: serverState?.isStreaming ?? false,
        error: serverState?.error,
        answerId: serverState?.answerId,
        isAnswerGenerated: Boolean(serverState?.generated),
        cannotAnswer:
          !serverState?.isLoading &&
          !serverState?.isStreaming &&
          !serverState?.answer,

        /** Client-owned (Redux) */
        isVisible: clientState.isVisible,
        expanded: clientState.expanded,
        liked: clientState.liked,
        disliked: clientState.disliked,
        feedbackSubmitted: clientState.feedbackSubmitted,
        feedbackModalOpen: clientState.feedbackModalOpen,
        isEnabled: clientState.isEnabled,
        responseFormat: clientState.responseFormat,
        fieldsToIncludeInCitations: clientState.fieldsToIncludeInCitations,
        answerGenerationMode: clientState.answerGenerationMode,
        id: clientState.id,

        /** Follow-up answers state */
        followUpAnswers: followUpAnswersState,
      };
    },
    retry() {
      engine.dispatch(generateHeadAnswer());
    },
    askFollowUp(question: string) {
      engine.dispatch(generateFollowUpAnswer(question));
    },
  };
}

function loadReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    FollowUpAnswersSection &
    QuerySection & {
      answerGenerationApi: ReturnType<typeof answerGenerationApi.reducer>;
    }
> {
  engine.addReducers({
    [answerGenerationApi.reducerPath]: answerGenerationApi.reducer,
    query,
    followUpAnswers,
  });
  return true;
}
