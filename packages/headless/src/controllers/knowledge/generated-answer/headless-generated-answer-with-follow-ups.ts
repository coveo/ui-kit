import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import {
  type AnswerEndpointArgs,
  selectAnswer,
} from '../../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {setAgentId} from '../../../features/configuration/configuration-actions.js';
import {
  dislikeFollowUp,
  generateFollowUpAnswer,
  likeFollowUp,
} from '../../../features/follow-up-answers/follow-up-answers-actions.js';
import {followUpAnswersReducer as followUpAnswers} from '../../../features/follow-up-answers/follow-up-answers-slice.js';
import type {FollowUpAnswersState} from '../../../features/follow-up-answers/follow-up-answers-state.js';
import {selectAnswerApiQueryParams} from '../../../features/generated-answer/answer-api-selectors.js';
import {generateHeadAnswer} from '../../../features/generated-answer/generated-answer-actions.js';
import type {GeneratedAnswerState} from '../../../index.js';
import type {
  FollowUpAnswersSection,
  GeneratedAnswerSection,
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

export interface GeneratedAnswerWithFollowUps extends GeneratedAnswer {
  /**
   * The state of the GeneratedAnswer controller.
   */
  state: GeneratedAnswerWithFollowUpsState;
  /**
   * Marks the answer as liked.
   * @param answerId - Optional ID of the answer to like. Defaults to the head answer.
   */
  like(answerId?: string): void;

  /**
   * Marks the answer as disliked.
   * @param answerId - Optional ID of the answer to dislike. Defaults to the head answer.
   */
  dislike(answerId?: string): void;

  /**
   * Logs a copy-to-clipboard interaction for analytics.
   * @param answerId - Optional ID of the copied answer. Defaults to the current answer.
   */
  logCopyToClipboard(answerId?: string): void;
  /**
   * Asks a follow-up question.
   * @param question - The follow-up question to ask.
   */
  askFollowUp(question: string): void;
}

export type GeneratedAnswerWithFollowUpsProps = GeneratedAnswerProps &
  Required<Pick<GeneratedAnswerProps, 'agentId'>>;

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
  props: GeneratedAnswerWithFollowUpsProps
): GeneratedAnswerWithFollowUps {
  if (!props.agentId || props.agentId.trim() === '') {
    throw new Error('agentId is required for GeneratedAnswerWithFollowUps');
  }

  if (!loadReducers(engine)) {
    throw loadReducerError;
  }

  const {...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;
  engine.dispatch(setAgentId(props.agentId));

  return {
    ...controller,
    get state() {
      const clientState = getState().generatedAnswer;
      const answerApiQueryParams =
        selectAnswerApiQueryParams(engine.state) ?? {};
      const headAnswerArgs: AnswerEndpointArgs = {
        ...answerApiQueryParams,
        strategyKey: 'head-answer',
      };
      const serverState = selectAnswer(headAnswerArgs, engine.state)?.data;
      const followUpAnswersState = getState().followUpAnswers;

      return {
        /** Server-owned (RTK Query) */
        answer: serverState?.answer,
        answerContentFormat: serverState?.contentFormat ?? 'text/plain',
        citations: serverState?.citations ?? [],
        isLoading: serverState?.isLoading ?? false,
        isStreaming: serverState?.isStreaming ?? false,
        ...(serverState?.error && {error: serverState.error}),
        answerId: serverState?.answerId,
        isAnswerGenerated: Boolean(serverState?.generated),
        cannotAnswer: serverState?.generated === false,

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
    like(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.like();
        return;
      }
      engine.dispatch(likeFollowUp({answerId}));
      engine.dispatch(analyticsClient.logLikeGeneratedAnswer(answerId));
    },
    dislike(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.dislike();
        return;
      }
      engine.dispatch(dislikeFollowUp({answerId}));
      engine.dispatch(analyticsClient.logDislikeGeneratedAnswer(answerId));
    },
    logCopyToClipboard(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.logCopyToClipboard();
        return;
      }
      engine.dispatch(analyticsClient.logCopyGeneratedAnswer(answerId));
    },
    askFollowUp(question: string) {
      if (!question || question.trim() === '') {
        return;
      }
      engine.dispatch(generateFollowUpAnswer(question));
    },
  };
}

function loadReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    FollowUpAnswersSection & {
      answerGenerationApi: ReturnType<typeof answerGenerationApi.reducer>;
    }
> {
  engine.addReducers({
    [answerGenerationApi.reducerPath]: answerGenerationApi.reducer,
    followUpAnswers,
  });
  return true;
}
