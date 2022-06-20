import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../..';
import {caseContext} from '../../app/reducers';
import {setCaseContext} from './case-context-actions';

export interface CaseContextActionCreators {
  /**
   * Sets the case context.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setCaseContext(
    payload: Record<string, string>
  ): PayloadAction<Record<string, string>>;
}

export function loadCaseContextActions(
  engine: CoreEngine
): CaseContextActionCreators {
  engine.addReducers({caseContext});

  return {
    setCaseContext,
  };
}
