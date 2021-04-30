import {NumberValue, SchemaDefinition, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';

export interface RegisterFoldingPayload {
  collectionField?: string;
  parentField?: string;
  childField?: string;
  numberOfFoldedResults?: number;
}

export const foldingOptionsSchema: SchemaDefinition<Required<
  RegisterFoldingPayload
>> = {
  collectionField: new StringValue(),
  parentField: new StringValue(),
  childField: new StringValue(),
  numberOfFoldedResults: new NumberValue({min: 0}),
};

export const registerFolding = createAction(
  'folding/register',
  (payload: RegisterFoldingPayload) =>
    validatePayload(payload, foldingOptionsSchema)
);
