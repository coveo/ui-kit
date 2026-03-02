import {createFollowUpAgent} from '../../../api/knowledge/answer-generation/agents/follow-up-agent/follow-up-agent.js';
import {createFollowUpStrategy} from '../../../api/knowledge/answer-generation/agents/follow-up-agent/follow-up-answer-strategy.js';
import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {setAgentId} from '../../../features/configuration/configuration-actions.js';
import {
  selectAccessToken,
  selectEnvironment,
  selectOrganizationId,
} from '../../../features/configuration/configuration-selectors.js';
import {
  createFollowUpAnswer,
  dislikeFollowUp,
  likeFollowUp,
} from '../../../features/follow-up-answers/follow-up-answers-actions.js';
import {followUpAnswersReducer as followUpAnswers} from '../../../features/follow-up-answers/follow-up-answers-slice.js';
import type {FollowUpAnswersState} from '../../../features/follow-up-answers/follow-up-answers-state.js';
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

export interface GeneratedAnswerWithFollowUpsState
  extends GeneratedAnswerState {
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

  const organizationId = selectOrganizationId(getState());
  const accessToken = selectAccessToken(getState());
  const environment = selectEnvironment(getState());

  const followUpAgent = createFollowUpAgent(
    props.agentId,
    organizationId,
    environment
  );
  const followUpStrategy = createFollowUpStrategy(engine.dispatch);

  return {
    ...controller,
    get state() {
      const followUpAnswersState = getState().followUpAnswers;

      return {
        ...getState().generatedAnswer,
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
    },
    dislike(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.dislike();
        return;
      }
      engine.dispatch(dislikeFollowUp({answerId}));
    },
    logCopyToClipboard(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.logCopyToClipboard();
        return;
      }
      // Todo: SFINT-6581 implement logCopyFollowUp action and dispatch here
      console.warn(
        'Method not yet implemented to send analytics for copy to clipboard on a followup answer'
      );
    },

    askFollowUp(question: string) {
      if (!question || question.trim() === '') {
        return;
      }
      const conversationId = this.state.followUpAnswers.conversationId;
      if (!conversationId) {
        console.warn(
          'Missing conversationId when generating a follow-up answer. ' +
            'The generateFollowUpAnswer action requires an existing conversation.'
        );
        return;
      }

      engine.dispatch(createFollowUpAnswer({question}));
      followUpAgent.runAgent(
        {
          forwardedProps: {
            q: question,
            conversationId,
            accessToken,
          },
        },
        followUpStrategy
      );
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
