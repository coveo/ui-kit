import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox',
  'atomic-search-box',
  {}
);

export default defaultModuleExport;
export const DefaultSearchbox = exportedStory;
