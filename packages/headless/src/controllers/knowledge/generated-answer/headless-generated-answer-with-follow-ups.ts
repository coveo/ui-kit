import {createAnswerRunner} from '../../../api/knowledge/answer-generation/agents/answer-agent/answer-agent-runner.js';
import {createFollowUpAgent} from '../../../api/knowledge/answer-generation/agents/follow-up-agent/follow-up-agent.js';
import {createFollowUpStrategy} from '../../../api/knowledge/answer-generation/agents/follow-up-agent/follow-up-answer-strategy.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {setAgentId} from '../../../features/configuration/configuration-actions.js';
import {
  selectAccessToken,
  selectEnvironment,
  selectOrganizationId,
} from '../../../features/configuration/configuration-selectors.js';
import {
  activeFollowUpStartFailed,
  createFollowUpAnswer,
  dislikeFollowUp,
  likeFollowUp,
} from '../../../features/follow-up-answers/follow-up-answers-actions.js';
import {followUpAnswersReducer as followUpAnswers} from '../../../features/follow-up-answers/follow-up-answers-slice.js';
import type {FollowUpAnswersState} from '../../../features/follow-up-answers/follow-up-answers-state.js';
import {withGeneratedAnswerSseErrorHelpers} from '../../../features/generated-answer/sse-generated-answer-errors.js';
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

export interface GeneratedAnswerWithFollowUpsState extends GeneratedAnswerState {
  followUpAnswers: FollowUpAnswersState;
}

export interface GeneratedAnswerWithFollowUps extends GeneratedAnswer {
  /**
   * The state of the GeneratedAnswer controller.
   */
  state: GeneratedAnswerWithFollowUpsState;
  /**
   * Marks the answer as liked.
   * @param answerId - Optional ID of the answer to like. Defaults to the first answer.
   */
  like(answerId?: string): void;

  /**
   * Marks the answer as disliked.
   * @param answerId - Optional ID of the answer to dislike. Defaults to the first answer.
   */
  dislike(answerId?: string): void;

  /**
   * Logs a custom event indicating a cited source link was hovered.
   * @param citationId - The ID of the hovered citation.
   * @param citationHoverTimeMs - The number of milliseconds spent hovering over the citation.
   * @param answerId - Optional ID of the answer for which the citation was hovered. Defaults to the first answer.
   */
  logCitationHover(
    citationId: string,
    citationHoverTimeMs: number,
    answerId?: string
  ): void;

  /**
   * Logs a click on a cited source link for analytics.
   * @param citationId - The ID of the clicked citation.
   * @param answerId - Optional ID of the answer for which the citation was clicked. Defaults to the first answer.
   */
  logCitationClick(citationId: string, answerId?: string): void;

  /**
   * Logs a copy-to-clipboard interaction for analytics.
   * @param answerId - Optional ID of the copied answer. Defaults to the first answer.
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

  const controller = buildCoreGeneratedAnswer(engine, analyticsClient, props);
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
  const answerRunner = createAnswerRunner();

  return {
    ...controller,
    get state() {
      const followUpAnswersState = getState().followUpAnswers;
      const generatedAnswerState = getState().generatedAnswer;

      return {
        ...generatedAnswerState,
        error: withGeneratedAnswerSseErrorHelpers(generatedAnswerState.error),
        followUpAnswers: {
          ...followUpAnswersState,
          followUpAnswers: followUpAnswersState.followUpAnswers.map(
            (followUpAnswer) => ({
              ...followUpAnswer,
              error: withGeneratedAnswerSseErrorHelpers(followUpAnswer.error),
            })
          ),
        },
      };
    },

    retry() {
      answerRunner.run(
        engine.state,
        engine.dispatch,
        () => engine.navigatorContext
      );
    },

    like(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.like();
        return;
      }

      const followUpAnswer = this.state.followUpAnswers.followUpAnswers.find(
        (answer) => answer.answerId === answerId
      );
      if (!followUpAnswer) {
        console.warn(
          `No follow-up answer found with ID ${answerId}. Cannot like.`
        );
        return;
      }
      if (!followUpAnswer.liked) {
        engine.dispatch(likeFollowUp({answerId}));
        engine.dispatch(analyticsClient.logLikeGeneratedAnswer(answerId));
      }
    },

    dislike(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.dislike();
        return;
      }

      const followUpAnswer = this.state.followUpAnswers.followUpAnswers.find(
        (answer) => answer.answerId === answerId
      );
      if (!followUpAnswer) {
        console.warn(
          `No follow-up answer found with ID ${answerId}. Cannot dislike.`
        );
        return;
      }
      if (!followUpAnswer.disliked) {
        engine.dispatch(dislikeFollowUp({answerId}));
        engine.dispatch(analyticsClient.logDislikeGeneratedAnswer(answerId));
      }
    },

    // TODO: SFINT-6665
    logCopyToClipboard(answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.logCopyToClipboard();
        return;
      }
      engine.dispatch(analyticsClient.logCopyGeneratedAnswer(answerId));
    },

    // TODO: SFINT-6665
    logCitationClick(citationId: string, answerId?: string) {
      if (!answerId || this.state.answerId === answerId) {
        controller.logCitationClick(citationId);
        return;
      }
      engine.dispatch(
        analyticsClient.logOpenGeneratedAnswerSource(citationId, answerId)
      );
    },

    // TODO: SFINT-6665
    logCitationHover(
      citationId: string,
      citationHoverTimeMs: number,
      answerId?: string
    ) {
      if (!answerId || this.state.answerId === answerId) {
        controller.logCitationHover(citationId, citationHoverTimeMs);
        return;
      }
      engine.dispatch(
        analyticsClient.logHoverCitation(
          citationId,
          citationHoverTimeMs,
          answerId
        )
      );
    },

    async askFollowUp(question: string) {
      if (!question || question.trim() === '') {
        return;
      }
      const conversationId = this.state.followUpAnswers.conversationId;
      const conversationToken = this.state.followUpAnswers.conversationToken;
      if (!conversationId) {
        console.warn(
          'Missing conversationId when generating a follow-up answer. ' +
            'The generateFollowUpAnswer action requires an existing conversation.'
        );
        return;
      }
      if (!conversationToken) {
        console.warn(
          'Missing conversationToken when generating a follow-up answer. ' +
            'The generateFollowUpAnswer action requires an existing conversation.'
        );
        return;
      }

      followUpAgent.abortRun();
      engine.dispatch(createFollowUpAnswer({question}));
      try {
        await followUpAgent.runAgent(
          {
            forwardedProps: {
              q: question,
              conversationId,
              conversationToken,
              accessToken,
            },
          },
          followUpStrategy
        );
      } catch (error) {
        engine.dispatch(
          activeFollowUpStartFailed({
            message:
              'An error occurred while starting the follow-up answer generation.',
          })
        );
        console.error('Error running the follow-up agent:', error);
      }
    },
  };
}

function loadReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<GeneratedAnswerSection & FollowUpAnswersSection> {
  engine.addReducers({
    followUpAnswers,
  });
  return true;
}
