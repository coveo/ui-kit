import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {FieldDescription} from '../../api/search/fields/fields-response.js';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client.js';
import {CoreEngine} from '../../app/engine.js';
import {fieldsReducer as fields} from '../../features/fields/fields-slice.js';
import {ConfigurationSection} from '../../state/state-sections.js';
import {
  registerFieldsToInclude,
  enableFetchAllFields,
  disableFetchAllFields,
  fetchFieldsDescription,
} from './fields-actions.js';

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
  /**
   * Enable fetch all fields from the index.
   *
   * This should not be used in any production environment, as it can have a negative impact on query execution time.
   *
   * Should be used for debugging purposes.
   *
   * @returns A dispatchable action.
   */
  enableFetchAllFields(): PayloadAction;
  /**
   * Disable fetch all fields from the index.
   *
   * @returns A dispatchable action.
   */
  disableFetchAllFields(): PayloadAction;
  /**
   * Fetch field descriptions from the index.
   *
   * @returns A dispatchable action.
   */
  fetchFieldsDescription(): AsyncThunkAction<
    FieldDescription[],
    void,
    AsyncThunkSearchOptions<ConfigurationSection>
  >;
}

/**
 * Loads the `fields` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadFieldActions(engine: CoreEngine): FieldActionCreators {
  engine.addReducers({fields});

  return {
    registerFieldsToInclude,
    enableFetchAllFields,
    disableFetchAllFields,
    fetchFieldsDescription,
  };
}
