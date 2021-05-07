import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {Engine} from '../../app/headless-engine';
import {redirection} from '../../app/reducers';
import {
  checkForRedirection,
  CheckForRedirectionActionCreatorPayload,
  RedirectionState,
} from './redirection-actions';

export {CheckForRedirectionActionCreatorPayload};

/**
 * The redirection action creators.
 */
export interface RedirectionActionCreators {
  /**
   * Preprocesses the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  checkForRedirection(
    payload: CheckForRedirectionActionCreatorPayload
  ): AsyncThunkAction<
    string,
    CheckForRedirectionActionCreatorPayload,
    AsyncThunkSearchOptions<RedirectionState>
  >;
}

/**
 * Loads the `redirection` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadRedirectionActions(
  engine: Engine<object>
): RedirectionActionCreators {
  engine.addReducers({redirection});

  return {checkForRedirection};
}
