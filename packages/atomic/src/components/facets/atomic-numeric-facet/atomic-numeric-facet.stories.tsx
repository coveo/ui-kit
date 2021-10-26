import defaultStory from '../../../../.storybook/default-story';
import NumericFacetDoc from './atomic-numeric-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet',
  'atomic-numeric-facet',
  {field: 'ytviewcount'},
  NumericFacetDoc
);

export default defaultModuleExport;
export const DefaultNumericFacet = exportedStory;
