import defaultStory from '../../../../.storybook/default-story';
import ColorFacetDoc from './atomic-color-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ColorFacet',
  'atomic-color-facet',
  {field: 'filetype'},
  ColorFacetDoc
);

export default defaultModuleExport;
export const DefaultColorFacet = exportedStory;
