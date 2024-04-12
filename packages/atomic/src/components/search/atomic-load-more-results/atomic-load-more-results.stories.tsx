import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-load-more-results',
  {}
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/LoadMoreResults',
  id: 'atomic-load-more-results',
};
export const Default = exportedStory;
