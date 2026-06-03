import type {ItemClick} from '@coveo/relay-event-types';
import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine.js';

export interface SpotlightContentClickPayload {
  /**
   * The unique identifier of the spotlight content.
   */
  id: string;
  /**
   * The desktop image URL of the spotlight content.
   */
  desktopImage: string;
  /**
   * The 1-based position of the spotlight content in the result set.
   */
  position: number;
  /**
   * The response ID associated with the spotlight content.
   */
  responseId: string;
}

export const spotlightContentClick = createAsyncThunk<
  void,
  SpotlightContentClickPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/spotlight-content/click',
  async (payload: SpotlightContentClickPayload, {extra}) => {
    const {relay} = extra;
    const relayPayload: ItemClick = {
      responseId: payload.responseId,
      position: payload.position,
      itemMetadata: {
        uniqueFieldName: 'id',
        uniqueFieldValue: payload.id,
        url: payload.desktopImage,
      },
    };

    relay.emit('itemClick', relayPayload);
  }
);
