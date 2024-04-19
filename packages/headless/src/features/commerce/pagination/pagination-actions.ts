import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';

export const solutionTypeDefinition = {
  solutionTypeId: requiredNonEmptyString,
};

interface SolutionTypePayload {
  solutionTypeId: string;
}

const setPageSizeDefinition = {
  ...solutionTypeDefinition,
  pageSize: new NumberValue({required: true, min: 0}),
};

type SetPageSizePayload = SolutionTypePayload & {
  pageSize: number;
};

export const setPageSize = createAction(
  'commerce/pagination/setPageSize',
  (payload: SetPageSizePayload) =>
    validatePayload(payload, setPageSizeDefinition)
);

const selectPageDefinition = {
  ...solutionTypeDefinition,
  page: new NumberValue({required: true, min: 0}),
};

type SelectPagePayload = SolutionTypePayload & {
  page: number;
};

export const selectPage = createAction(
  'commerce/pagination/selectPage',
  (payload: SelectPagePayload) => validatePayload(payload, selectPageDefinition)
);

export const nextPage = createAction(
  'commerce/pagination/nextPage',
  (payload: SolutionTypePayload) =>
    validatePayload(payload, solutionTypeDefinition)
);

export const previousPage = createAction(
  'commerce/pagination/previousPage',
  (payload: SolutionTypePayload) =>
    validatePayload(payload, solutionTypeDefinition)
);
