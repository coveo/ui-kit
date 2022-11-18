import {EnumValue, SchemaDefinition} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {SortCriterion, SortBy} from './sort';

const criterionDefinition = {
  by: new EnumValue<SortBy>({
    enum: SortBy,
    required: true,
  }),
} as SchemaDefinition<SortCriterion>;

export const registerSortCriterion = createAction(
  'sort/register',
  (payload: SortCriterion) => validate(payload)
);

export const updateSortCriterion = createAction(
  'sort/update',
  (payload: SortCriterion) => validate(payload)
);

const validate = (payload: SortCriterion) =>
  validatePayload(payload, criterionDefinition);
