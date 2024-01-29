import {GeneratedAnswerAPIClient} from '../../../api/generated-answer/generated-answer-client';
import {CoreEngine} from '../../../app/engine';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {
  notifyStreamAborted,
  registerAnswerStreamManager,
  streamAnswer,
} from '../../../features/generated-answer/generated-answer-actions';
import {
  GeneratedAnswerSection,
  SearchSection,
  DebugSection,
} from '../../../state/state-sections';

type AnswerStreamManagerEngine = CoreEngine<
  GeneratedAnswerSection & SearchSection & DebugSection,
  ClientThunkExtraArguments<GeneratedAnswerAPIClient>
>;

export function buildAnswerStreamManager(engine: AnswerStreamManagerEngine) {
  if (engineHasAnswerStreamManager(engine)) {
    return;
  }

  let abortController: AbortController | undefined;
  const setAbortControllerRef = (ref: AbortController) => {
    abortController = ref;
  };

  function abortStream() {
    abortController?.abort();
    abortController = undefined;
  }

  engine.dispatch(registerAnswerStreamManager);
  engine.subscribe(() => {
    if (engine.state.generatedAnswer.shouldStartStream) {
      abortStream();
      engine.dispatch(
        streamAnswer({
          setAbortControllerRef,
        })
      );
    } else if (engine.state.generatedAnswer.shouldAbortStream) {
      abortStream();
      engine.dispatch(notifyStreamAborted);
    }
  });
}

function engineHasAnswerStreamManager(engine: AnswerStreamManagerEngine) {
  return engine.state.generatedAnswer.hasAnswerStreamManager;
}
