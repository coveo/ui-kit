import defaultStory from '../../../.storybook/default-story';
import ResultsPerPageDoc from './atomic-results-per-page.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultsPerPage',
  'atomic-results-per-page',
  {},
  ResultsPerPageDoc
);

export default defaultModuleExport;
export const DefaultResultsPerPage = exportedStory;
