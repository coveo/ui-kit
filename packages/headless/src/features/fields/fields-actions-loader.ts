import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {fields} from '../../app/reducers';
import {registerFieldsToInclude} from './fields-actions';

/**
 * The field action creators.
 */
export interface FieldActionCreators {
  /**
   * Registers the fields to include in the query response.
   *
   * @param fields - The target fields (e.g., ["field1", "field2"]).
   * @returns A dispatchable action.
   */
  registerFieldsToInclude(fields: string[]): PayloadAction<string[]>;
}

/**
 * Loads the `fields` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadFieldActions(engine: Engine<object>): FieldActionCreators {
  engine.addReducers({fields});

  return {
    registerFieldsToInclude,
  };
}
