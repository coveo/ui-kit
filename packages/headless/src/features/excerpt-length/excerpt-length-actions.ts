import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export const setExcerptLength = createAction(
  'excerptLength/set',
  (length: number) => validatePayload(length, z.number().check(z.minimum(0)))
);
