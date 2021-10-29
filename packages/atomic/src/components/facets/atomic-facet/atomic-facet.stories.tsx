import defaultStory from '../../../../.storybook/default-story';
import FacetDoc from './atomic-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Facet',
  'atomic-facet',
  {field: 'objecttype'},
  FacetDoc
);

export default defaultModuleExport;
export const DefaultFacet = exportedStory;
