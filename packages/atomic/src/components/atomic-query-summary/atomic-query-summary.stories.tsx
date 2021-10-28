import defaultStory from '../../../.storybook/default-story';
import QuerySummaryDoc from './atomic-query-summary.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/QuerySummary',
  'atomic-query-summary',
  {},
  QuerySummaryDoc
);
export default defaultModuleExport;
export const DefaultQuerySummary = exportedStory;
