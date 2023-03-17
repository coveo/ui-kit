import defaultStory from '../../../../../../utils/atomic-storybook/.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox',
  'atomic-search-box',
  {}
);

export default defaultModuleExport;
export const DefaultSearchbox = exportedStory;
