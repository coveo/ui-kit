import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../..';
import {insightCaseContext} from '../../app/reducers';
import {setCaseContext, setCaseId, setCaseNumber} from './case-context-actions';

/**
 * The case context action creators.
 */
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

  /**
   * Sets the case id.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setCaseId(payload: string): PayloadAction<string>;

  /**
   * Sets the case number.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setCaseNumber(payload: string): PayloadAction<string>;
}

/**
 * Loads the `case context` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadCaseContextActions(
  engine: CoreEngine
): CaseContextActionCreators {
  engine.addReducers({insightCaseContext});

  return {
    setCaseContext,
    setCaseId,
    setCaseNumber,
  };
}
