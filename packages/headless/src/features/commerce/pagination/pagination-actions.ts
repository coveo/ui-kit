import {NumberValue} from '@coveo/bueno';
import {createSolutionTypeAction} from '../common/actions';

const setPageSizeDefinition = {
  pageSize: new NumberValue({required: true, min: 0}),
};

interface SetPageSizePayload {
  pageSize: number;
}

export const setPageSize = createSolutionTypeAction<SetPageSizePayload>(
  'commerce/pagination/setPageSize',
  setPageSizeDefinition
);

const selectPageDefinition = {
  page: new NumberValue({required: true, min: 0}),
};

export const selectPage = createSolutionTypeAction(
  'commerce/pagination/selectPage',
  selectPageDefinition
);

export const nextPage = createSolutionTypeAction(
  'commerce/pagination/nextPage'
);

export const previousPage = createSolutionTypeAction(
  'commerce/pagination/previousPage'
);
