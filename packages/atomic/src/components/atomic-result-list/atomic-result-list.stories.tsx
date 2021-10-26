import defaultStory from '../../../.storybook/default-story';
import ResultListDoc from './atomic-result-list.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultList',
  'atomic-result-list',
  {},
  ResultListDoc
);
export default defaultModuleExport;
export const DefaultResultList = exportedStory;
