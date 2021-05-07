import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {QuickviewState} from '../../controllers/quickview/headless-quickview';

/**
 * Updates the maximum file size allowed for rendering in quick view.
 * @param maximumFileSize (number) The new maximum file size allowed for rendering in quick view.
 */
export const updateMaxFileSize = createAction(
  'quickview/updateMaximumFileSize',
  (payload: Partial<QuickviewState>) =>
    validatePayload(payload, {
      maximumFileSize: new NumberValue(),
      content: new StringValue(),
      resultHasPreview: new BooleanValue(),
      isLoading: new BooleanValue(),
    })
);
