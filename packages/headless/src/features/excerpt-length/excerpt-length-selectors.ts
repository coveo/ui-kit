import type {ExcerptLengthState} from './excerpt-length-state.js';

export const selectExcerptLength = (state: {
  excerptLength?: ExcerptLengthState;
}) => state.excerptLength?.length;
