import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';

const desiredCountDefinition = new NumberValue({min: 0});

export const setDesiredCount = createAction(
  'automaticFacets/setDesiredCount',
  (payload: number) => validatePayload(payload, desiredCountDefinition)
);
