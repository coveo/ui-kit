import {interceptSearchResponse} from '../fixtures/fixture-common';
import {addTag, TagProps, TestFixture} from '../fixtures/test-fixture';
import {didYouMeanComponent} from './did-you-mean-selectors';

export const addDidYouMean =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    addTag(env, didYouMeanComponent, props);
  };

export const addDidYouMeanCorrectionToNextQuery = (
  correction: string,
  automatic: boolean
) =>
  interceptSearchResponse((response) => {
    response.queryCorrections = [
      {correctedQuery: correction, wordCorrections: []},
    ];
    if (automatic) {
      response.results = [];
    }
    return response;
  }, 1);

export const addQueryTriggerCorrectionToNextQuery = (correction: string) =>
  interceptSearchResponse((response) => {
    response.triggers = [{type: 'query', content: correction}];
    return response;
  }, 1);
