import {getCaseAssistInitialState} from '../features/case-assist/case-assist-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getDebugInitialState} from '../features/debug/debug-state';
import {CaseAssistAppState} from '../state/case-assist-app-state';

export function createMockCaseAssistState(
  config: Partial<CaseAssistAppState> = {}
): CaseAssistAppState {
  return {
    configuration: getConfigurationInitialState(),
    caseAssist: getCaseAssistInitialState(),
    context: getContextInitialState(),
    debug: getDebugInitialState(),
    ...config,
  };
}
