import defaultStory from '../../../.storybook/default-story';
import LoadMoreResultsDoc from './atomic-load-more-results.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/LoadMoreResults',
  'atomic-load-more-results',
  {},
  LoadMoreResultsDoc
);

export default defaultModuleExport;
export const DefaultLoadMoreResults = exportedStory;
