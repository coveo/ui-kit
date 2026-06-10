import * as z from '@coveo/bueno/zod';
import {parametersDefinitionShape} from '../parameters/parameters-schema.js';
import type {CommerceSearchParameters} from './search-parameters-actions.js';

export const searchParametersDefinition = z.object({
  q: z.optional(z.string()),
  ...parametersDefinitionShape,
}) as unknown as z.ZodMiniType<Required<CommerceSearchParameters>>;
