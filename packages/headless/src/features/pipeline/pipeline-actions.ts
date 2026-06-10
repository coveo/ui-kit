import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';

export const setPipeline = createAction('pipeline/set', (payload: string) =>
  validatePayload(payload, z.string())
);
