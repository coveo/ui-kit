import {getCaseAssistConfigurationInitialState} from '../features/case-assist-configuration/case-assist-configuration-state.js';
import {getCaseFieldInitialState} from '../features/case-field/case-field-state.js';
import {getCaseInputInitialState} from '../features/case-input/case-input-state.js';
import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {getDebugInitialState} from '../features/debug/debug-state.js';
import {getDocumentSuggestionInitialState} from '../features/document-suggestion/document-suggestion-state.js';
import {getResultPreviewInitialState} from '../features/result-preview/result-preview-state.js';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state.js';
import type {CaseAssistAppState} from '../state/case-assist-app-state.js';

export function buildMockCaseAssistState(
  config: Partial<CaseAssistAppState> = {}
): CaseAssistAppState {
  return {
    configuration: getConfigurationInitialState(),
    caseAssistConfiguration: getCaseAssistConfigurationInitialState(),
    caseField: getCaseFieldInitialState(),
    caseInput: getCaseInputInitialState(),
    documentSuggestion: getDocumentSuggestionInitialState(),
    debug: getDebugInitialState(),
    version: 'unit-testing-version',
    resultPreview: getResultPreviewInitialState(),
    searchHub: getSearchHubInitialState(),
    ...config,
  };
}
