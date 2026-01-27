import {createApi, retry} from '@reduxjs/toolkit/query';
import {dynamicBaseQuery} from '../answer-slice.js';

export const answerGenerationApi = createApi({
  reducerPath: 'answerGenerationApi',
  refetchOnMountOrArgChange: true,
  baseQuery: retry(dynamicBaseQuery, {maxRetries: 3}),
  endpoints: () => ({}),
});
