import {answerApi} from '../../../api/knowledge/stream-answer-api.js';
import type {StreamAnswerAPIState} from '../../../api/knowledge/stream-answer-api-state.js';
import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../../app/engine.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {
  generateAnswerBeta,
  updateAnswerConfigurationId,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {generatedAnswerReducer as generatedAnswer} from '../../../features/generated-answer/generated-answer-slice.js';
import {multiTurnReducer as multiTurnConversation} from '../../../features/multi-turn-conversation/multi-turn-conversation-slice.js';
import type {MultiTurnConversationState as MultiTurnConversationStateInterface} from '../../../features/multi-turn-conversation/multi-turn-conversation-state.js';
import type {
  GeneratedAnswerSection,
  MultiTurnConversationSection,
  QuerySection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {subscribeToSearchRequest} from './headless-answerapi-generated-answer.js';

export interface MultiturnConversation extends Controller {
  ask(prompt: string): void;
  subscribeToSearchRequest(): void;
  state: MultiTurnConversationStateInterface;
}

export interface MultiturnConversationProps {
  answerConfigurationId?: string;
}

export interface MultiturnConversationState
  extends MultiTurnConversationStateInterface {}

export function buildMultiturnConversation(
  engine: SearchEngine | InsightEngine,
  props: MultiturnConversationProps = {}
): MultiturnConversation {
  if (!loadAnswerApiReducers(engine)) {
    throw loadReducerError;
  }
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );

  const controller = buildController(engine);
  const getState = () => engine.state;
  engine.dispatch(updateAnswerConfigurationId(props.answerConfigurationId!));
  engine.dispatch(
    updateResponseFormat({
      contentFormat: ['text/markdown', 'text/plain'],
    })
  );

  return {
    ...controller,
    get state() {
      return {
        ...getState().multiTurnConversation,
      };
    },
    subscribeToSearchRequest() {
      subscribeToSearchRequest(engine as SearchEngine<StreamAnswerAPIState>);
    },
    ask(prompt) {
      engine.dispatch(generateAnswerBeta(prompt));
    },
  };
}

function loadAnswerApiReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    QuerySection & {
      answer: ReturnType<typeof answerApi.reducer>;
    } & MultiTurnConversationSection
> {
  engine.addReducers({
    [answerApi.reducerPath]: answerApi.reducer,
    multiTurnConversation,
    generatedAnswer,
  });
  return true;
}
