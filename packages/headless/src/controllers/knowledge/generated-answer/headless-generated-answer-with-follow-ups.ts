import {
  createFollowUpAgent,
  createFollowUpStrategy,
} from '../../../api/knowledge/answer-generation/agents/follow-up-agent.js';
import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {setAgentId} from '../../../features/configuration/configuration-actions.js';
import {
  selectAccessToken,
  selectOrganizationId,
} from '../../../features/configuration/configuration-selectors.js';
import {createFollowUpAnswer} from '../../../features/follow-up-answers/follow-up-answers-actions.js';
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
   * Ask a follow-up question.
   */
  askFollowUp: (question: string) => void;
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
  engine.dispatch(setAgentId(props.agentId!));

  const organizationId = selectOrganizationId(getState());
  const accessToken = selectAccessToken(getState());

  const followUpAgent = createFollowUpAgent(organizationId, props.agentId!);
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
    askFollowUp(question: string) {
      engine.dispatch(createFollowUpAnswer({question}));
      followUpAgent.runAgent(
        {
          forwardedProps: {
            q: question,
            conversationId: getState().followUpAnswers.conversationId,
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
