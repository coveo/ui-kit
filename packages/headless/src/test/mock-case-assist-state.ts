import {getCaseAssistConfigurationInitialState} from '../features/case-assist-configuration/case-assist-configuration-state';
import {getCaseFieldInitialState} from '../features/case-field/case-field-state';
import {getCaseInputInitialState} from '../features/case-input/case-input-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getDebugInitialState} from '../features/debug/debug-state';
import {getDocumentSuggestionInitialState} from '../features/document-suggestion/document-suggestion-state';
import {CaseAssistAppState} from '../state/case-assist-app-state';

export function buildMockCaseAssistState(
  config: Partial<CaseAssistAppState> = {}
): CaseAssistAppState {
  return {
    configuration: getConfigurationInitialState(),
    caseAssistConfiguration: getCaseAssistConfigurationInitialState(),
    caseFields: getCaseFieldInitialState(),
    caseInputs: getCaseInputInitialState(),
    documentSuggestions: getDocumentSuggestionInitialState(),
    debug: getDebugInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
