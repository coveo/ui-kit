import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/LoadMoreResults',
  'atomic-load-more-results',
  {}
);

export default defaultModuleExport;
export const DefaultLoadMoreResults = exportedStory;
