import {NumberValue, SchemaDefinition, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';

export interface RegisterFoldingPayload {
  collectionField?: string;
  parentField?: string;
  childField?: string;
  maximumFoldedResults?: number;
}

const registerFoldingPayloadDefinition: SchemaDefinition<Required<
  RegisterFoldingPayload
>> = {
  collectionField: new StringValue(),
  parentField: new StringValue(),
  childField: new StringValue(),
  maximumFoldedResults: new NumberValue(),
};

export const registerFolding = createAction(
  'folding/register',
  (payload: RegisterFoldingPayload) =>
    validatePayload(payload, registerFoldingPayloadDefinition)
);
