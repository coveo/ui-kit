import {
  DidYouMeanLegacyData,
  DidYouMeanNextData,
  QueryTriggerData,
} from '../../../../../../playwright/page-object/searchObjectWithDidYouMean';

const exampleOriginalQuery = 'original query';
const exampleCorrectedQuery = 'corrected query';
const exampleQueryTriggered = 'query triggered';

const exampleDidYouMeanData: DidYouMeanLegacyData = {
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

const exampleDidYouMeanNextData: DidYouMeanNextData = {
  correctedQuery: exampleCorrectedQuery,
  wordCorrections: [
    {
      correctedWord: exampleCorrectedQuery,
      originalWord: exampleOriginalQuery,
      length: exampleCorrectedQuery.length,
      offset: 0,
    },
  ],
  originalQuery: exampleOriginalQuery,
};

const exampleQueryTriggerData: QueryTriggerData = {
  type: 'query',
  content: exampleQueryTriggered,
};

export default {
  originalQuery: exampleOriginalQuery,
  correctedQuery: exampleCorrectedQuery,
  triggeredQuery: exampleQueryTriggered,
  didYouMeanData: exampleDidYouMeanData,
  didYouMeanNextData: exampleDidYouMeanNextData,
  queryTriggerData: exampleQueryTriggerData,
};
