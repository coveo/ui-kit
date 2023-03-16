import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/QuerySummary',
  'atomic-query-summary',
  {}
);
export default defaultModuleExport;
export const DefaultQuerySummary = exportedStory;
