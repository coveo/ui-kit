import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/LoadMoreResults',
  'atomic-load-more-results',
  {}
);

export default {...defaultModuleExport, title: 'Atomic/LoadMoreResults'};
export const Default = exportedStory;
