import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';

export const ratingRangeFacetDefaultNumberOfIntervals = 5;
export const ratingRangeFacetLabel = 'Rating Range';
export const ratingRangeFacetField = 'rating';
export const addRatingRangeFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-rating-range-facet', props);
