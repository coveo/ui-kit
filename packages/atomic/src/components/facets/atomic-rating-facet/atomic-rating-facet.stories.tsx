import defaultStory from '../../../../.storybook/default-story';
import RatingFacetDoc from './atomic-rating-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/RatingFacet',
  'atomic-rating-facet',
  {field: 'snrating'},
  RatingFacetDoc
);

export default defaultModuleExport;
export const DefaultRatingFacet = exportedStory;
