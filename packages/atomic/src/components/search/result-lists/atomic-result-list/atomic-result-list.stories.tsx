import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultList',
  'atomic-result-list',
  {}
);
export default defaultModuleExport;
export const DefaultResultList = exportedStory;
