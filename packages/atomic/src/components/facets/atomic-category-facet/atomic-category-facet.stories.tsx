import defaultStory from '../../../../.storybook/default-story';
import CategoryFacetDoc from './atomic-category-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/CategoryFacet',
  'atomic-category-facet',
  {field: 'geographicalhierarchy'},
  CategoryFacetDoc
);
export default defaultModuleExport;
export const DefaultCategoryFacet = exportedStory;
