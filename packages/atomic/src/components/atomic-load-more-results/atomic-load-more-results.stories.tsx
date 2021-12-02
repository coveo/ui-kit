import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/LoadMoreResults',
  'atomic-load-more-results',
  {}
);

export default defaultModuleExport;
export const DefaultLoadMoreResults = exportedStory;
