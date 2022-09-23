import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';

export const ratingFacetDefaultNumberOfIntervals = 5;
export const ratingFacetLabel = 'Rating';
export const ratingFacetField = 'rating';
export const addRatingFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-rating-facet', props);
