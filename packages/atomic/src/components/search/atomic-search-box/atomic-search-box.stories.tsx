import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-search-box',
  {}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/Searchbox',
  id: 'atomic-search-box',
};
export const Default = exportedStory;
