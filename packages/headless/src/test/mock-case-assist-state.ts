import {getCaseAssistInitialState} from '../features/case-assist/case-assist-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {CaseAssistAppState} from '../state/case-assist-app-state';

export function createMockCaseAssistState(
  config: Partial<CaseAssistAppState> = {}
): CaseAssistAppState {
  return {
    configuration: getConfigurationInitialState(),
    caseAssist: getCaseAssistInitialState(),
    ...config,
  };
}
