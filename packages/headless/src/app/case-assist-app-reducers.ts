import {ReducersMapObject} from 'redux';
import {CaseAssistAppState} from '../state/case-assist-app-state';
import {caseAssistReducer} from '../features/case-assist/case-assist-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {contextReducer} from '../features/context/context-slice';
import {debugReducer} from '../features/debug/debug-slice';

/**
 * The reducers required by the Case Assist app.
 */
export const caseAssistAppReducers: ReducersMapObject<CaseAssistAppState> = {
  configuration: configurationReducer,
  caseAssist: caseAssistReducer,
  context: contextReducer,
  debug: debugReducer,
};
