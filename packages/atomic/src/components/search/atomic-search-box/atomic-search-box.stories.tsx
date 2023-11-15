import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox',
  'atomic-search-box',
  {}
);

export default {...defaultModuleExport, title: 'Atomic/Searchbox'};
export const Default = exportedStory;
