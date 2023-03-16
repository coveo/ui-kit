import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultsPerPage',
  'atomic-results-per-page',
  {}
);

export default defaultModuleExport;
export const DefaultResultsPerPage = exportedStory;
