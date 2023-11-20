import {StringValue} from '@coveo/bueno';
import {createAction} from '../../../ssr.index';
import {validatePayload} from '../../../utils/validate-payload';

export interface UpdateQueryActionCreatorPayload {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  query?: string;
}

export const updateQuery = createAction(
  'query/updateQuery',
  (payload: UpdateQueryActionCreatorPayload) =>
    validatePayload(payload, {
      query: new StringValue(),
    })
);
