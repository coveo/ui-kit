import {
  DidYouMeanData,
  QueryTriggerData,
} from '../../../../../../playwright/page-object/searchObjectWithDidYouMean';

const exampleOriginalQuery = 'original query';
const exampleCorrectedQuery = 'corrected query';

const exampleDidYouMeanData: DidYouMeanData = {
  correctedQuery: exampleCorrectedQuery,
  wordCorrections: [
    {
      correctedWord: exampleCorrectedQuery,
      originalWord: exampleOriginalQuery,
      length: exampleCorrectedQuery.length,
      offset: 0,
    },
  ],
};

const exampleQueryTriggerData: QueryTriggerData = {
  type: 'query',
  content: exampleCorrectedQuery,
};

export default {
  didYouMeanData: exampleDidYouMeanData,
  queryTriggerData: exampleQueryTriggerData,
};
