import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildCoreInteractiveResult,
  InteractiveResult,
  InteractiveResultProps,
} from '../result-list/headless-core-interactive-result';

export interface SolutionTypeSubControllers {
  interactiveResult: (props: InteractiveResultProps) => InteractiveResult;
}

interface SubControllerProps {
  responseIdSelector: (state: CommerceEngineState) => string;
}

export function buildSolutionTypeSubControllers(
  engine: CommerceEngine,
  subControllerProps: SubControllerProps
): SolutionTypeSubControllers {
  return {
    interactiveResult(props: InteractiveResultProps) {
      return buildCoreInteractiveResult(engine, {
        ...props,
        responseIdSelector: subControllerProps.responseIdSelector,
      });
    },
  };
}
